# routers/audio.py
from fastapi import Query
from fastapi import APIRouter, Query
from utils.audio_vocab import get_audio_url  # function yang tadi kita buat

from db import insert_api_log

import time

router = APIRouter(prefix="/audio", tags=["Audio"])


@router.get("/{word}")

def get_audio(word: str, user_id: str = Query(...)):  # 🔥 wajib diisi

    start = time.time()

    try:
        url = get_audio_url(word)

        duration = int((time.time() - start) * 1000)

        insert_api_log({
            "user_id": user_id,  # ✅ tidak null
            "session_id": None,

            "endpoint": f"/audio/{word}",
            "feature": "audio",
            "method": "GET",

            "status_code": 200,
            "duration_ms": duration,

            "tokens_input": 0,
            "tokens_output": 0,

            "characters": len(word),

            "stt_cost": 0,
            "llm_cost": 0,
            "tts_cost": 0,

            "total_cost": 0
        })

        return {"success": True, "word": word, "audio_url": url}

    except Exception as e:

        duration = int((time.time() - start) * 1000)

        insert_api_log({
            "user_id": user_id,
            "session_id": None,

            "endpoint": f"/audio/{word}",
            "feature": "audio",
            "method": "GET",

            "status_code": 500,
            "duration_ms": duration,

            "tokens_input": 0,
            "tokens_output": 0,

            "characters": len(word),

            "stt_cost": 0,
            "llm_cost": 0,
            "tts_cost": 0,

            "total_cost": 0
        })

        raise e
