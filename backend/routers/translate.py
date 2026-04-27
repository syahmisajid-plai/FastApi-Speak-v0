# routers/translate.py

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from deep_translator import GoogleTranslator


from db import save_translation_history, get_translation_history, update_translation_favorite

# Router instance
router = APIRouter()


# =========================
# MODELS
# =========================
class TranslateRequest(BaseModel):
    text: str
    source_lang: str
    target_lang: str
    user_id: str

class FavoriteRequest(BaseModel):
    is_favorite: bool

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
    history_id = save_translation_history(
        user_id=payload.user_id,
        source_text=payload.text,
        translated_text=translated,
        source_lang=payload.source_lang,
        target_lang=payload.target_lang
    )

    # 3. RESPONSE
    return {
        "source": payload.text,
        "translated": translated,
        "history_id": history_id
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

@router.patch("/translation-history/{history_id}/favorite")
def update_favorite(history_id: str, payload: FavoriteRequest):
    updated = update_translation_favorite(
        history_id=history_id,
        is_favorite=payload.is_favorite
    )

    if not updated:
        raise HTTPException(status_code=404, detail="Data not found")

    return {
        "message": "Favorite updated",
        "history_id": history_id,
        "is_favorite": payload.is_favorite
    }

# =========================
# TRANSLATE EN -> ID (NO DB)
# =========================
@router.post("/translate/en-id")
async def translate_en_id(payload: TranslateRequest):

    if not payload.text:
        raise HTTPException(status_code=400, detail="Text is required")

    try:
        translated = GoogleTranslator(
            source="en",
            target="id"
        ).translate(payload.text)

        return {
            "source": payload.text,
            "translated": translated
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail="Translation failed")