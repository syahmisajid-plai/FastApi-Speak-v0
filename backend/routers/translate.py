from fastapi import APIRouter
from pydantic import BaseModel
from deep_translator import GoogleTranslator

from db import save_translation_history, get_translation_history

# Router instance
router = APIRouter()


# =========================
# MODELS
# =========================
class TranslateRequest(BaseModel):
    text: str
    source_lang: str
    target_lang: str


# class TextPayload(BaseModel):
#     text: str

# @router.post("/api/translate")
# async def translate_text(payload: TextPayload):
#     translated = GoogleTranslator(source="en", target="id").translate(payload.text)
#     return {"translated": translated}

# =========================
# MAIN TRANSLATE ENDPOINT
# =========================
@router.post("/translate")
async def translate_id_en(payload: TranslateRequest):

    # 1. TRANSLATE TEXT
    translated = GoogleTranslator(
        source=payload.source_lang,
        target=payload.target_lang
    ).translate(payload.text)

    # 2. SAVE TO HISTORY (MVP USER ID DUMMY)
    save_translation_history(
        user_id="demo-user",  # nanti ganti JWT auth
        source_text=payload.text,
        translated_text=translated,
        source_lang=payload.source_lang,
        target_lang=payload.target_lang
    )

    # 3. RESPONSE
    return {
        "source": payload.text,
        "translated": translated
    }

@router.get("/translation-history/{user_id}")
def fetch_history(user_id: str, limit: int = 20, offset: int = 0):

    history = get_translation_history(
        user_id=user_id,
        limit=limit,
        offset=offset
    )

    return {
        "user_id": user_id,
        "data": history
    }