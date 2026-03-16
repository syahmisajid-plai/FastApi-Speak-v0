from fastapi import APIRouter
from pydantic import BaseModel

from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage

from db import get_session_history
from prompts.freetalk_prompt import FREE_TALK_PROMPT


router = APIRouter(prefix="/free-talk", tags=["Free Talk"])


class FreeTalkRequest(BaseModel):
    session_id: str
    input: str


# LLM
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.7)


def run_freetalk(session_id: str, user_message: str):

    history = get_session_history(session_id)

    messages = [
        SystemMessage(content=FREE_TALK_PROMPT),
        *history.messages,
        HumanMessage(content=user_message),
    ]

    response = llm.invoke(messages)

    history.add_user_message(user_message)
    history.add_ai_message(response.content)

    return response.content


@router.post("/stream_answer")
def free_talk(req: FreeTalkRequest):

    reply = run_freetalk(req.session_id, req.input)

    return {"text": reply}
