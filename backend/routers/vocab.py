# routers/vocab.py

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from db import get_all_vocab, mark_vocab, get_completed_vocab_ids, get_user_vocab
from db import get_all_chapters, get_vocab_by_chapter

router = APIRouter(prefix="/vocab", tags=["Vocab"])

# =========================
# RESPONSE MODEL
# =========================
class VocabCompleteRequest(BaseModel):
    user_id: str
    vocab_id: int

@router.get("/all")
def get_vocab_list():
    try:
        data = get_all_vocab()
        return {
            "success": True,
            "data": data
        }

    except Exception as e:
        print("❌ VOCAB ERROR:", e)
        return {
            "success": False,
            "message": "Failed to fetch vocab"
        }
    
# =========================
# MARK AS COMPLETED
# =========================
@router.post("/complete")
def complete_vocab(payload: VocabCompleteRequest):
    try:
        result = mark_vocab(
            payload.user_id,
            payload.vocab_id,
            "completed"
        )

        return {
            "success": True,
            "message": "Vocab marked as completed",
            "data": result
        }

    except Exception as e:
        print("❌ COMPLETE ERROR:", str(e))
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
    
@router.post("/known")
def known_vocab(payload: VocabCompleteRequest):
    try:
        result = mark_vocab(
            payload.user_id,
            payload.vocab_id,
            "known"
        )

        return {
            "success": True,
            "message": "Vocab marked as known",
            "data": result
        }

    except Exception as e:
        print("❌ KNOWN ERROR:", str(e))
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
    
@router.get("/completed-ids/{user_id}")
def get_completed_ids(user_id: str):
    try:
        data = get_completed_vocab_ids(user_id)

        return {
            "success": True,
            "user_id": user_id,
            "completed_vocab_ids": data
        }

    except Exception as e:
        print("❌ GET COMPLETED IDS ERROR:", str(e))
        raise HTTPException(status_code=500, detail=str(e))
    
@router.get("/saved/{user_id}")
def get_saved_vocab(user_id: str):
    try:
        data = get_user_vocab(user_id)

        return {
            "success": True,
            "data": data
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
    
@router.get("/chapters")
def get_chapters():
    try:
        data = get_all_chapters()
        # print("📦 RAW CHAPTER DATA:", data)  # 🔥 ADD INI
        
        return {
            "success": True,
            "data": data
        }
    except Exception as e:
        print("❌ CHAPTER ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))
    
@router.get("/chapters/{chapter_id}")
def get_chapter_vocab(chapter_id: int):
    try:
        data = get_vocab_by_chapter(chapter_id)

        return {
            "success": True,
            "chapter_id": chapter_id,
            "data": data
        }

    except Exception as e:
        print("❌ CHAPTER VOCAB ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))