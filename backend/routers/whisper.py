# routers/whisper.py
from fastapi import APIRouter, UploadFile, File
from faster_whisper import WhisperModel
import tempfile
import os

router = APIRouter()

# Load model sekali saat aplikasi startup
model = WhisperModel(
    "small",
    device="cpu",
    compute_type="int8"
)

@router.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):
    print("filename:", file.filename)
    print("content_type:", file.content_type)

    # simpan file sementara
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_file:
        temp_file.write(await file.read())
        temp_path = temp_file.name

    try:
        segments, info = model.transcribe(
            temp_path,
            language="en",
            beam_size=1,
            vad_filter=True
        )

        text = " ".join(segment.text for segment in segments)

        print(
            f"Detected language '{info.language}' "
            f"with probability {info.language_probability:.2f}"
        )

        return {
            "text": text.strip(),
            "language": info.language,
            "language_probability": info.language_probability,
        }

    finally:
        os.remove(temp_path)