from fastapi import FastAPI, UploadFile, File
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from openai import OpenAI
import os
from dotenv import load_dotenv
import time

# LangChain
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage

load_dotenv()

app = FastAPI()

# OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# CORS agar React (Vite) boleh akses FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://fast-api-speak-v0.vercel.app",
        "https://fastapi-speak-v0.vercel.app",
    ],
    allow_credentials=False,
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


def stream_from_openai(user_text: str):
    llm = ChatOpenAI(
        model="gpt-4o-mini",
        streaming=True,
        max_tokens=32,
        temperature=0.7,
    )

    messages = [
        SystemMessage(
            content=(
                "You are my English conversation partner. Your only task is to have casual conversations with me in English, like a friendly chat."
                "Talk about anything — daily life, hobbies, news, or random fun topics."
                "Answer in one short sentence only, max 10 words."
                "Use simple and clear English, like you’re talking to a complete beginner."
                "Your main goal is to make me feel comfortable and enjoy speaking English without fear."
            )
        ),
        HumanMessage(content=user_text),
    ]

    response = llm.stream(messages)

    for chunk in response:
        if chunk.content:
            # SSE format
            yield f"data: {chunk.content}\n\n"


@app.get("/stream_answer")
async def stream_answer(query: str):
    return StreamingResponse(
        stream_from_openai(query),
        media_type="text/event-stream",  # ❗ SSE
    )


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
