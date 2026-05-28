# main.py
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

import traceback

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
    freetalk,
    auth_routes,
    vocab,
    audio_vocab,
    summary_cost,
    sentence_lesson,
    smartcall,
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


# @app.middleware("http")
# async def log_requests(request: Request, call_next):

#     print("\n========== HTTP REQUEST ==========")
#     print("Method :", request.method)
#     print("Path   :", request.url.path)
#     print("URL    :", request.url)
#     print("Client :", request.client.host)
#     print("Origin :", request.headers.get("origin"))
#     print("==================================")

#     try:
#         response = await call_next(request)

#         print("\n========== HTTP RESPONSE =========")
#         print("Status :", response.status_code)
#         print("Method :", request.method)
#         print("Path   :", request.url.path)
#         print("==================================\n")

#         return response

#     except Exception as e:
#         print("\n========== HTTP ERROR ============")
#         print("Method :", request.method)
#         print("Path   :", request.url.path)
#         print("Error  :", str(e))
#         traceback.print_exc()
#         print("==================================\n")

#         raise e


# -----------------------------
# CORS
# -----------------------------
# CORS agar React (Vite) boleh akses FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://localhost:5173",
        "http://localhost:4173",
        "https://fast-api-speak-v0.vercel.app",  # frontend production
        "https://192.168.101.13:5173", # testing local hp Kos Eka Lia
        "https://192.168.1.16:5173",
        "https://172.16.10.178:5173", # testing local hp PLAI
        "https://192.168.10.201:5173/", # testing local hp Tomoro
    ],
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
app.include_router(freetalk.router)
app.include_router(auth_routes.router)
app.include_router(vocab.router)
app.include_router(audio_vocab.router)
app.include_router(summary_cost.router)
app.include_router(sentence_lesson.router)
app.include_router(smartcall.router)


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
