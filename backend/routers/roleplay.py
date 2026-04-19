# routers/roleplay.py

import os
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage

from db import (

    get_messages, save_message,
    clear_session_messages,
    create_roleplay_session,
    get_roleplay_session,
    increment_turn,
    complete_roleplay,
    get_random_scenario,
    get_scenario_checklist,
    get_scenario,
    get_keywords_by_scenario,
    get_contexts_by_scenario,
)

router = APIRouter(prefix="/roleplay", tags=["Roleplay"])

DATABASE_URL = os.getenv("DATABASE_URL")


# -----------------------------
# MODELS
# -----------------------------


class GenerateRequest(BaseModel):
    category: str


class StartRoleplayRequest(BaseModel):
    session_id: str
    user_id: str   # ✅ ini yang kurang
    scenario_id: int


class StreamRequest(BaseModel):
    user_id: str
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
def generate_roleplay(category: str):
    try:
        scenario = get_random_scenario(category)

        if not scenario:
            return {"error": "No scenario found"}

        contexts = get_contexts_by_scenario(scenario["id"]) or []

        context_map = {
            item["context_key"]: {
                "type": item["context_type"],
                "data": item["context_data"],
            }
            for item in contexts
        }

        checklist = get_scenario_checklist(scenario["id"]) or []
        keywords = get_keywords_by_scenario(scenario["id"])

        keyword_map = {}

        for item in keywords:
            step = item["step_key"]
            kw = item["keyword"]

            if step not in keyword_map:
                keyword_map[step] = []

            keyword_map[step].append(kw)

        checklist_sorted = sorted(checklist, key=lambda x: x.get("step_order", 0))

        checklist_clean = [
            {
                "step_key": item["step_key"],
                "description": item["description"],
                "step_order": item.get("step_order", 0),
                "keywords": keyword_map.get(item["step_key"], []),
                # optional (debug / internal)
                "context_key": item.get("context_key"),
                # ✅ INI YANG PENTING
                "context_type": (
                    context_map.get(item.get("context_key"), {}).get("type")
                    if item.get("context_key")
                    else None
                ),
                "context_data": (
                    context_map.get(item.get("context_key"), {}).get("data")
                    if item.get("context_key")
                    else None
                ),
            }
            for item in checklist_sorted
        ]

        return {
            "scenario_id": scenario.get("id"),
            "category": scenario.get("category"),
            "theme": scenario.get("theme"),
            "difficulty": scenario.get("difficulty"),
            "user_role": scenario.get("user_role"),
            "ai_role": scenario.get("ai_role"),
            "situation": scenario.get("situation"),
            "goal": scenario.get("goal"),
            "target_turn": scenario.get("target_turn"),
            "checklist": checklist_clean,
        }

    except Exception as e:
        import traceback

        print("❌ ERROR IN /generate:")
        traceback.print_exc()

        return {"error": str(e)}


# -----------------------------
# START ROLEPLAY SESSION
# -----------------------------


@router.post("/start")
def start_roleplay(req: StartRoleplayRequest):

    scenario = get_scenario(req.scenario_id)

    if not scenario:
        return {"error": "Scenario not found"}

    session_key = f"{req.session_id}_{req.user_id}_sc{req.scenario_id}_roleplay"

    # 🔥 HAPUS history lama dari DB
    clear_session_messages(session_key)

    # tetap pakai ini
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

    session_key = f"{req.session_id}_{req.user_id}_sc{req.scenario_id}_roleplay"
    # session_key = f"{req.session_id}_sc{req.scenario_id}"
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

    checklist_text = "\n".join([f"- {item['description']}" for item in checklist])

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

    # 🔥 ambil history dari DB
    rows = get_messages(session_key)

    history_messages = []
    for role, content in rows:
        if role == "user":
            history_messages.append(HumanMessage(content=content))
        elif role == "assistant":
            history_messages.append(AIMessage(content=content))

    messages = [
        SystemMessage(content=system_prompt),
        *history_messages,
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

        # -----------------------------
        # UPDATE TURN
        # -----------------------------
        increment_turn(session_key)

        if is_final_turn:
            complete_roleplay(session_key)
            yield "data: __ROLEPLAY_END__\n\n"

        # -----------------------------
        # SAVE KE DB
        # -----------------------------
        save_message(session_key, req.user_id, "roleplay", "user", req.input, {
            "scenario_id": req.scenario_id,
            "turn": next_turn
        })

        save_message(session_key, req.user_id, "roleplay", "assistant", full_text, {
            "scenario_id": req.scenario_id,
            "turn": next_turn
        })

    return StreamingResponse(event_stream(), media_type="text/event-stream")
