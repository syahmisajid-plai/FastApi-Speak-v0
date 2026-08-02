from supabase import create_client
import os

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

BUCKET = "conversation-audios"


def get_public_audio_url(audio_path: str):
    if not audio_path:
        return None

    return supabase.storage.from_(BUCKET).get_public_url(audio_path)