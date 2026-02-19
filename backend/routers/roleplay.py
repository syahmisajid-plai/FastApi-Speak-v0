# routers/roleplay.py
import os
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import re

from langchain_openai import ChatOpenAI
from langchain_core.prompts import (
    ChatPromptTemplate,
    SystemMessagePromptTemplate,
    HumanMessagePromptTemplate,
    MessagesPlaceholder,
)
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_community.chat_message_histories import SQLChatMessageHistory

from db import (
    get_session_history,
    create_roleplay_session,
    get_roleplay_session,
    increment_turn,  # 🔥 WAJIB
)


# fungsi dari db.py

router = APIRouter()
DATABASE_URL = os.getenv("DATABASE_URL")

# -----------------------------
# SCENARIO PROMPTS
# -----------------------------

SCENARIO_PROMPTS = {
    0: """
You are my English conversation partner for speaking practice.
Encourage friendly casual conversation.
Use simple English for beginners.
Short sentences max 15 words.
Correct mistakes gently.
Make user relaxed and confident.
Always END WITH A ONE-SENTENCE QUESTION.
""",
    1: """
You are a waiter in a restaurant.
Talk to user ordering food.
Simple English.
Friendly tone.
Short sentences max 15 words.
Correct mistakes gently.
Always END WITH A ONE-SENTENCE QUESTION.
""",
    2: """
You are a job interviewer.
Ask interview questions.
Help user practice answers.
Correct grammar politely.
Short sentences max 15 words.
Always END WITH A ONE-SENTENCE QUESTION.
""",
    3: """
You are airport staff.
Help with travel and boarding.
Simple English.
Friendly tone.
Short sentences max 15 words.
Always END WITH A ONE-SENTENCE QUESTION.
""",
    4: """
You are a shop assistant in a mall.
Help user buy things.
Simple English.
Friendly tone.
Short sentences max 15 words.
Always END WITH A ONE-SENTENCE QUESTION.
""",
}

SCENARIO_GOALS = {
    0: ("Have a casual conversation", 6),
    1: ("Order food and pay the bill", 6),
    2: ("Answer job interview questions", 8),
    3: ("Check in and board a flight", 6),
    4: ("Buy an item in a mall", 6),
}


# -----------------------------
# MODELS
# -----------------------------
class ClearRoleplayRequest(BaseModel):
    session_id: str
    scenario_id: int


class StreamRequest(BaseModel):
    session_id: str
    input: str
    scenario_id: int = 0  # default main scenario


class StartRoleplayRequest(BaseModel):
    session_id: str
    scenario_id: int


# -----------------------------
# LLM
# -----------------------------
llm = ChatOpenAI(
    model="gpt-4o-mini",
    streaming=True,
    max_tokens=32,
    temperature=0.7,
)


# -----------------------------
# ROUTES
# -----------------------------
@router.post("/roleplay/clear")
def clear_roleplay(req: ClearRoleplayRequest):

    session_key = f"{req.session_id}_sc{req.scenario_id}"

    if DATABASE_URL:
        conn_str = DATABASE_URL
    else:
        conn_str = "sqlite:///chat_history.db"

    history = SQLChatMessageHistory(
        session_id=session_key,
        connection_string=conn_str,
    )

    history.clear()

    print("🧹 Cleared roleplay history:", session_key)

    return {"status": "cleared"}


@router.post("/roleplay/start")
def start_roleplay(req: StartRoleplayRequest):

    session_key = f"{req.session_id}_sc{req.scenario_id}"

    # ambil goal
    goal, target_turn = SCENARIO_GOALS.get(req.scenario_id, ("Have a conversation", 6))

    # reset chat history
    history = get_session_history(session_key)
    history.clear()

    # buat roleplay session state
    create_roleplay_session(
        session_key=session_key,
        scenario_id=req.scenario_id,
        goal=goal,
        target_turn=target_turn,
    )

    print("🎯 START ROLEPLAY:", session_key, goal)

    return {
        "status": "started",
        "goal": goal,
        "target_turn": target_turn,
    }


@router.post("/stream_answer")
async def stream_answer(req: StreamRequest):

    print("🔥 STREAM")
    print("SESSION:", req.session_id)
    print("SCENARIO:", req.scenario_id)

    scenario_text = SCENARIO_PROMPTS.get(req.scenario_id, SCENARIO_PROMPTS[0])

    system_prompt = SystemMessagePromptTemplate.from_template(scenario_text)

    prompt = ChatPromptTemplate.from_messages(
        [
            system_prompt,
            MessagesPlaceholder(variable_name="history"),
            HumanMessagePromptTemplate.from_template("{input}"),
        ]
    )

    chain = prompt | llm | StrOutputParser()

    # 🔑 memory per scenario
    session_key = f"{req.session_id}_sc{req.scenario_id}"

    print("💾 TRY INCREMENT")
    increment_turn(session_key)
    print("✅ TURN UPDATED")

    runnable = RunnableWithMessageHistory(
        chain,
        get_session_history,
        input_messages_key="input",
        history_messages_key="history",
    )

    def event_stream():
        full_text = ""

        for chunk in runnable.stream(
            {"input": req.input},
            config={"configurable": {"session_id": session_key}},
        ):
            full_text += chunk
            yield f"data: {chunk}\n\n"

        session_data = get_roleplay_session(session_key)

        if session_data:
            print(f"TURN {session_data['current_turn']}/{session_data['target_turn']}")

    return StreamingResponse(event_stream(), media_type="text/event-stream")
