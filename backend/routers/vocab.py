from fastapi import APIRouter
from db import get_all_vocab

router = APIRouter(prefix="/vocab", tags=["Vocab"])


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