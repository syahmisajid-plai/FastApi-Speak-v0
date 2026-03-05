# routers/daily_story.py

import os
import json
from datetime import datetime

from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from langchain_openai import ChatOpenAI
from langchain_core.prompts import (
    ChatPromptTemplate,
    SystemMessagePromptTemplate,
    HumanMessagePromptTemplate,
    MessagesPlaceholder,
)
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables.history import RunnableWithMessageHistory

from fastapi import Query

from db import get_session_history


router = APIRouter(prefix="/daily-story", tags=["Daily Story"])


# -----------------------------
# MODEL
# -----------------------------
class StreamRequest(BaseModel):
    session_id: str
    input: str


# -----------------------------
# SESSION PROGRESS TRACKING
# -----------------------------
session_progress = {}


def get_progress(session_id):

    if session_id not in session_progress:
        session_progress[session_id] = {"turns": 0, "words": 0, "transcript": ""}

    return session_progress[session_id]


# -----------------------------
# COMPLETION CHECK
# -----------------------------
def check_completion(progress):

    if progress["turns"] >= 2 and progress["words"] >= 10:
        return True

    return False


# -----------------------------
# TIME DETECTION
# -----------------------------
def detect_phase():

    hour = datetime.now().hour

    if hour < 11:
        return "morning"

    elif hour < 16:
        return "afternoon"

    elif hour < 19:
        return "evening"

    else:
        return "night"


# -----------------------------
# DAILY STORY PROMPTS
# -----------------------------
DAILY_PROMPTS = {
    "morning": """
You are an English speaking partner helping the user start the day.

Ask about:
- morning plans
- sleep quality
- today's activities

Rules:
- use simple English
- max 15 words
- friendly tone
- ask one short question
""",
    "afternoon": """
You are an English speaking partner helping the user reflect on the day.

Ask about:
- morning activities
- lunch
- afternoon plans

Rules:
- simple English
- max 15 words
- casual tone
- ask one short question
""",
    "evening": """
You are an English speaking partner helping the user reflect on the day.

Ask about:
- what they did today
- interesting moments
- dinner plans

Rules:
- simple English
- max 15 words
- friendly tone
- ask one short question
""",
    "night": """
You are an English speaking partner helping the user reflect on their whole day.

Ask about:
- what happened today
- best moment today
- what they learned

Rules:
- simple English
- max 15 words
- calm friendly tone
- ask one short question
""",
}


# -----------------------------
# LLM
# -----------------------------
llm = ChatOpenAI(
    model="gpt-4o-mini",
    streaming=True,
    max_tokens=40,
    temperature=0.7,
)


# -----------------------------
# STREAM DAILY STORY
# -----------------------------
@router.post("/stream_answer")
async def stream_daily_story(req: StreamRequest):

    session_key = f"{req.session_id}_daily"

    # -----------------------------
    # UPDATE PROGRESS
    # -----------------------------
    progress = get_progress(session_key)

    progress["turns"] += 1
    progress["words"] += len(req.input.split())
    progress["transcript"] += " " + req.input

    # -----------------------------
    # DETECT PHASE
    # -----------------------------
    phase = detect_phase()

    print("🌤 DAILY STORY PHASE:", phase)
    print("📊 TURNS:", progress["turns"])
    print("📝 WORDS:", progress["words"])

    base_prompt = DAILY_PROMPTS.get(phase)

    system_prompt = SystemMessagePromptTemplate.from_template(base_prompt)

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
    # CHECK COMPLETION
    # -----------------------------
    completed = check_completion(progress)

    # -----------------------------
    # STREAM RESPONSE
    # -----------------------------
    def event_stream():

        for chunk in runnable.stream(
            {"input": req.input},
            config={"configurable": {"session_id": session_key}},
        ):
            yield f"data: {chunk}\n\n"

        # send meta event after streaming
        meta = {"completed": completed, "phase": phase}

        yield f"event: meta\ndata: {json.dumps(meta)}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")


#
@router.get("/progress")
async def get_daily_progress(session_id: str = Query(...)):
    progress = get_progress(f"{session_id}_daily")
    return {
        "morning": (
            check_completion(
                {
                    "turns": progress["turns"],
                    "words": progress["words"],
                    "transcript": progress["transcript"],
                }
            )
            if detect_phase() == "morning"
            else False
        ),
        "afternoon": False,
        "evening": False,
        "night": False,
    }
