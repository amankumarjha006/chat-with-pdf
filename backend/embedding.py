"""
Lazy-loaded singleton for the SentenceTransformer embedding model.
The model is only loaded on the first call to get_model(), avoiding slow cold starts.
"""

import logging
import threading
import numpy as np
from sentence_transformers import SentenceTransformer

from config import EMBEDDING_MODEL_NAME

logger = logging.getLogger(__name__)

_model: SentenceTransformer | None = None
_lock = threading.Lock()


def get_model() -> SentenceTransformer:
    """Return the shared SentenceTransformer instance, loading it on first call."""
    global _model
    if _model is None:
        with _lock:
            # Double-checked locking
            if _model is None:
                logger.info("Loading embedding model '%s' (first use)...", EMBEDDING_MODEL_NAME)
                _model = SentenceTransformer(EMBEDDING_MODEL_NAME)
                logger.info("Embedding model loaded successfully.")
    return _model


def encode(texts: list[str], batch_size: int = 64) -> np.ndarray:
    """
    Encode a list of texts into embeddings using the lazily-loaded model.
    Uses batching for memory-efficient encoding of large inputs.

    Raises:
        RuntimeError: If the embedding model fails to encode.
    """
    try:
        model = get_model()
        vectors = model.encode(texts, batch_size=batch_size, show_progress_bar=False)
        return np.array(vectors, dtype="float32")
    except Exception as e:
        logger.error("Embedding model error: %s", e)
        raise RuntimeError("Embedding model error occurred") from e
