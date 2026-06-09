# routers/sugestion.py

from fastapi import APIRouter
from pydantic import BaseModel
from openai import OpenAI
import os
import json

router = APIRouter()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


# -----------------------------
# MODELS
# -----------------------------
class SuggestionRequest(BaseModel):
    last_user_message: str = ""
    last_ai_reply: str = ""


# -----------------------------
# ROUTES
# -----------------------------
@router.post("/suggestions")
async def get_suggestions(req: SuggestionRequest):
    user_msg = req.last_user_message
    ai_reply = req.last_ai_reply

    prompt = f"""
        You are an English conversation assistant.

        User said:
        "{user_msg}"

        AI replied:
        "{ai_reply}"

        Create **3 suggested sentences** that the USER can say next.
        Use simple, casual English.
        Each sentence max 10 words.

        Return ONLY JSON list format:
        ["suggestion1", "suggestion2", "suggestion3"]
        Do not add any other text.
        """

    try:
        response = client.responses.create(model="gpt-4o-mini", input=prompt)

        ai_output = response.output_text
        import json

        suggestions = json.loads(ai_output)

        return {"suggestions": suggestions}

    except Exception as e:
        print("Error calling OpenAI:", e)
        return {
            "suggestions": [
                "Can you tell me more?",
                "That sounds interesting.",
                "What should I do next?",
            ]
        }
