# routers/daily_story.py

import os
import json
from datetime import datetime, date, timedelta
from zoneinfo import ZoneInfo

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
    get_available_dates
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
    user_name: str
    user_id: str
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

    today = datetime.now(ZoneInfo("Asia/Jakarta")).date()

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
    today = datetime.now(ZoneInfo("Asia/Jakarta")).date()

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
    today = datetime.now(ZoneInfo("Asia/Jakarta")).date()
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

@router.get("/summary")
def get_daily_summary(user_id: str, story_date: str):
    try:
        print("\n========== [GET] daily_summary ==========")
        print(f"[REQUEST] user_id={user_id}, story_date={story_date}")

        data = get_summary(user_id, story_date)

        print(f"[RESULT] data={data}")

        if not data:
            return {"status": "not_found"}

        return {
            "status": "success",
            "data": data
        }

    except Exception as e:
        print(f"[ERROR] get_daily_summary: {str(e)}")
        return {
            "status": "error",
            "message": str(e)
        }
    
@router.get("/available-dates")
def get_available_dates_endpoint(user_id: str):
    try:
        print("\n========== [GET] available_dates ==========")
        print(f"[REQUEST] user_id={user_id}")

        dates = get_available_dates(user_id)

        print(f"[RESULT] dates={dates}")

        if not dates:
            return {
                "status": "success",
                "dates": []
            }

        return {
            "status": "success",
            "dates": dates
        }

    except Exception as e:
        print(f"[ERROR] available_dates: {str(e)}")
        return {
            "status": "error",
            "message": str(e)
        }

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

def generate_daily_summary_by_phase(messages):
    """
    Generate daily story summaries per phase from conversation messages.

    Returns:
        dict: {
            "morning": "...",
            "afternoon": "...",
            "evening": "...",
            "night": "..."
        }
    """

    # Fixed phase order (IMPORTANT)
    phases = ["morning", "afternoon", "evening", "night"]
    summaries = {}

    for phase in phases:
        # Ambil semua pesan untuk phase ini
        msgs_phase = [m for m in messages if m.get("phase") == phase]

        print(f"\n=== Processing phase: {phase} ===")

        # Kalau tidak ada pesan → skip tapi tetap isi None
        if not msgs_phase:
            print("No messages for this phase")
            summaries[phase] = None
            continue

        # Debug print isi pesan
        for m in msgs_phase:
            print(f"Message: {m.get('data', {}).get('content','')}")

        # Convert ke text
        conversation_text = []
        for msg in msgs_phase:
            role = msg.get("type")
            content = msg.get("data", {}).get("content", "")

            if role == "human":
                conversation_text.append(f"User: {content}")
            elif role == "ai":
                conversation_text.append(f"AI: {content}")

        conversation_text = "\n".join(conversation_text)

        # Prompt
        prompt = f"""
        You are an expert assistant helping summarize a user's daily activities like a diary.

        The user has finished describing their activities for the {phase}.

        Your task is to write a concise, natural, and fluent summary in English.

        IMPORTANT:
        - Do NOT use "I"
        - Do NOT use "the user"
        - Use a natural diary-style tone (neutral perspective)
        - Make it sound smooth and human-like, not robotic

        Guidelines:
        - Clearly describe the activities
        - Keep it simple and easy to read
        - Combine actions naturally into one flowing sentence when possible
        - Avoid repetitive sentence structure
        - Vary phrasing slightly to sound natural

        Style examples:
        - The morning began with...
        - The afternoon was spent...
        - The evening focused on...
        - The night ended with...

        Good Example:
        Input:
        User: I wake up and drink coffee.
        User: I go for a jog.

        Summary:
        The morning began with a cup of coffee, followed by a refreshing jog.

        Bad Summary (DO NOT DO):
        - Using "I"
        - Using "the user"
        - Writing in a robotic or repetitive way

        Now summarize the following conversation:

        {conversation_text}
        """

        # Call LLM
        response = llm.invoke(prompt)
        summary = response.content.strip()

        summaries[phase] = summary

        print(f"Summary for phase '{phase}': {summary}")

    return summaries

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
        sessionKey = f'{req.user_name}_{req.user_id}_daily_{req.story_date}'
        messages = get_human_messages(sessionKey)

        if not messages:
            print("[STEP 4 RESULT] No messages found")
            return {"status": "no_messages"}

        print(f"[STEP 4 RESULT] total_messages={len(messages)}")

        # Loop untuk menampilkan isi pesan lengkap
        for i, msg in enumerate(messages, start=1):
            print(f"Message {i}: {msg}")

        if not messages:
            print("[EXIT] No messages found")
            return {"status": "no_messages"}

        # 5. generate summary (LLM) per phase
        print("[STEP 5] Generating summary using LLM per phase...")

        summaries = generate_daily_summary_by_phase(messages)

        if not summaries:
            print("[EXIT] Failed to generate any summary")
            return {"status": "failed_to_generate"}

        # Debug print semua phase summary
        for phase, text in summaries.items():
            print(f"[STEP 5 RESULT] Phase='{phase}' Summary='{text}'")

        # 6. save ke DB (HANYA SEKALI ❗)
        print("[STEP 6] Saving summary to DB...")

        save_summary(req.user_id, req.story_date, summaries)
        
        print(f"======PESAN summaries======: {summaries}")

        print("[STEP 6 RESULT] All summaries saved successfully")

        print("[SUCCESS] Summary generated successfully")
        print("========== [END] generate_daily_summary ==========\n")

        return {
            "status": "generated",
            "data": summaries
        }

    except Exception as e:
        print(f"[ERROR] generate_daily_summary: {str(e)}")
        print("========== [FAILED] generate_daily_summary ==========\n")

        return {
            "status": "error",
            "message": str(e)
        }

def calculate_streaks(dates):
    if not dates:
        return 0, 0

    # convert ke datetime & urutkan terbaru → lama
    date_objs = sorted(
        [datetime.strptime(d, "%Y-%m-%d") for d in dates],
        reverse=True
    )

    today = datetime.now().date()

    # ===== CURRENT STREAK =====
    if date_objs[0].date() not in [today, today - timedelta(days=1)]:
        current_streak = 0
    else:
        current_streak = 1
        for i in range(1, len(date_objs)):
            if date_objs[i-1].date() - date_objs[i].date() == timedelta(days=1):
                current_streak += 1
            else:
                break

    # ===== LONGEST STREAK =====
    longest_streak = 1
    temp_streak = 1

    for i in range(1, len(date_objs)):
        if date_objs[i-1].date() - date_objs[i].date() == timedelta(days=1):
            temp_streak += 1
            longest_streak = max(longest_streak, temp_streak)
        else:
            temp_streak = 1

    return current_streak, longest_streak


@router.get("/streak")
def get_streak(user_id: str):
    try:
        print("\n========== [GET] streak ==========")
        print(f"[REQUEST] user_id={user_id}")

        # ambil data dari fungsi kamu
        dates = get_available_dates(user_id)

        # hitung streak
        current_streak, longest_streak = calculate_streaks(dates)

        today_str = datetime.now().strftime("%Y-%m-%d")

        result = {
            "status": "success",
            "current_streak": current_streak,
            "longest_streak": longest_streak,
            "total_active_days": len(dates),
            "last_active_date": dates[0] if dates else None,
            "streak_today_done": today_str in dates,
            "streak_status": "active" if current_streak > 0 else "broken"
        }

        print(f"[RESULT] {result}")

        return result

    except Exception as e:
        print(f"[ERROR] streak: {str(e)}")
        return {
            "status": "error",
            "message": str(e)
        }