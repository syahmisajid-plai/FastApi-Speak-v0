# utils/audio_vocab.py
from supabase import create_client
import os

import re

from google.cloud import texttospeech
from config import client_tts  # client TTS dari config.py

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
BUCKET = "audio"


def file_exists(path: str):
    try:
        supabase.storage.from_(BUCKET).download(path)
        return True
    except:
        return False


def upload_audio(path: str, audio_bytes: bytes):
    supabase.storage.from_(BUCKET).upload(
        path,
        audio_bytes,
        {
            "content-type": "audio/mpeg",
            "upsert": "true",
        },
    )


def get_public_url(path: str):
    return supabase.storage.from_(BUCKET).get_public_url(path)


def generate_tts_audio(text: str):
    synthesis_input = texttospeech.SynthesisInput(text=text)

    voice = texttospeech.VoiceSelectionParams(
        language_code="en-US", name="en-US-Standard-F"
    )

    audio_config = texttospeech.AudioConfig(
        audio_encoding=texttospeech.AudioEncoding.MP3,
    )

    response = client_tts.synthesize_speech(
        input=synthesis_input, voice=voice, audio_config=audio_config
    )

    return response.audio_content


def normalize_word(word: str):
    word = word.lower().strip()
    word = re.sub(r"[^a-z0-9]", "_", word)
    return word


def get_audio_url(word: str):
    # normalize biar konsisten

    clean_word = normalize_word(word)
    path = f"word/{clean_word}.mp3"

    print("WORD:", word)
    print("clean_word:", clean_word)
    print("PATH:", path)
    print("SUPABASE_URL:", SUPABASE_URL)
    print("SUPABASE_KEY exists:", SUPABASE_KEY is not None)

    # 1. cek storage
    if file_exists(path):
        return get_public_url(path)

    # 2. generate TTS
    audio_bytes = generate_tts_audio(word)

    # 3. upload ke storage
    upload_audio(path, audio_bytes)

    # 4. return URL
    return get_public_url(path)
