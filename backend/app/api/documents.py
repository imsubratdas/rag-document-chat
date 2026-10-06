from pathlib import Path
from tempfile import NamedTemporaryFile
from fastapi import APIRouter, Depends, File, UploadFile, HTTPException
from app.core.auth import get_current_user
from app.core.supabase import supabase
from app.core.config import MAX_FILE_MB
from app.rag.loader import load_document, SUPPORTED
from app.rag.chunker import chunk_pages
from app.rag.pipeline import store_chunks

router = APIRouter()

@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user),
):
    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in SUPPORTED:
        raise HTTPException(400, "Supported files: PDF, DOCX, TXT, MD")

    data = await file.read()
    if len(data) > MAX_FILE_MB * 1024 * 1024:
        raise HTTPException(413, f"File exceeds {MAX_FILE_MB} MB limit")

    with NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(data)
        tmp_path = tmp.name

    try:
        inserted = supabase.table("documents").insert({
            "user_id": user_id,
            "filename": file.filename,
            "file_type": suffix.lstrip("."),
            "status": "processing",
        }).execute()
        document_id = inserted.data[0]["id"]

        pages = load_document(tmp_path)
        chunks = chunk_pages(pages)
        store_chunks(user_id, document_id, file.filename or "document", chunks)

        supabase.table("documents").update({
            "status": "ready",
            "chunk_count": len(chunks),
        }).eq("id", document_id).eq("user_id", user_id).execute()

        return {"document_id": document_id, "filename": file.filename, "chunks": len(chunks)}
    except Exception:
        if "document_id" in locals():
            supabase.table("documents").update(
                {"status": "error"}
            ).eq(
                "id", document_id
            ).eq(
                "user_id", user_id
            ).execute()

        raise HTTPException(
            status_code=500,
            detail="Document processing failed. Please try again.",
        )
    finally:
        Path(tmp_path).unlink(missing_ok=True)

@router.get("")
def list_documents(user_id: str = Depends(get_current_user)):
    return supabase.table("documents").select(
        "id,filename,file_type,status,chunk_count,created_at"
    ).eq("user_id", user_id).order("created_at", desc=True).execute().data

@router.delete("/{document_id}")
def delete_document(document_id: str, user_id: str = Depends(get_current_user)):
    supabase.table("document_chunks").delete().eq("document_id", document_id).eq(
        "user_id", user_id
    ).execute()
    result = supabase.table("documents").delete().eq("id", document_id).eq(
        "user_id", user_id
    ).execute()
    if not result.data:
        raise HTTPException(404, "Document not found")
    return {"deleted": True}
