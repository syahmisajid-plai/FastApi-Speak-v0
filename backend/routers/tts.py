# routers/tts.py
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from io import BytesIO
import re
import os

from google.cloud import texttospeech
from config import client_tts  # client TTS dari config.py

from db import insert_api_log

import time
from utils.monitoring_cost import calculate_all_costs

router = APIRouter()


# -----------------------------
# MODELS
# -----------------------------
class TextPayload(BaseModel):
    text: str


# -----------------------------
# ROUTES
# -----------------------------
@router.post("/tts-stream")
async def tts_stream(payload: TextPayload):

    start_time = time.time()

    print("📥 Received text:", repr(payload.text))

    # -----------------------------
    # CLEAN TEXT
    # -----------------------------
    clean_text = " ".join(payload.text.split())
    clean_text = clean_text.replace("’", "'")

    clean_text = re.sub(
        r"\b(I|i|You|you|He|he|She|she|It|it|We|we|They|they) 's\b",
        r"\1's",
        clean_text
    )

    clean_text = clean_text.replace('"', "")

    print("📤 Cleaned text:", repr(clean_text))

    # -----------------------------
    # TTS CONFIG
    # -----------------------------
    synthesis_input = texttospeech.SynthesisInput(text=clean_text)

    voice = texttospeech.VoiceSelectionParams(
        language_code="en-US",
        name="en-US-Standard-F"
    )

    audio_config = texttospeech.AudioConfig(
        audio_encoding=texttospeech.AudioEncoding.MP3,
        effects_profile_id=["small-bluetooth-speaker-class-device"],
        speaking_rate=1,
        pitch=1,
    )

    # -----------------------------
    # GENERATE AUDIO
    # -----------------------------
    response = client_tts.synthesize_speech(
        input=synthesis_input,
        voice=voice,
        audio_config=audio_config
    )

    audio_stream = BytesIO(response.audio_content)

    # =============================
    # COST + MONITORING
    # =============================

    duration_ms = int((time.time() - start_time) * 1000)

    characters = len(clean_text)

    tts_cost = calculate_tts_cost(characters)

    log_data = {
        "user_id": getattr(payload, "user_id", None),  # optional kalau kamu kirim
        "session_id": None,
        "endpoint": "/tts-stream",
        "feature": "tts",
        "method": "POST",

        "status_code": 200,
        "duration_ms": duration_ms,

        "tokens_input": 0,
        "tokens_output": 0,

        "characters": characters,

        "stt_cost": 0,
        "llm_cost": 0,
        "tts_cost": tts_cost,
        "total_cost": tts_cost,
    }

    insert_api_log(log_data)

    # -----------------------------
    # RETURN STREAM
    # -----------------------------
    return StreamingResponse(
        audio_stream,
        media_type="audio/mpeg",
        headers={"Content-Disposition": "inline; filename=output.mp3"},
    )
