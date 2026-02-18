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

from db import get_session_history  # fungsi dari db.py

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

    runnable = RunnableWithMessageHistory(
        chain,
        get_session_history,
        input_messages_key="input",
        history_messages_key="history",
    )

    def event_stream():
        for chunk in runnable.stream(
            {"input": req.input},
            config={"configurable": {"session_id": session_key}},
        ):
            yield f"data: {chunk}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")
