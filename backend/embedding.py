"""
Embedding layer using Cohere's embed-english-v3.0 API.
Replaces the local sentence-transformers model for lightweight deployment.
"""

import os
import logging

import numpy as np
from dotenv import load_dotenv
import cohere

from config import EMBEDDING_MODEL_NAME

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

logger = logging.getLogger(__name__)

_client = cohere.Client(os.getenv("COHERE_API_KEY"))

# Cohere allows up to 96 texts per embed call
_MAX_BATCH = 96


def encode_documents(texts: list[str]) -> np.ndarray:
    """
    Encode document texts for indexing.
    Uses input_type="search_document" as required by Cohere Embed v3.

    Raises:
        RuntimeError: If the Cohere API call fails.
    """
    return _encode(texts, input_type="search_document")


def encode_query(texts: list[str]) -> np.ndarray:
    """
    Encode query texts for searching.
    Uses input_type="search_query" as required by Cohere Embed v3.

    Raises:
        RuntimeError: If the Cohere API call fails.
    """
    return _encode(texts, input_type="search_query")


def _encode(texts: list[str], input_type: str) -> np.ndarray:
    """Internal: batch-encode texts via Cohere Embed API."""
    try:
        all_embeddings: list[list[float]] = []
        for i in range(0, len(texts), _MAX_BATCH):
            batch = texts[i : i + _MAX_BATCH]
            response = _client.embed(
                texts=batch,
                model=EMBEDDING_MODEL_NAME,
                input_type=input_type,
            )
            all_embeddings.extend(response.embeddings)

        return np.array(all_embeddings, dtype="float32")
    except Exception as e:
        logger.error("Cohere embedding error: %s", e)
        raise RuntimeError("Embedding API error occurred") from e
