from functools import lru_cache
from sentence_transformers import SentenceTransformer
from app.core.config import EMBEDDING_MODEL

@lru_cache(maxsize=1)
def get_embedding_model():
    return SentenceTransformer(EMBEDDING_MODEL, device="cpu")

def embed_texts(texts: list[str]) -> list[list[float]]:
    model = get_embedding_model()
    vectors = model.encode(
        texts,
        batch_size=32,
        normalize_embeddings=True,
        show_progress_bar=False,
    )
    return vectors.tolist()

def embed_query(text: str) -> list[float]:
    return embed_texts([text])[0]
