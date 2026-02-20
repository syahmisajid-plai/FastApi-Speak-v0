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
    complete_roleplay,
)


# fungsi dari db.py

router = APIRouter()
DATABASE_URL = os.getenv("DATABASE_URL")

# -----------------------------
# SCENARIO IDENTITY PROMPTS
# -----------------------------

SCENARIO_PROMPTS = {
    0: """
You are an English conversation partner for speaking practice.
Encourage friendly casual conversation.
Make the user relaxed and confident.
""",
    1: """
You are a waiter in a restaurant.
Help the customer order food and pay the bill.
Be friendly and professional.
""",
    2: """
You are a job interviewer.
Conduct a professional interview.
Ask relevant questions about experience and skills.
""",
    3: """
You are airport staff.
Help passengers with check-in and boarding.
Be clear and helpful.
""",
    4: """
You are a shop assistant in a mall.
Help customers find and buy items.
Be friendly and helpful.
""",
}

# -----------------------------
# GLOBAL STYLE RULES
# -----------------------------

GLOBAL_STYLE_RULES = """
GENERAL RULES:
- Use simple English.
- Short sentences, maximum 15 words.
- Correct grammar politely.
- Be natural and conversational.
- Do not give long explanations.
"""

SCENARIO_GOALS = {
    0: ("Have a casual conversation", 3),
    1: ("Order food and pay the bill", 3),
    2: ("Answer job interview questions", 3),
    3: ("Check in and board a flight", 3),
    4: ("Buy an item in a mall", 3),
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

    # -----------------------------
    # SESSION KEY & LOAD SESSION
    # -----------------------------
    session_key = f"{req.session_id}_sc{req.scenario_id}"
    session_data = get_roleplay_session(session_key)

    # ❌ Cek session hanya untuk roleplay (id > 0)
    if req.scenario_id > 0 and not session_data:
        return {"error": "Roleplay not started"}

    # ❌ Stop final hanya untuk roleplay
    if req.scenario_id > 0 and session_data.get("status") == "done":
        print("⛔ Session already completed")
        return {"message": "Session finished. Start new roleplay."}

    # -----------------------------
    # TURN INFO
    # -----------------------------
    if req.scenario_id == 0:
        # main scenario: unlimited
        current_turn = 0
        next_turn = 0
        target_turn = None
        is_final_turn = False
    else:
        current_turn = session_data["current_turn"]
        target_turn = session_data["target_turn"]
        next_turn = current_turn + 1
        is_final_turn = next_turn >= target_turn

    goal = session_data["goal"] if session_data else SCENARIO_PROMPTS[0]

    print("CURRENT TURN:", current_turn)
    print("NEXT TURN:", next_turn)
    print("TARGET TURN:", target_turn)
    print("IS FINAL TURN:", is_final_turn)

    # -----------------------------
    # BEHAVIOR RULES
    # -----------------------------
    if req.scenario_id == 0:
        behavior_rule = """
        MAIN SCENARIO:
        - Free conversation.
        - No forced goodbye or ending.
        - Short, casual, friendly English.
        """
    else:
        remaining_turn = target_turn - next_turn
        if remaining_turn <= 0:
            behavior_rule = """
            FINAL TURN:
            - This is the last message.
            - You MUST finish the interaction.
            - You MUST say a polite goodbye.
            - You MUST NOT ask any question.
            - Do NOT offer further help.
            - Do NOT continue the shopping process.
            - End with a closing sentence like:
            "Thank you for visiting. Have a nice day."
            """
        elif remaining_turn == 1:
            behavior_rule = """
            NEAR FINAL TURN:
            - Start wrapping up the topic.
            - Ask one light closing question.
            - Prepare to finish the conversation soon.
            """
        else:
            behavior_rule = """
            NORMAL TURN:
            - Continue the conversation.
            - End with ONE short question.
            """

    # -----------------------------
    # SYSTEM PROMPT
    # -----------------------------
    base_prompt = SCENARIO_PROMPTS.get(req.scenario_id, SCENARIO_PROMPTS[0])
    enriched_prompt = f"""
    {base_prompt}

    {GLOBAL_STYLE_RULES}

    ROLEPLAY GOAL:
    {goal}

    TURN INFO:
    Current Turn: {next_turn}
    Target Turn: {target_turn}

    {behavior_rule}
    """
    print("\n================ FINAL SYSTEM PROMPT ================")
    print(enriched_prompt)
    print("=====================================================\n")

    system_prompt = SystemMessagePromptTemplate.from_template(enriched_prompt)
    prompt = ChatPromptTemplate.from_messages(
        [
            system_prompt,
            MessagesPlaceholder(variable_name="history"),
            HumanMessagePromptTemplate.from_template("{input}"),
        ]
    )

    chain = prompt | llm | StrOutputParser()
    runnable = RunnableWithMessageHistory(
        chain,
        get_session_history,
        input_messages_key="input",
        history_messages_key="history",
    )

    # -----------------------------
    # STREAM RESPONSE
    # -----------------------------
    def event_stream():
        full_text = ""

        for chunk in runnable.stream(
            {"input": req.input},
            config={"configurable": {"session_id": session_key}},
        ):
            full_text += chunk
            yield f"data: {chunk}\n\n"

        # -----------------------------
        # INCREMENT TURN & COMPLETE ROLEPLAY
        # -----------------------------
        if req.scenario_id > 0:
            increment_turn(session_key)

            if is_final_turn:
                complete_roleplay(session_key)
                print("🏁 ROLEPLAY COMPLETED")
                yield "data: __ROLEPLAY_END__\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")
