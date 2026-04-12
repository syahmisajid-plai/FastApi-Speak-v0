# routers/audio.py

from fastapi import APIRouter
from utils.audio_vocab import get_audio_url  # function yang tadi kita buat

router = APIRouter(prefix="/audio", tags=["Audio"])


@router.get("/{word}")
def get_audio(word: str):
    url = get_audio_url(word)

    return {"success": True, "word": word, "audio_url": url}
