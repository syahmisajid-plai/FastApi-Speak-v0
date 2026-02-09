from fastapi import FastAPI, UploadFile, File
from fastapi.responses import StreamingResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List


from openai import OpenAI
import os
from io import BytesIO
import sqlite3
import psycopg2
from dotenv import load_dotenv
import time

from google.cloud import texttospeech

# LangChain
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

from streak import update_streak

load_dotenv()

# OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
DATABASE_URL = os.getenv("DATABASE_URL")

# def get_session_history(session_id: str):
#     return SQLChatMessageHistory(
#         session_id=session_id, connection_string="sqlite:///chat_history.db"
#     )


def init_db():
    max_attempts = 5
    attempt = 0
    while attempt < max_attempts:
        try:
            if DATABASE_URL:
                print("🚀 Using PostgreSQL")
                conn = psycopg2.connect(DATABASE_URL)
            else:
                print("💻 Using SQLite")
                conn = sqlite3.connect("chat_history.db")
            break
        except psycopg2.OperationalError as e:
            print(f"Database not ready, retrying... ({attempt+1}/{max_attempts})", e)
            attempt += 1
            time.sleep(5)
    else:
        raise Exception("Cannot connect to the database")

    cursor = conn.cursor()
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS user_streak (
            user_id TEXT PRIMARY KEY,
            current_streak INTEGER,
            longest_streak INTEGER,
            last_activity_date TEXT,
            chat_count INTEGER
        )
        """
    )
    conn.commit()
    conn.close()


from contextlib import asynccontextmanager
from fastapi import FastAPI


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 🟢 Startup: init database
    init_db()
    yield
    # 🔴 Shutdown: bisa ditambahkan cleanup jika perlu


app = FastAPI(lifespan=lifespan)


def get_session_history(session_id: str):
    if DATABASE_URL:
        conn = DATABASE_URL
    else:
        conn = "sqlite:///chat_history.db"

    return SQLChatMessageHistory(session_id=session_id, connection_string=conn)


# CORS agar React (Vite) boleh akses FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://fast-api-speak-v0.vercel.app",  # frontend production
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "FastAPI is running"}


@app.get("/api/ping")
def ping():
    return {"status": "success", "message": "FastAPI connected to React!"}


# Set path ke service account GCP
# Ambil JSON dari env
gcp_json = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")

# Tulis sementara ke file
with open("gcp_temp.json", "w") as f:
    f.write(gcp_json)

# Set path environment variable untuk SDK
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "gcp_temp.json"

client_tts = texttospeech.TextToSpeechClient()


class TextPayload(BaseModel):
    text: str


@app.post("/tts-stream")
async def tts_stream(payload: TextPayload):
    # 1️⃣ Siapkan input TTS
    synthesis_input = texttospeech.SynthesisInput(text=payload.text)

    # 2️⃣ Pilih suara
    voice = texttospeech.VoiceSelectionParams(
        language_code="en-US", name="en-US-Standard-F"
    )

    # 3️⃣ Konfigurasi audio
    audio_config = texttospeech.AudioConfig(
        audio_encoding=texttospeech.AudioEncoding.MP3,
        effects_profile_id=["small-bluetooth-speaker-class-device"],
        speaking_rate=1,
        pitch=1,
    )

    # 4️⃣ Generate audio
    response = client_tts.synthesize_speech(
        input=synthesis_input, voice=voice, audio_config=audio_config
    )

    # 5️⃣ Simpan hasil ke memory
    audio_stream = BytesIO(response.audio_content)

    # 6️⃣ Kirim sebagai streaming response
    return StreamingResponse(
        audio_stream,
        media_type="audio/mpeg",
        headers={"Content-Disposition": "inline; filename=output.mp3"},
    )


class SpeechInput(BaseModel):
    text: str


# @app.post("/speech")
# def receive_speech(data: SpeechInput):
#     print("Text dari frontend:", data.text)
#     return {"status": "ok", "received_text": data.text}


class StreamRequest(BaseModel):
    session_id: str
    input: str


llm = ChatOpenAI(
    model="gpt-4o-mini",
    streaming=True,
    max_tokens=32,
    temperature=0.7,
)

system_prompt = SystemMessagePromptTemplate.from_template(
    "You are my English conversation partner for speaking practice."
    "Encourage me to have a friendly and casual conversation about everyday life, hobbies, or fun topics."
    "Use simple and clear English, suitable for beginners."
    "Answer in short sentences (15 words maximum)."
    "If I make a mistake, correct me gently and politely in a simple way."
    "Your goal is to make me feel relaxed, confident, and enjoy speaking English."
    "Always END WITH A ONE-SENTENCE QUESTION"
)

human_prompt = HumanMessagePromptTemplate.from_template("{input}")

prompt = ChatPromptTemplate.from_messages(
    [
        system_prompt,
        MessagesPlaceholder(variable_name="history"),
        human_prompt,
    ]
)

chain = prompt | llm | StrOutputParser()

runnable = RunnableWithMessageHistory(
    chain,
    get_session_history,
    input_messages_key="input",
    history_messages_key="history",
)


@app.post("/stream_answer")
async def stream_answer(req: StreamRequest):

    print("🔥 STREAM ANSWER CALLED")
    print("🧠 SESSION:", req.session_id)
    print("💬 INPUT:", req.input)

    # ========== DEBUG HISTORY ==========
    history = get_session_history(req.session_id)
    print("📜 HISTORY:", [msg.content for msg in history.messages])
    # ==================================

    def event_stream():
        for chunk in runnable.stream(
            {"input": req.input},
            config={"configurable": {"session_id": req.session_id}},
        ):
            yield f"data: {chunk}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")


class UpdateStreakRequest(BaseModel):
    session_id: str


@app.get("/user/streak/{session_id}")
def get_streak(session_id: str):
    if DATABASE_URL:
        conn = psycopg2.connect(DATABASE_URL)
    else:
        conn = sqlite3.connect("chat_history.db")

    cursor = conn.cursor()

    cursor.execute(
        (
            "SELECT current_streak, longest_streak, chat_count FROM user_streak WHERE user_id=%s"
            if DATABASE_URL
            else "SELECT current_streak, longest_streak, chat_count FROM user_streak WHERE user_id=?"
        ),
        (session_id,),
    )

    row = cursor.fetchone()
    conn.close()

    if row is None:
        return {
            "current_streak": 0,
            "longest_streak": 0,
            "chat_count": 0,
        }

    return {
        "current_streak": row[0],
        "longest_streak": row[1],
        "chat_count": row[2],
    }


@app.post("/user/update-streak")
def update_user_streak(req: UpdateStreakRequest):
    print("🔥 UPDATE STREAK:", req.session_id)
    update_streak(req.session_id)
    return {"status": "ok"}


# from deep_translator import GoogleTranslator


# @app.post("/api/translate")
# async def translate_text(payload: dict):
#     text = payload["text"]
#     translated = GoogleTranslator(source="en", target="id").translate(text)
#     return {"translated": translated}

from deep_translator import GoogleTranslator


class TextPayload(BaseModel):
    text: str


@app.post("/api/translate")
async def translate_text(payload: TextPayload):
    translated = GoogleTranslator(source="en", target="id").translate(payload.text)
    return {"translated": translated}


@app.post("/api/stt-whisper")
async def stt_whisper(file: UploadFile):
    audio_bytes = await file.read()

    transcript = client.audio.transcriptions.create(
        model="whisper-1", file=("audio.webm", audio_bytes), language="id"
    )

    return {"text": transcript.text}


class SuggestionRequest(BaseModel):
    last_user_message: str = ""
    last_ai_reply: str = ""


@app.post("/suggestions")
async def get_suggestions(req: SuggestionRequest):
    user_msg = req.last_user_message
    ai_reply = req.last_ai_reply

    prompt = f"""
        You are an English conversation assistant.

        User said:
        "{user_msg}"

        AI replied:
        "{ai_reply}"

        Create **3 suggested sentences** that the USER can say next.
        Use simple, casual English.
        Each sentence max 10 words.

        Return ONLY JSON list format:
        ["suggestion1", "suggestion2", "suggestion3"]
        Do not add any other text.
        """

    try:
        response = client.responses.create(model="gpt-4o-mini", input=prompt)

        ai_output = response.output_text
        import json

        suggestions = json.loads(ai_output)

        return {"suggestions": suggestions}

    except Exception as e:
        print("Error calling OpenAI:", e)
        return {
            "suggestions": [
                "Can you tell me more?",
                "That sounds interesting.",
                "What should I do next?",
            ]
        }


class TranslateRequest(BaseModel):
    text: str
    source_lang: str
    target_lang: str


@app.post("/translate")
async def translate_id_en(payload: TranslateRequest):
    translated = GoogleTranslator(
        source=payload.source_lang, target=payload.target_lang
    ).translate(payload.text)

    return {"indo": payload.text, "english": translated}
