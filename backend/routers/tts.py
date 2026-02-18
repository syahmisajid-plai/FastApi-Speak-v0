# routers/tts.py
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from io import BytesIO
import re
import os

from google.cloud import texttospeech
from config import client_tts  # client TTS dari config.py

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
    print("📥 Received text:", repr(payload.text))

    # Bersihkan teks
    clean_text = " ".join(payload.text.split())

    # Ganti apostrophe Unicode ke ASCII
    clean_text = clean_text.replace("’", "'")

    # Gabungkan It 's -> It's, He 's -> He's, dsb
    clean_text = re.sub(
        r"\b(I|i|You|you|He|he|She|she|It|it|We|we|They|they) 's\b", r"\1's", clean_text
    )

    # Hapus tanda kutip literal (optional)
    clean_text = clean_text.replace('"', "")

    print("📤 Cleaned text:", repr(clean_text))

    # 1️⃣ Siapkan input TTS
    synthesis_input = texttospeech.SynthesisInput(text=clean_text)

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
