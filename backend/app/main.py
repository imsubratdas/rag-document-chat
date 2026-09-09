import os
from fastapi import FastAPI
import os
from fastapi.middleware.cors import CORSMiddleware
from app.api.documents import router as documents_router
from app.api.chat import router as chat_router

app = FastAPI(title="Multi-user RAG API", version="1.0.0")

origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in origins],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(documents_router, prefix="/api/documents", tags=["documents"])
app.include_router(chat_router, prefix="/api/chat", tags=["chat"])

@app.get("/health")
def health():
    return {"status": "ok"}
