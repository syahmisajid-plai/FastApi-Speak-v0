# routers/freetalk.py

from fastapi import APIRouter
from pydantic import BaseModel

from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage

from db import get_messages, save_message
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

        # -----------------------------
        # 1. Ambil history dari DB
        # -----------------------------
        rows = get_messages(session_key)  # [(role, message), ...]

        history_messages = []
        for role, content in rows:
            if role == "user":
                history_messages.append(HumanMessage(content=content))
            elif role == "assistant":
                history_messages.append(AIMessage(content=content))

        # -----------------------------
        # 2. Susun messages ke LLM
        # -----------------------------
        messages = [
            SystemMessage(content=FREE_TALK_PROMPT),
            *history_messages,
            HumanMessage(content=user_message),
        ]

        # -----------------------------
        # 3. Generate response
        # -----------------------------
        response = llm.invoke(messages)

        # -----------------------------
        # 4. Simpan ke DB
        # -----------------------------
        save_message(session_key, user_id, "freetalk", "user", user_message)
        save_message(session_key, user_id, "freetalk", "assistant", response.content)

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
