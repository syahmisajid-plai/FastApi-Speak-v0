from fastapi import APIRouter, UploadFile, File
from transformers import pipeline

router = APIRouter()

# Inisialisasi pipeline sekali saja
pipe = pipeline("automatic-speech-recognition", model="openai/whisper-tiny")

@router.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):
    # baca audio dari upload
    print("filename:", file.filename)
    print("content_type:", file.content_type)

    audio_bytes = await file.read()
    temp_path = "temp.wav"
    with open(temp_path, "wb") as f:
        f.write(audio_bytes)

    # jalankan pipeline
    result = pipe(temp_path)



    return {"text": result["text"]}
