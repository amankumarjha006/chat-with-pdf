"""
Retrieval layer: query the FAISS index with similarity scoring.
"""

import logging
import faiss
import numpy as np

from embedding import encode_query
from config import TOP_K, SIMILARITY_THRESHOLD

logger = logging.getLogger(__name__)


def retrieve(
    question: str,
    index: faiss.IndexFlatIP,
    chunks: list[dict],
    k: int = TOP_K,
) -> tuple[list[dict], bool]:
    """
    Retrieve the top-k chunks for a question.

    Returns:
        (chunks_with_scores, is_confident)
        - chunks_with_scores: top-k chunks with "score" key added
        - is_confident: True if at least one chunk is above SIMILARITY_THRESHOLD

    Raises:
        RuntimeError: If FAISS search or encoding fails.
    """
    try:
        query_vector = encode_query([question])
        faiss.normalize_L2(query_vector)
        scores, indices = index.search(query_vector, k)
    except RuntimeError:
        raise
    except Exception as e:
        logger.error("Search operation failed: %s", e)
        raise RuntimeError("Search operation failed") from e

    results: list[dict] = []
    best_score = -1.0

    for score, idx in zip(scores[0], indices[0]):
        if idx == -1:
            continue
        chunk = {**chunks[idx], "score": float(score)}
        results.append(chunk)
        best_score = max(best_score, float(score))

    is_confident = best_score >= SIMILARITY_THRESHOLD

    logger.info(
        "Query: '%s' → %d chunks, best_score=%.4f, confident=%s (threshold=%.2f)",
        question[:60],
        len(results),
        best_score,
        is_confident,
        SIMILARITY_THRESHOLD,
    )
    return results, is_confident