# routers/stt.py
from fastapi import APIRouter, UploadFile
from openai import OpenAI
import os

# Router instance
router = APIRouter()

# OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


# -----------------------------
# MODELS
# -----------------------------
@router.post("/api/stt-whisper")
async def stt_whisper(file: UploadFile):
    audio_bytes = await file.read()

    transcript = client.audio.transcriptions.create(
        model="whisper-1", file=("audio.webm", audio_bytes), language="id"
    )

    return {"text": transcript.text}
