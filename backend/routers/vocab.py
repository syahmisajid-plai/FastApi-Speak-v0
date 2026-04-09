from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from db import get_all_vocab, mark_vocab_completed

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