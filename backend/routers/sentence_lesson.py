# routers/sentence_lesson.py

from fastapi import APIRouter, HTTPException
from db import get_random_uncompleted_lesson

router = APIRouter(prefix="/sentence-lessons", tags=["Sentence Lessons"])


# =========================
# GET RANDOM LESSON (BASED ON USER PROGRESS)
# =========================
@router.get("/next/{user_id}")
def get_next_lesson(user_id: str):
    try:
        lesson = get_random_uncompleted_lesson(user_id)

        if not lesson:
            return {
                "success": True,
                "message": "All lessons completed",
                "data": None
            }

        return {
            "success": True,
            "data": lesson
        }

    except Exception as e:
        print("❌ GET LESSON ERROR:", str(e))
        raise HTTPException(status_code=500, detail=str(e))