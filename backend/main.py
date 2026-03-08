# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from db import init_db  # fungsi init_db dari db.py
from config import DATABASE_URL

# -----------------------------
# ROUTERS
# -----------------------------
from routers import (
    history,
    roleplay,
    streak,
    stt,
    suggestion,
    translate,
    tts,
    daily_story,
)


# OpenAI client


# def get_session_history(session_id: str):
#     return SQLChatMessageHistory(
#         session_id=session_id, connection_string="sqlite:///chat_history.db"
#     )

# -----------------------------
# LIFESPAN: startup/shutdown
# -----------------------------
from contextlib import asynccontextmanager


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 🟢 Startup: init database
    init_db()
    yield
    # 🔴 Shutdown: bisa ditambahkan cleanup jika perlu


# -----------------------------
# FASTAPI APP
# -----------------------------
app = FastAPI(lifespan=lifespan)


# -----------------------------
# CORS
# -----------------------------
# CORS agar React (Vite) boleh akses FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -----------------------------
# BASIC ENDPOINTS
# -----------------------------
@app.get("/")
def root():
    return {"message": "FastAPI is running"}


@app.get("/api/ping")
def ping():
    return {"status": "success", "message": "FastAPI connected to React!"}


# -----------------------------
# REGISTER ROUTERS
# -----------------------------
app.include_router(history.router)
app.include_router(roleplay.router)
app.include_router(streak.router)
app.include_router(stt.router)
app.include_router(suggestion.router)
app.include_router(translate.router)
app.include_router(tts.router)
app.include_router(daily_story.router)


# Set path ke service account GCP
# Ambil JSON dari env


# class SpeechInput(BaseModel):
#     text: str


# @app.post("/speech")
# def receive_speech(data: SpeechInput):
#     print("Text dari frontend:", data.text)
#     return {"status": "ok", "received_text": data.text}


# from deep_translator import GoogleTranslator


# @app.post("/api/translate")
# async def translate_text(payload: dict):
#     text = payload["text"]
#     translated = GoogleTranslator(source="en", target="id").translate(text)
#     return {"translated": translated}

# from deep_translator import GoogleTranslator
