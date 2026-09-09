from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from app.core.auth import get_current_user
from app.core.supabase import supabase
from app.rag.pipeline import retrieve
from app.rag.llm import generate_answer

router = APIRouter()

class NewChat(BaseModel):
    title: str = "New chat"

class ChatMessage(BaseModel):
    conversation_id: str
    content: str = Field(min_length=1, max_length=10000)

@router.post("/conversations")
def create_conversation(body: NewChat, user_id: str = Depends(get_current_user)):
    result = supabase.table("conversations").insert({
        "user_id": user_id,
        "title": body.title,
    }).execute()
    return result.data[0]

@router.get("/conversations")
def list_conversations(user_id: str = Depends(get_current_user)):
    return supabase.table("conversations").select(
        "id,title,created_at,updated_at"
    ).eq("user_id", user_id).order("updated_at", desc=True).execute().data

@router.get("/conversations/{conversation_id}/messages")
def get_messages(conversation_id: str, user_id: str = Depends(get_current_user)):
    return supabase.table("messages").select(
        "id,role,content,created_at"
    ).eq("conversation_id", conversation_id).eq(
        "user_id", user_id
    ).order("created_at").execute().data

@router.post("/message")
def send_message(body: ChatMessage, user_id: str = Depends(get_current_user)):
    conversation = supabase.table("conversations").select("id").eq(
        "id", body.conversation_id
    ).eq("user_id", user_id).single().execute()
    if not conversation.data:
        raise HTTPException(404, "Conversation not found")

    previous = supabase.table("messages").select("role,content").eq(
        "conversation_id", body.conversation_id
    ).eq("user_id", user_id).order("created_at", desc=True).limit(8).execute().data

    supabase.table("messages").insert({
        "conversation_id": body.conversation_id,
        "user_id": user_id,
        "role": "user",
        "content": body.content,
    }).execute()

    context = retrieve(user_id, body.content)
    answer = generate_answer(body.content, context, list(reversed(previous)))

    supabase.table("messages").insert({
        "conversation_id": body.conversation_id,
        "user_id": user_id,
        "role": "assistant",
        "content": answer,
    }).execute()

    return {
        "answer": answer,
        "sources": [
            {
                "filename": x.get("filename"),
                "page_number": x.get("page_number"),
                "similarity": x.get("similarity"),
            }
            for x in context
        ],
    }
