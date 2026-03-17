# routers/roleplay.py

import os
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage

from db import (
    get_session_history,
    create_roleplay_session,
    get_roleplay_session,
    increment_turn,
    complete_roleplay,
    get_random_scenario,
    get_scenario_checklist,
    get_scenario,
)

router = APIRouter(prefix="/roleplay", tags=["Roleplay"])

DATABASE_URL = os.getenv("DATABASE_URL")


# -----------------------------
# MODELS
# -----------------------------


class GenerateRequest(BaseModel):
    difficulty: str


class StartRoleplayRequest(BaseModel):
    session_id: str
    scenario_id: int


class StreamRequest(BaseModel):
    session_id: str
    scenario_id: int
    input: str


#
# -----------------------------
# LLM
# -----------------------------

llm = ChatOpenAI(
    model="gpt-4o-mini",
    streaming=True,
    temperature=0.7,
    max_tokens=80,
)


# -----------------------------
# GENERATE RANDOM SCENARIO
# -----------------------------


@router.get("/generate")
def generate_roleplay(difficulty: str):

    scenario = get_random_scenario(difficulty)

    if not scenario:
        return {"error": "No scenario found"}

    checklist = get_scenario_checklist(scenario["id"])

    return {
        "scenario_id": scenario["id"],
        "category": scenario["category"],  # 🔥 TAMBAHAN
        "theme": scenario["theme"],
        "difficulty": scenario["difficulty"],
        "user_role": scenario["user_role"],
        "ai_role": scenario["ai_role"],
        "situation": scenario["situation"],
        "goal": scenario["goal"],
        "target_turn": scenario["target_turn"],
        "checklist": [
        item["description"]
        for item in sorted(checklist, key=lambda x: x["step_order"])
]
    }


# -----------------------------
# START ROLEPLAY SESSION
# -----------------------------


@router.post("/start")
def start_roleplay(req: StartRoleplayRequest):

    scenario = get_scenario(req.scenario_id)

    if not scenario:
        return {"error": "Scenario not found"}

    session_key = f"{req.session_id}_sc{req.scenario_id}"

    history = get_session_history(session_key)
    history.clear()

    create_roleplay_session(
        session_key=session_key,
        scenario_id=req.scenario_id,
        goal=scenario["goal"],
        target_turn=scenario["target_turn"],
    )

    return {
        "status": "started",
        "goal": scenario["goal"],
        "target_turn": scenario["target_turn"],
    }


# -----------------------------
# STREAM ROLEPLAY RESPONSE
# -----------------------------


@router.post("/stream_answer")
async def stream_answer(req: StreamRequest):

    scenario = get_scenario(req.scenario_id)

    if not scenario:
        return {"error": "Scenario not found"}

    session_key = f"{req.session_id}_sc{req.scenario_id}"
    session_data = get_roleplay_session(session_key)

    if not session_data:
        return {"error": "Roleplay not started"}

    if session_data["status"] == "completed":
        return {"message": "Roleplay already finished"}

    # -----------------------------
    # TURN LOGIC
    # -----------------------------

    current_turn = session_data["current_turn"]
    target_turn = session_data["target_turn"]

    next_turn = current_turn + 1
    is_final_turn = next_turn >= target_turn

    checklist = get_scenario_checklist(req.scenario_id)

    checklist_text = "\n".join(
        [f"- {item['description']}" for item in checklist]
    )

    # -----------------------------
    # SYSTEM PROMPT
    # -----------------------------

    system_prompt = f"""
    You are roleplaying as: {scenario["ai_role"]}

    User role:
    {scenario["user_role"]}

    Situation:
    {scenario["situation"]}

    Goal:
    {scenario["goal"]}

    Conversation steps the user should try:
    {checklist_text}

    Stay in character.
    Encourage the user to speak English.
    Respond naturally.
    Keep responses short.
    """

    messages = [
        SystemMessage(content=system_prompt),
        *get_session_history(session_key).messages,
        HumanMessage(content=req.input),
    ]

    # -----------------------------
    # STREAM RESPONSE
    # -----------------------------

    async def event_stream():

        full_text = ""

        response = llm.stream(messages)

        for chunk in response:
            token = chunk.content or ""
            full_text += token
            yield f"data: {token}\n\n"

        # update turn
        increment_turn(session_key)

        if is_final_turn:
            complete_roleplay(session_key)
            yield "data: __ROLEPLAY_END__\n\n"

        history = get_session_history(session_key)
        history.add_user_message(req.input)
        history.add_ai_message(full_text)

    return StreamingResponse(event_stream(), media_type="text/event-stream")
