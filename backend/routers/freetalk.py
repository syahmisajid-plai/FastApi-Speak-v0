# routers/freetalk.py

from fastapi import APIRouter
from fastapi.responses import StreamingResponse
import json
from pydantic import BaseModel

from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage

from db import get_messages, save_message, insert_api_log
from prompts.freetalk_prompt import FREE_TALK_PROMPT

import time
import re

from utils.monitoring_cost import calculate_all_costs


router = APIRouter(prefix="/free-talk", tags=["Free Talk"])


class FreeTalkRequest(BaseModel):
    user_id:str
    session_id: str
    input: str


def extract_alternative(text: str):
    match = re.search(r"You could say\s*:?\s*\"?\s*(.*?)\s*\"?$", text, re.S | re.I)
    if not match:
        return None

    return match.group(1).split(".")[0].strip()

USE_STREAMING = True  # 🔴 matikan dulu streaming

# LLM
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.7, streaming=USE_STREAMING)


@router.post("/stream_answer")
def free_talk(req: FreeTalkRequest):

    start_time = time.time()

    session_key = f"{req.session_id}_{req.user_id}_freetalk"

    # =============================
    # 1. Ambil history
    # =============================
    rows = get_messages(session_key)

    history_messages = []
    for role, content in rows:
        if role == "user":
            history_messages.append(HumanMessage(content=content))
        elif role == "assistant":
            history_messages.append(AIMessage(content=content))

    # =============================
    # 2. Susun messages
    # =============================
    messages = [
        SystemMessage(content=FREE_TALK_PROMPT),
        *history_messages,
        HumanMessage(content=req.input),
    ]

    # =============================
    # 3. STREAMING GENERATOR 🔥
    # =============================
    def event_generator():
        full_text = ""

        try:
            # 🔥 STREAM TOKEN
            for chunk in llm.stream(messages):
                token = chunk.content or ""
                full_text += token

                yield f"data: {token}\n\n"
            
            print("\n================ RAW FULL TEXT ================\n")
            print(full_text)
            print("\n==============================================\n")

            alternative = extract_alternative(full_text)

            print("\n================ ALTERNATIVE DEBUG ================\n")
            print("EXTRACTED ALTERNATIVE:", alternative)
            print("\n==================================================\n")


            clean_text = re.sub(r"You could say\s*:?\s*.*", "", full_text, flags=re.I).strip()
            print("\n================ CLEAN TEXT ================\n")
            print(clean_text)
            print("\n===========================================\n")



            # =============================
            # 4. SETELAH SELESAI
            # =============================

            # ✅ save DB
            save_message(session_key, req.user_id, "freetalk", "user", req.input)
            save_message(session_key, req.user_id, "freetalk", "assistant", full_text)

            # ✅ cost tracking
            duration_ms = int((time.time() - start_time) * 1000)

            costs = calculate_all_costs(
                system_prompt=FREE_TALK_PROMPT,
                history_messages=history_messages,
                user_input=req.input,
                llm_output=full_text,
                tts_characters=0
            )

            log_data = {
                "user_id": req.user_id,
                "session_id": session_key,
                "endpoint": "/freetalk",
                "feature": "freetalk",
                "method": "POST",
                "status_code": 200,
                "duration_ms": duration_ms,
                "tokens_input": costs["tokens_input"],
                "tokens_output": costs["tokens_output"],
                "characters": 0,
                "stt_cost": costs["stt_cost"],
                "llm_cost": costs["llm_cost"],
                "tts_cost": costs["tts_cost"],
                "total_cost": costs["total_cost"],
            }

            insert_api_log(log_data)

            # =============================
            # 5. OPTIONAL: KIRIM META
            # =============================
            meta = {
                "done": True,
                "alternative": alternative,
                "text": clean_text
            }

            yield f"event: meta\ndata: {json.dumps(meta)}\n\n"
            
        except Exception as e:
            print("❌ STREAM ERROR:", e)
            yield f"data: Sorry, something went wrong.\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")