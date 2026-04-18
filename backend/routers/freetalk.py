# routers/freetalk.py

from fastapi import APIRouter
from pydantic import BaseModel

from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage

from db import get_session_history
from prompts.freetalk_prompt import FREE_TALK_PROMPT


router = APIRouter(prefix="/free-talk", tags=["Free Talk"])


class FreeTalkRequest(BaseModel):
    user_id:str
    session_id: str
    input: str

USE_STREAMING = True  # 🔴 matikan dulu streaming

# LLM
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.7, streaming=USE_STREAMING)


def run_freetalk(session_id: str, user_id: str, user_message: str):
    try:
        session_key = f"{session_id}_{user_id}_freetalk"
        history = get_session_history(session_key)

        messages = [
            SystemMessage(content=FREE_TALK_PROMPT),
            *history.messages,
            HumanMessage(content=user_message),
        ]

        response = llm.invoke(messages)

        history.add_user_message(user_message)
        history.add_ai_message(response.content)

        return response.content

    except Exception as e:
        print("❌ FREETALK ERROR:", e)
        return "Sorry, something went wrong."


@router.post("/stream_answer")
def free_talk(req: FreeTalkRequest):

    reply = run_freetalk(
        session_id=req.session_id,
        user_id=req.user_id,
        user_message=req.input
    )

    return {"text": reply}
