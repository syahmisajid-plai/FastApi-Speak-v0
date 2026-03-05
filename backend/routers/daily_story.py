# routers/daily_story.py

import os
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

from db import get_session_history


router = APIRouter(prefix="/daily-story", tags=["Daily Story"])


# -----------------------------
# MODEL
# -----------------------------
class StreamRequest(BaseModel):
    session_id: str
    input: str


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
You are testing time awareness.

Say:
"Good morning!"

Then mention the current time you received.

Example:
Good morning! It is currently 08:00.
How is your morning so far?
""",
    "afternoon": """
You are testing time awareness.

Say:
"Good afternoon!"

Then mention the current time you received.

Example:
Good afternoon! It is currently 14:00.
What did you do this morning?
""",
    "evening": """
You are testing time awareness.

Say:
"Good evening!"

Then mention the current time you received.

Example:
Good evening! It is currently 18:30.
How was your afternoon?
""",
    "night": """
You are testing time awareness.

Say:
"Good evening!"

Then mention the current time you received.

Example:
Good evening! It is currently 21:00.
What was the best moment today?
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

    # detect time phase
    phase = detect_phase()

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

    print("🌤 DAILY STORY PHASE:", phase)

    # -----------------------------
    # STREAM RESPONSE
    # -----------------------------
    def event_stream():

        for chunk in runnable.stream(
            {"input": req.input},
            config={"configurable": {"session_id": session_key}},
        ):
            yield f"data: {chunk}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")
