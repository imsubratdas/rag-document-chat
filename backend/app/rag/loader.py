from pathlib import Path
import pymupdf as fitz
from docx import Document as DocxDocument

SUPPORTED = {".pdf", ".txt", ".md", ".docx"}

def load_document(path: str) -> list[dict]:
    ext = Path(path).suffix.lower()

    if ext == ".pdf":
        doc = fitz.open(path)
        pages = []
        for i, page in enumerate(doc):
            text = page.get_text("text").replace("\x00", " ").strip()
            if text:
                pages.append({"page_number": i + 1, "text": text})
        doc.close()
        return pages

    if ext == ".docx":
        doc = DocxDocument(path)
        text = "\n".join(p.text for p in doc.paragraphs if p.text.strip())
        return [{"page_number": None, "text": text}]

    if ext in {".txt", ".md"}:
        return [{"page_number": None, "text": Path(path).read_text(encoding="utf-8", errors="ignore")}]

    raise ValueError(f"Unsupported file type: {ext}")
