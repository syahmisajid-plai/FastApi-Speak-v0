import os
from dotenv import load_dotenv
from openai import OpenAI
from google.cloud import texttospeech

# -----------------------------
# LOAD ENV VARIABLES
# -----------------------------
load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
DATABASE_URL = os.getenv("DATABASE_URL")
gcp_json = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")


# Tulis sementara ke file
with open("gcp_temp.json", "w") as f:
    f.write(gcp_json)

# Set path environment variable untuk SDK
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "gcp_temp.json"

client_tts = texttospeech.TextToSpeechClient()
