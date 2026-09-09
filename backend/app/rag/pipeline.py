from app.rag.embeddings import embed_texts, embed_query
from app.core.supabase import supabase
from app.core.config import TOP_K

def store_chunks(user_id: str, document_id: str, filename: str, chunks: list[dict]):
    vectors = embed_texts([c["content"] for c in chunks])
    rows = []
    for chunk, vector in zip(chunks, vectors):
        rows.append({
            "user_id": user_id,
            "document_id": document_id,
            "filename": filename,
            "content": chunk["content"],
            "page_number": chunk["page_number"],
            "chunk_index": chunk["chunk_index"],
            "embedding": vector,
        })
    if rows:
        for i in range(0, len(rows), 100):
            supabase.table("document_chunks").insert(rows[i:i+100]).execute()

def retrieve(user_id: str, question: str, top_k: int = TOP_K) -> list[dict]:
    vector = embed_query(question)
    result = supabase.rpc(
        "match_document_chunks",
        {
            "query_embedding": vector,
            "match_user_id": user_id,
            "match_count": top_k,
        },
    ).execute()
    return result.data or []
