# routers/daily_story.py

import os
import json
from datetime import datetime, date

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

import json
from uuid import UUID

from fastapi import Query

from db import (
    get_session_history,
    complete_daily_story_phase,
    create_daily_story_session,
    get_daily_story_session,

    get_daily_history,

    # summary
    get_daily_session,
    get_summary,
    get_human_messages,
    save_summary,
)


router = APIRouter(prefix="/daily-story", tags=["Daily Story"])


# -----------------------------
# MODEL
# -----------------------------
class StreamRequest(BaseModel):
    user_id:str
    session_id: str
    input: str

class SummaryRequest(BaseModel):
    user_id: UUID
    story_date: date

# -----------------------------
# SESSION PROGRESS TRACKING
# -----------------------------
session_progress = {}


def get_progress(session_id):
    if session_id not in session_progress:
        # inisialisasi semua phase
        session_progress[session_id] = {
            "morning": {
                "turns": 0,
                "words": 0,
                "transcript": "",
                "completed": False,
                "ready": False,
            },
            "afternoon": {
                "turns": 0,
                "words": 0,
                "transcript": "",
                "completed": False,
                "ready": False,
            },
            "evening": {
                "turns": 0,
                "words": 0,
                "transcript": "",
                "completed": False,
                "ready": False,
            },
            "night": {
                "turns": 0,
                "words": 0,
                "transcript": "",
                "completed": False,
                "ready": False,
            },
        }
    return session_progress[session_id]


# sssssssshht

# -----------------------------
# NARRATIVE DETECTION
# -----------------------------
STORY_VERBS = [
    "woke",
    "went",
    "had",
    "did",
    "played",
    "saw",
    "ate",
    "cooked",
    "studied",
    "walked",
    "morning",
]

STORY_MARKERS = ["then", "after", "later", "next", "before", "morning"]


def is_storytelling(text: str) -> bool:
    text_lower = text.lower()
    verbs_count = sum(1 for verb in STORY_VERBS if verb in text_lower)
    markers_count = sum(1 for marker in STORY_MARKERS if marker in text_lower)

    # ---- LOGGING ----
    print("📝 Text:", text)
    print("🔹 Verbs found:", verbs_count)
    print("🔹 Markers found:", markers_count)

    # jika ada minimal 2 verbs atau 1 verb + 1 marker → valid story
    if verbs_count >= 2 or (verbs_count >= 1 and markers_count >= 1):
        print("✅ This is considered a story.")
        return True
    else:
        print("❌ Not a story yet.")
        return False


# -----------------------------
# COMPLETION CHECK
# -----------------------------
def check_completion(progress):
    if (
        progress["turns"] >= 1
        and progress["words"] >= 5
        # and is_storytelling(progress["transcript"])
    ):
        print("PHASE COMPLETE")
        return True
    return False


# -----------------------------
# TIME DETECTION
# -----------------------------
def detect_phase(progress):
    phases_order = ["morning", "afternoon", "evening", "night"]

    # cek phase pertama yang belum completed
    for phase in phases_order:
        if not progress[phase]["completed"]:
            return phase

    # kalau semua selesai, kembalikan phase sekarang berdasarkan jam
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
# DAILY STORY PROMPTS EFFICIENT
# -----------------------------

# Rules umum untuk semua sesi dengan penggalian kegiatan
DAILY_RULES = """
You are a friendly English speaking partner helping the user practice storytelling about their day.

Conversation goal:
The user tells their daily story from morning until night.

Rules:

1. If the user makes a grammar, tense, or wording mistake, gently suggest a better sentence.

Use this format:

You could say:
"correct sentence"

2. Do NOT repeat the user's incorrect sentence.

3. If the sentence is already correct, do not show a correction.

4. After the correction (if any), respond naturally to the story.

5. Encourage the user to use past tense because they are describing what happened today.

6. Ask ONLY ONE short question (maximum 15 words).

7. Questions must help the user continue their story chronologically.

8. If the user gives a very short answer, encourage them to add more detail.

9. Keep the tone friendly, supportive, and conversational.

Example:

User: "I wake up at 7 and eat bread"

Assistant:

You could say:
"I woke up at 7 and ate bread."

Nice start! What did you do after breakfast?
"""

# Topics to guide storytelling from morning to night
DAILY_TOPICS = {
    "morning": [
        "when they woke up",
        "their breakfast",
        "their first activities in the morning",
    ],
    "afternoon": [
        "what they did before lunch",
        "their lunch",
        "their afternoon activities",
    ],
    "evening": [
        "what they did after work or study",
        "interesting or memorable moments",
        "their dinner",
    ],
    "night": [
        "how their day ended",
        "the best moment of the day",
        "something they learned today",
    ],
}


# Gabungkan rules + topik saat memanggil
def get_daily_prompt(session: str) -> str:
    topics = "\n- ".join(DAILY_TOPICS.get(session, []))
    return f"You are an English-speaking partner helping the user in the {session}.\n\nAsk about:\n- {topics}\n\n{DAILY_RULES}"


USE_STREAMING = True  # 🔴 matikan dulu streaming

# -----------------------------
# LLM
# -----------------------------
llm = ChatOpenAI(
    model="gpt-4o-mini",
    streaming=USE_STREAMING,
    max_tokens=40,
    temperature=0.7,
)


# -----------------------------
# STREAM DAILY STORY
# -----------------------------
@router.post("/stream_answer")
async def stream_daily_story(req: StreamRequest):

    today = str(datetime.now().date())

    base_session_key = f"{req.session_id}_{req.user_id}_daily_{today}"

    progress = get_progress(base_session_key)

    phase = detect_phase(progress)

    session_key = f"{base_session_key}_{phase}"

    # tetap gunakan base_session_key untuk update progress
    phase_progress = progress[phase]

    # progress["turns"] += 1
    # progress["words"] += len(req.input.split())
    # progress["transcript"] += " " + req.input

    phase_progress = progress[phase]
    phase_progress["turns"] += 1
    phase_progress["words"] += len(req.input.split())
    phase_progress["transcript"] += " " + req.input
    # keep last 200 chars only
    phase_progress["transcript"] = phase_progress["transcript"][-200:]

    if not phase_progress["ready"] and check_completion(phase_progress):
        phase_progress["ready"] = True

    print("🌤 DAILY STORY PHASE:", phase)
    print("📊 TURNS:", phase_progress["turns"])
    print("📝 WORDS:", phase_progress["words"])

    print("📊 PHASE STATE:", phase_progress)

    base_prompt = get_daily_prompt(phase)

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
    completed = phase_progress["completed"]

    # -----------------------------
    # RESPONSE
    # -----------------------------
    if USE_STREAMING:

        def event_stream():

            for chunk in runnable.stream(
                {"input": req.input},
                config={"configurable": {"session_id": session_key}},
            ):
                yield f"data: {chunk}\n\n"

            # send meta event after streaming
            meta = {
                "phase": phase,
                "ready": phase_progress["ready"],
                "completed": phase_progress["completed"],
            }

            yield f"event: meta\ndata: {json.dumps(meta)}\n\n"

        return StreamingResponse(event_stream(), media_type="text/event-stream")

    else:

        # NON STREAM MODE
        response = runnable.invoke(
            {"input": req.input},
            config={"configurable": {"session_id": session_key}},
        )

        return {
            "text": response,
            "phase": phase,
            "ready": phase_progress["ready"],
            "completed": phase_progress["completed"],
        }


#
@router.get("/progress")
async def get_daily_progress(session_id: str, user_id: str):
    today = str(datetime.now().date())

    session_key = f"{session_id}_{user_id}_daily_{today}"

    row = get_daily_story_session(session_key, user_id, today)

    if not row:
        return {
            "morning": False,
            "afternoon": False,
            "evening": False,
            "night": False,
        }

    return {
        "morning": bool(row["morning_completed"]),
        "afternoon": bool(row["afternoon_completed"]),
        "evening": bool(row["evening_completed"]),
        "night": bool(row["night_completed"]),
    }


class NextPhaseRequest(BaseModel):
    session_id: str
    user_id: str


@router.post("/next_phase")
async def next_phase(req: NextPhaseRequest):
    today = str(datetime.now().date())
    session_key = f"{req.session_id}_{req.user_id}_daily_{today}"

    # 🔍 DEBUG
    print("===== NEXT PHASE DEBUG =====")
    print("session_id (req):", req.session_id)
    print("user_id (req):", req.user_id)
    print("today:", today)
    print("constructed session_key:", session_key)

    # pastikan row ada
    if not get_daily_story_session(session_key, req.user_id, today):
        create_daily_story_session(session_key, req.user_id, today)

    progress = get_progress(session_key)
    phases = ["morning", "afternoon", "evening", "night"]

    for p in phases:
        if progress[p]["ready"] and not progress[p]["completed"]:
            progress[p]["completed"] = True
            progress[p]["ready"] = False

            # 🔹 update DB
            complete_daily_story_phase(session_key, req.user_id, today, p)

            return {"completed_phase": p}

    return {"message": "no phase ready"}

@router.get("/history")
def daily_history(session_id: str):
    return get_daily_history(session_id)

def is_complete(session: dict) -> bool:
    """
    Cek apakah semua phase daily sudah selesai
    """

    if not session:
        return False

    required_fields = [
        "morning_completed",
        "afternoon_completed",
        "evening_completed",
        "night_completed",
    ]

    return all(session.get(field, 0) == 1 for field in required_fields)

def generate_summary(messages):
    """
    Generate structured summary from conversation messages using LangChain
    """

    # Convert messages → readable conversation text
    conversation_text = []

    for msg in messages:
        role = msg.get("type")
        content = msg.get("data", {}).get("content", "")

        if role == "human":
            conversation_text.append(f"User: {content}")
        elif role == "ai":
            conversation_text.append(f"AI: {content}")

    conversation_text = "\n".join(conversation_text)

    # Prompt template
    prompt = ChatPromptTemplate.from_messages([
        SystemMessagePromptTemplate.from_template("""
    You are an expert English tutor assistant.

    Your task is to analyze a conversation and produce a structured summary in JSON format.

    You MUST return ONLY valid JSON with the following structure:

    {
    "summary_text": string,
    "key_points": list of strings,
    "vocab_used": list of strings,
    "mistakes": list of objects with:
        - mistake: string
        - correction: string
    }

    Guidelines:
    - summary_text: concise paragraph summarizing the conversation
    - key_points: main learning points
    - vocab_used: important English words/phrases used
    - mistakes: only include user mistakes with corrections
    - If no mistakes, return empty list
    """),
            HumanMessagePromptTemplate.from_template("""
    Conversation:
    {conversation}

    Return JSON only.
    """)
        ])

    # Chain
    chain = prompt | llm | StrOutputParser()

    # Invoke
    response = chain.invoke({
        "conversation": conversation_text
    })

    # Parse JSON safely
    try:
        result = json.loads(response)
    except:
        result = {
            "summary_text": response,
            "key_points": [],
            "vocab_used": [],
            "mistakes": []
        }

    return result

@router.post("/summary/generate")
async def generate_daily_summary(req: SummaryRequest):

    try:
        print("\n========== [START] generate_daily_summary ==========")
        print(f"[REQUEST] user_id={req.user_id}, story_date={req.story_date}")

        # 1. ambil session
        print("[STEP 1] Fetching session...")
        session = get_daily_session(req.user_id, req.story_date)
        print(f"[STEP 1 RESULT] session={session}")

        if not session:
            print("[EXIT] Session not found")
            return {"status": "session_not_found"}

        # 2. validasi completion
        print("[STEP 2] Checking completion...")
        complete = is_complete(session)
        print(f"[STEP 2 RESULT] is_complete={complete}")

        if not complete:
            print("[EXIT] Session not complete")
            return {"status": "not_complete"}

        # 3. cek summary sudah ada
        print("[STEP 3] Checking existing summary...")
        existing = get_summary(req.user_id, req.story_date)
        print(f"[STEP 3 RESULT] existing={existing}")

        if existing:
            print("[EXIT] Summary already exists")
            return {"status": "already_exists", "data": existing}

        # 4. ambil messages
        print("[STEP 4] Fetching messages...")
        messages = get_human_messages(req.user_id, req.story_date)
        print(f"[STEP 4 RESULT] total_messages={len(messages) if messages else 0}")

        if not messages:
            print("[EXIT] No messages found")
            return {"status": "no_messages"}

        # 5. generate summary (LLM)
        print("[STEP 5] Generating summary using LLM...")
        summary = generate_summary(messages)
        print(f"[STEP 5 RESULT] summary={summary}")

        if not summary or not summary.get("summary_text"):
            print("[EXIT] Failed to generate summary")
            return {"status": "failed_to_generate"}

        # 6. save ke DB
        print("[STEP 6] Saving summary to DB...")
        save_summary(req.user_id, req.story_date, summary)
        print("[STEP 6 RESULT] Summary saved successfully")

        print("[SUCCESS] Summary generated successfully")
        print("========== [END] generate_daily_summary ==========\n")

        return {
            "status": "generated",
            "data": summary
        }

    except Exception as e:
        print(f"[ERROR] generate_daily_summary: {str(e)}")
        print("========== [FAILED] generate_daily_summary ==========\n")

        return {
            "status": "error",
            "message": str(e)
        }