from google import genai
from google.genai import types
from app.core.config import GEMINI_API_KEY, LLM_MODEL

client = genai.Client(api_key=GEMINI_API_KEY)

SYSTEM = """You are a document-grounded assistant.
Answer using the supplied context whenever possible.
If the answer is not supported by the context, say that the uploaded documents
do not contain enough information. Do not invent facts or citations.
Keep answers clear and useful. Mention source filenames and page numbers when available.
"""

def generate_answer(question: str, context: list[dict], history: list[dict]) -> str:
    context_text = "\n\n".join(
        f"[Source {i+1}] {item['filename']} "
        f"{'(page ' + str(item['page_number']) + ')' if item.get('page_number') else ''}\n"
        f"{item['content']}"
        for i, item in enumerate(context)
    )

    history_text = "\n".join(
        f"{m['role']}: {m['content']}" for m in history[-8:]
    )

    prompt = f"""{SYSTEM}

CONVERSATION:
{history_text}

RETRIEVED DOCUMENT CONTEXT:
{context_text}

USER QUESTION:
{question}

Answer the user question directly. At the end, include a short 'Sources' section listing
only the source numbers you actually used.
"""

    response = client.models.generate_content(
        model=LLM_MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(
            max_output_tokens=1000,
            thinking_config=types.ThinkingConfig(
             thinking_level="low"
            ),
        ),
    )
    return response.text
