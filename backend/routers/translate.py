from fastapi import APIRouter, UploadFile
from pydantic import BaseModel
from deep_translator import GoogleTranslator
from openai import OpenAI
import os
from io import BytesIO

# Router instance
router = APIRouter()


# -----------------------------
# MODELS
# -----------------------------
class TextPayload(BaseModel):
    text: str


class TranslateRequest(BaseModel):
    text: str
    source_lang: str
    target_lang: str


@router.post("/api/translate")
async def translate_text(payload: TextPayload):
    translated = GoogleTranslator(source="en", target="id").translate(payload.text)
    return {"translated": translated}


@router.post("/translate")
async def translate_id_en(payload: TranslateRequest):
    translated = GoogleTranslator(
        source=payload.source_lang, target=payload.target_lang
    ).translate(payload.text)

    return {"indo": payload.text, "english": translated}
