# routers/sentence_lesson.py

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from db import (
    get_random_uncompleted_lesson,
    mark_lesson_completed,
    get_completed_lesson_ids
)

router = APIRouter(prefix="/sentence-lessons", tags=["Sentence Lessons"])

# =========================
# REQUEST MODEL
# =========================
class LessonCompleteRequest(BaseModel):
    user_id: str
    lesson_id: str

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
    
# =========================
# MARK LESSON AS COMPLETED
# =========================
@router.post("/complete")
def complete_lesson(payload: LessonCompleteRequest):
    try:
        result = mark_lesson_completed(
            payload.user_id,
            payload.lesson_id
        )

        return {
            "success": True,
            "message": "Lesson marked as completed",
            "data": result
        }

    except Exception as e:
        print("❌ COMPLETE LESSON ERROR:", str(e))
        raise HTTPException(status_code=500, detail=str(e))


# =========================
# GET COMPLETED LESSON IDS
# =========================
@router.get("/completed-ids/{user_id}")
def get_completed_ids(user_id: str):
    try:
        data = get_completed_lesson_ids(user_id)

        return {
            "success": True,
            "user_id": user_id,
            "completed_lesson_ids": data
        }

    except Exception as e:
        print("❌ GET COMPLETED LESSON IDS ERROR:", str(e))
        raise HTTPException(status_code=500, detail=str(e))