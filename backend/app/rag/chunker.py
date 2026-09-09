import re
from app.core.config import CHUNK_SIZE, CHUNK_OVERLAP

def normalize(text: str) -> str:
    text = re.sub(r"\s+", " ", text)
    return text.strip()

def chunk_pages(pages: list[dict]) -> list[dict]:
    chunks = []
    for page in pages:
        text = normalize(page["text"])
        if not text:
            continue

        start = 0
        chunk_index = 0
        while start < len(text):
            end = min(start + CHUNK_SIZE, len(text))
            chunk = text[start:end].strip()
            if chunk:
                chunks.append({
                    "content": chunk,
                    "page_number": page["page_number"],
                    "chunk_index": chunk_index,
                })
                chunk_index += 1
            if end >= len(text):
                break
            start = max(0, end - CHUNK_OVERLAP)
    return chunks
