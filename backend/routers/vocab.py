# routers/vocab.py

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from db import get_all_vocab, mark_vocab_completed, get_completed_vocab_ids

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
        result = mark_vocab_completed(payload.user_id, payload.vocab_id)

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