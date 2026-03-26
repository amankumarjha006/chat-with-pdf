"""
PDF ingestion pipeline: extraction, chunking, FAISS indexing, and hash-based caching.
"""

import os
import hashlib
import pickle
import logging

import fitz
import faiss
import numpy as np

from config import (
    CHUNK_SIZE,
    CHUNK_OVERLAP,
    MIN_CHUNK_LENGTH,
    EMBEDDING_DIMENSION,
    CACHE_DIR,
)
from embedding import encode

logger = logging.getLogger(__name__)


# ── Text extraction ──────────────────────────────────────────────────────────

def extract_text(pdf_bytes: bytes) -> list[tuple[str, int]]:
    """
    Extract text from each page of a PDF.

    Returns:
        List of (page_text, page_number) tuples.  Page numbers are 1-indexed.

    Raises:
        ValueError: If the PDF cannot be opened or parsed.
    """
    try:
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    except Exception as e:
        logger.error("Failed to open PDF: %s", e)
        raise ValueError("Failed to process PDF. The file may be corrupted.") from e

    pages: list[tuple[str, int]] = []
    for i, page in enumerate(doc):
        text = page.get_text("text") or ""
        if text.strip():
            pages.append((text, i + 1))

    doc.close()

    if not pages:
        raise ValueError("The PDF contains no extractable text.")

    return pages


# ── Chunking ─────────────────────────────────────────────────────────────────

def split_into_chunks(
    pages: list[tuple[str, int]],
    chunk_size: int = CHUNK_SIZE,
    overlap: int = CHUNK_OVERLAP,
    min_length: int = MIN_CHUNK_LENGTH,
) -> list[dict]:
    """Split page texts into overlapping chunks."""
    chunks: list[dict] = []
    step = chunk_size - overlap

    for text, page_num in pages:
        for i in range(0, len(text), step):
            chunk_text = text[i : i + chunk_size].strip()
            if len(chunk_text) < min_length:
                break
            chunks.append({"text": chunk_text, "page": page_num})

    return chunks


# ── FAISS index building ─────────────────────────────────────────────────────

def build_faiss_index(chunks: list[dict]) -> faiss.IndexFlatIP:
    """
    Encode chunk texts and build a FAISS inner-product index.
    Using IndexFlatIP with normalized vectors gives cosine similarity directly.

    Raises:
        RuntimeError: Propagated from embedding.encode if encoding fails.
    """
    texts = [c["text"] for c in chunks]
    vectors = encode(texts)

    # Normalize for cosine similarity via inner product
    faiss.normalize_L2(vectors)

    index = faiss.IndexFlatIP(EMBEDDING_DIMENSION)
    index.add(vectors)
    logger.info("Built FAISS index with %d vectors.", index.ntotal)
    return index


# ── Caching helpers ──────────────────────────────────────────────────────────

def _pdf_hash(pdf_bytes: bytes) -> str:
    return hashlib.sha256(pdf_bytes).hexdigest()


def _cache_path(digest: str) -> str:
    return os.path.join(CACHE_DIR, f"{digest}.pkl")


def _load_cache(digest: str):
    """Return (index, chunks) from cache or None."""
    path = _cache_path(digest)
    if os.path.exists(path):
        try:
            with open(path, "rb") as f:
                data = pickle.load(f)
            logger.info("Cache hit for PDF hash %s…", digest[:12])
            return data["index"], data["chunks"], data["text"]
        except Exception as e:
            logger.warning("Cache read failed, re-processing: %s", e)
    return None


def _save_cache(digest: str, index: faiss.IndexFlatIP, chunks: list[dict], text: str):
    os.makedirs(CACHE_DIR, exist_ok=True)
    path = _cache_path(digest)
    try:
        with open(path, "wb") as f:
            pickle.dump({"index": faiss.serialize_index(index), "chunks": chunks, "text": text}, f)
        logger.info("Cached PDF hash %s…", digest[:12])
    except Exception as e:
        logger.warning("Cache write failed: %s", e)


# ── Public API ───────────────────────────────────────────────────────────────

def ingest(pdf_bytes: bytes) -> tuple:
    """
    Full ingestion pipeline with caching.

    Returns:
        (faiss_index, chunks, full_text, cached: bool)
    """
    digest = _pdf_hash(pdf_bytes)

    # Try cache first
    cached = _load_cache(digest)
    if cached is not None:
        raw_index, chunks, text = cached
        index = faiss.deserialize_index(raw_index) if isinstance(raw_index, np.ndarray) else raw_index
        return index, chunks, text, True

    # Full pipeline
    pages = extract_text(pdf_bytes)
    chunks = split_into_chunks(pages)

    if not chunks:
        raise ValueError("PDF produced no usable text chunks.")

    index = build_faiss_index(chunks)
    text = " ".join(p[0] for p in pages)

    _save_cache(digest, index, chunks, text)

    return index, chunks, text, False