from fastapi import APIRouter, HTTPException

from db import get_conversation_topics, get_conversation

router = APIRouter(prefix="/conversation", tags=["conversation"])


@router.get("/topics")
def get_topics():

    topics = get_conversation_topics()

    return {"success": True, "topics": topics}


@router.get("/topics/{topic_id}")
def get_topic(topic_id: int):

    topic = get_conversation(topic_id)

    if not topic:
        raise HTTPException(status_code=404, detail="Conversation not found")

    return {"success": True, "conversation": topic}
