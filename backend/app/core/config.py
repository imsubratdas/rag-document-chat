import os
from pathlib import Path
from dotenv import load_dotenv

backend_dir_env = Path(__file__).resolve().parent.parent.parent / ".env"
if backend_dir_env.exists():
    load_dotenv(dotenv_path=backend_dir_env)
load_dotenv()

def get_required_env(key: str) -> str:
    val = os.getenv(key)
    if not val:
        raise RuntimeError(
            f"Missing required environment variable '{key}'. "
            f"Please ensure it is set in your .env file or deployment settings."
        )
    return val

SUPABASE_URL = get_required_env("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = get_required_env("SUPABASE_SERVICE_ROLE_KEY")
GEMINI_API_KEY = get_required_env("GEMINI_API_KEY")

LLM_MODEL = os.getenv("LLM_MODEL", "gemini-3.7-flash")
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2")
TOP_K = int(os.getenv("TOP_K", "6"))
CHUNK_SIZE = int(os.getenv("CHUNK_SIZE", "900"))
CHUNK_OVERLAP = int(os.getenv("CHUNK_OVERLAP", "120"))
MAX_FILE_MB = int(os.getenv("MAX_FILE_MB", "20"))
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173")
