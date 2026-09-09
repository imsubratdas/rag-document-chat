# Multi-user Document RAG

This converts the original local RAG notebook into a web application.

## Architecture

React/Vite/Tailwind-ready frontend
→ FastAPI backend
→ Supabase Auth + PostgreSQL + pgvector
→ local sentence-transformer embeddings
→ Gemini API for generation

The original notebook used PyMuPDF, sentence-transformers, manual sentence chunking,
in-memory torch similarity search, and a locally loaded Gemma model. The production
version keeps the useful ingestion/retrieval ideas but replaces the local vector store
and local LLM with persistent multi-user services.

## 1. Supabase

Create a Supabase project.

Open SQL Editor and run `supabase/schema.sql`.

Enable Email/Password authentication.

Copy:
- Project URL
- Publishable/anon key
- Service role key

Never expose the service-role key to React.

## 2. Gemini

Create a Gemini API key in Google AI Studio.

The backend defaults to `gemini-3.7-flash`; change `LLM_MODEL` in `.env` if needed.

## 3. Backend

```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# Linux/macOS:
# source .venv/bin/activate

pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload --port 8000
```

## 4. Frontend

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

## 5. Important production improvements

The current scaffold intentionally keeps processing synchronous so it is easy to understand.
Before opening it to many users, add:
- background document processing
- object storage for original uploaded files
- file malware/type validation
- per-user rate limiting
- streaming LLM responses
- better chunking/token-aware splitting
- reranking
- hybrid keyword + vector retrieval
- observability and error logging
- signed/private file URLs
- delete conversation endpoint
- document previews
