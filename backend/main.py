from fastapi import FastAPI, UploadFile, File
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List


from openai import OpenAI
import os
from dotenv import load_dotenv
import time

# LangChain
from langchain_openai import ChatOpenAI
from langchain_core.prompts import (
    ChatPromptTemplate,
    SystemMessagePromptTemplate,
    HumanMessagePromptTemplate,
    MessagesPlaceholder,
)
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables.history import RunnableWithMessageHistory

from langchain_community.chat_message_histories import SQLChatMessageHistory

from streak import update_streak


load_dotenv()

app = FastAPI()

# OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def get_session_history(session_id: str):
    return SQLChatMessageHistory(
        session_id=session_id, connection_string="sqlite:///chat_history.db"
    )


# CORS agar React (Vite) boleh akses FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://fast-api-speak-v0.vercel.app",  # frontend production
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "FastAPI is running"}


@app.get("/api/ping")
def ping():
    return {"status": "success", "message": "FastAPI connected to React!"}


class SpeechInput(BaseModel):
    text: str


# @app.post("/speech")
# def receive_speech(data: SpeechInput):
#     print("Text dari frontend:", data.text)
#     return {"status": "ok", "received_text": data.text}


class StreamRequest(BaseModel):
    session_id: str
    input: str


llm = ChatOpenAI(
    model="gpt-4o-mini",
    streaming=True,
    max_tokens=32,
    temperature=0.7,
)

system_prompt = SystemMessagePromptTemplate.from_template(
    "You are my English conversation partner. Your only task is to have casual conversations with me in English, like a friendly chat."
    "Talk about anything — daily life, hobbies, news, or random fun topics."
    "Answer in one short sentence only, max 10 words."
    "Use simple and clear English, like you’re talking to a complete beginner."
    "Your main goal is to make me feel comfortable and enjoy speaking English without fear."
)

human_prompt = HumanMessagePromptTemplate.from_template("{input}")

prompt = ChatPromptTemplate.from_messages(
    [
        system_prompt,
        MessagesPlaceholder(variable_name="history"),
        human_prompt,
    ]
)

chain = prompt | llm | StrOutputParser()

runnable = RunnableWithMessageHistory(
    chain,
    get_session_history,
    input_messages_key="input",
    history_messages_key="history",
)


@app.post("/stream_answer")
async def stream_answer(req: StreamRequest):

    print("🔥 STREAM ANSWER CALLED")
    print("🧠 SESSION:", req.session_id)
    print("💬 INPUT:", req.input)

    def event_stream():
        for chunk in runnable.stream(
            {"input": req.input},
            config={"configurable": {"session_id": req.session_id}},
        ):
            yield f"data: {chunk}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")


class UpdateStreakRequest(BaseModel):
    session_id: str


@app.get("/user/streak/{session_id}")
def get_streak(session_id: str):
    import sqlite3

    conn = sqlite3.connect("chat_history.db")
    cursor = conn.cursor()

    cursor.execute(
        "SELECT current_streak, longest_streak, chat_count FROM user_streak WHERE user_id=?",
        (session_id,),
    )
    row = cursor.fetchone()
    conn.close()

    if row is None:
        return {
            "current_streak": 0,
            "longest_streak": 0,
            "chat_count": 0,
        }

    return {
        "current_streak": row[0],
        "longest_streak": row[1],
        "chat_count": row[2],
    }


@app.post("/user/update-streak")
def update_user_streak(req: UpdateStreakRequest):
    print("🔥 UPDATE STREAK:", req.session_id)
    update_streak(req.session_id)
    return {"status": "ok"}


# from deep_translator import GoogleTranslator


# @app.post("/api/translate")
# async def translate_text(payload: dict):
#     text = payload["text"]
#     translated = GoogleTranslator(source="en", target="id").translate(text)
#     return {"translated": translated}

from deep_translator import GoogleTranslator


class TextPayload(BaseModel):
    text: str


@app.post("/api/translate")
async def translate_text(payload: TextPayload):
    translated = GoogleTranslator(source="en", target="id").translate(payload.text)
    return {"translated": translated}


@app.post("/api/stt-whisper")
async def stt_whisper(file: UploadFile):
    audio_bytes = await file.read()

    transcript = client.audio.transcriptions.create(
        model="whisper-1", file=("audio.webm", audio_bytes), language="id"
    )

    return {"text": transcript.text}


class SuggestionRequest(BaseModel):
    last_user_message: str = ""
    last_ai_reply: str = ""


@app.post("/suggestions")
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


class TranslateRequest(BaseModel):
    text: str
    source_lang: str
    target_lang: str


@app.post("/translate")
async def translate_id_en(payload: TranslateRequest):
    translated = GoogleTranslator(
        source=payload.source_lang, target=payload.target_lang
    ).translate(payload.text)

    return {"indo": payload.text, "english": translated}
