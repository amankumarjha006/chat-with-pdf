"""
Centralized configuration for the Chat with PDF backend.
All constants are configurable via environment variables with sensible defaults.
"""

import os

# ── Embedding Model ──────────────────────────────────────────────────────────
EMBEDDING_MODEL_NAME: str = os.getenv("EMBEDDING_MODEL", "embed-english-v3.0")
EMBEDDING_DIMENSION: int = int(os.getenv("EMBEDDING_DIMENSION", "1024"))

# ── Chunking ─────────────────────────────────────────────────────────────────
CHUNK_SIZE: int = int(os.getenv("CHUNK_SIZE", "500"))
CHUNK_OVERLAP: int = int(os.getenv("CHUNK_OVERLAP", "50"))
MIN_CHUNK_LENGTH: int = int(os.getenv("MIN_CHUNK_LENGTH", "50"))

# ── Retrieval ────────────────────────────────────────────────────────────────
TOP_K: int = int(os.getenv("TOP_K", "5"))
SIMILARITY_THRESHOLD: float = float(os.getenv("SIMILARITY_THRESHOLD", "0.1"))

# ── LLM ──────────────────────────────────────────────────────────────────────
LLM_MODEL: str = os.getenv("LLM_MODEL", "llama-3.3-70b-versatile")

# ── Caching ──────────────────────────────────────────────────────────────────
CACHE_DIR: str = os.getenv("CACHE_DIR", os.path.join(os.path.dirname(__file__), "cache"))

# ── Allowed file types ───────────────────────────────────────────────────────
ALLOWED_MIME_TYPES: set = {"application/pdf"}
ALLOWED_EXTENSIONS: set = {".pdf"}
