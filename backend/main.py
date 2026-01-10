from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from openai import OpenAI
import os
from dotenv import load_dotenv
import time

# LangChain
from langchain_openai import ChatOpenAI

load_dotenv()

app = FastAPI()

# OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# CORS agar React (Vite) boleh akses FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # default Vite
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


@app.post("/speech")
def process_speech(data: SpeechInput):
    user_text = data.text

    response = client.responses.create(
        model="gpt-4o-mini",
        input=f"""You are my English conversation partner. Your only task is to have casual conversations with me in English, like a friendly chat.
                            ALWAYS REPLY IN ENGLISH.
                            Talk about anything — daily life, hobbies, news, or random fun topics.
                            prioritize short text only.
                            If I respond in Indonesian, simply translate it into English and you must ask me to say it.
                            Do not correct my grammar or vocabulary, even if it’s wrong — just keep the conversation going naturally.
                            Use simple and clear English, like you’re talking to a complete beginner.
                            Your main goal is to make me feel comfortable and enjoy speaking English without fear.

User says:
{user_text}
""",
        max_output_tokens=25,  # ⚡ batasi output
    )

    ai_reply = response.output[0].content[0].text

    print("USER:", user_text)
    print("AI:", ai_reply)

    return {"user_text": user_text, "ai_reply": ai_reply}


def stream_from_openai(query: str):
    llm = ChatOpenAI(model="gpt-4o-mini", streaming=True)
    response = llm.stream(query)
    for chunk in response:
        # ❗ format SSE
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


class SuggestionRequest(BaseModel):
    last_ai_reply: str


@app.post("/suggestions")
async def get_suggestions(req: SuggestionRequest):
    last_reply = req.last_ai_reply

    # Prompt untuk AI agar buat 3 saran berbasis jawaban terakhir
    prompt = f"""
        You are an AI assistant. Create **3 suggested sentences or additional topics** 
        for the user based on the following sentence: "{last_reply}".
        Provide **only in JSON list format**:
        ["suggestion1", "suggestion2", "suggestion3"]
        Do not add any other text.
    """

    try:
        response = client.responses.create(model="gpt-4o-mini", input=prompt)

        # Ambil text dari output AI
        ai_output = response.output_text  # ini akan berupa string JSON
        import json

        suggestions = json.loads(ai_output)
        return {"suggestions": suggestions}

    except Exception as e:
        print("Error calling OpenAI:", e)
        return {
            "suggestions": [
                f"{last_reply} - Suggestion 1",
                f"{last_reply} - Suggestion 2",
                f"{last_reply} - Suggestion 3",
            ]
        }
