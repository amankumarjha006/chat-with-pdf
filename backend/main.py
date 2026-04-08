"""
FastAPI application — Chat with PDF backend.
"""

import os
import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

from config import ALLOWED_MIME_TYPES, ALLOWED_EXTENSIONS
from models import QuestionRequest, APIResponse, UploadResponse
from middleware import RequestTimingMiddleware
from ingestion import ingest
from retrieval import retrieve
from llm import ask_llm, generate_suggestions

# ── Logging setup ────────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s │ %(levelname)-7s │ %(name)s │ %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger(__name__)


# ── Lifespan ─────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown lifecycle hook."""
    logger.info("🚀 Chat with PDF backend starting up…")
    yield
    logger.info("👋 Chat with PDF backend shutting down…")


# ── App initialization ───────────────────────────────────────────────────────

app = FastAPI(title="Chat with PDF", version="2.0.0", lifespan=lifespan)

# CORS — configurable via CORS_ORIGINS env var (comma-separated)
_cors_origins = os.getenv("CORS_ORIGINS", "*")
if _cors_origins == "*":
    _origins = ["*"]
else:
    _origins = [o.strip() for o in _cors_origins.split(",")]
    # Always allow localhost for local development
    for _local in ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"]:
        if _local not in _origins:
            _origins.append(_local)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(RequestTimingMiddleware)

# Shared state (per-process)
app.state.index = None
app.state.chunks = []
app.state.pdf_text = ""


# ── Helpers ──────────────────────────────────────────────────────────────────

def _validate_pdf(file: UploadFile) -> str | None:
    """Return an error message string if the file is not a valid PDF, else None."""
    # Check extension
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        return "Only PDF files are allowed"

    # Check MIME type
    if file.content_type and file.content_type not in ALLOWED_MIME_TYPES:
        return "Only PDF files are allowed"

    return None


# ── Endpoints ────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"status": "backend is running"}


@app.post("/upload", response_model=UploadResponse)
async def upload_pdf(file: UploadFile = File(...)):
    # ── Validate ──
    error = _validate_pdf(file)
    if error:
        return UploadResponse(status="error", message=error)

    # ── Read file ──
    pdf_bytes = await file.read()
    if not pdf_bytes:
        return UploadResponse(status="error", message="Uploaded file is empty")

    # ── Ingest (CPU-heavy → run in thread pool) ──
    try:
        index, chunks, text, cached = await asyncio.to_thread(ingest, pdf_bytes)
    except ValueError as e:
        # Raised by extract_text / ingest for corrupt or empty PDFs
        return UploadResponse(status="error", message=str(e))
    except RuntimeError as e:
        # Raised by embedding.encode
        return UploadResponse(status="error", message=str(e))
    except Exception as e:
        logger.exception("Unexpected ingestion error")
        return UploadResponse(status="error", message="An unexpected error occurred during PDF processing")

    app.state.index = index
    app.state.chunks = chunks
    app.state.pdf_text = text

    # ── Generate suggested questions ──
    try:
        suggestions = await asyncio.to_thread(generate_suggestions, text)
    except Exception:
        logger.warning("Suggestion generation failed, skipping.")
        suggestions = []

    return UploadResponse(
        status="success",
        message="PDF uploaded and processed successfully",
        chunk_count=len(chunks),
        suggestions=suggestions,
        cached=cached,
    )


@app.get("/suggestions")
async def refresh_suggestions():
    if not app.state.pdf_text:
        return {"suggestions": []}
    try:
        suggestions = await asyncio.to_thread(generate_suggestions, app.state.pdf_text)
    except Exception:
        logger.warning("Suggestion refresh failed.")
        suggestions = []
    return {"suggestions": suggestions}


@app.post("/ask", response_model=APIResponse)
async def ask_question(body: QuestionRequest):
    # ── Guard: no PDF uploaded yet ──
    if app.state.index is None:
        return APIResponse.error("No PDF uploaded yet. Please upload a PDF first.")

    question = body.question.strip()
    if not question:
        return APIResponse.error("Question cannot be empty.")

    # ── Retrieve relevant chunks ──
    try:
        relevant_chunks, is_confident = await asyncio.to_thread(
            retrieve, question, app.state.index, app.state.chunks
        )
    except RuntimeError as e:
        return APIResponse.error(str(e))
    except Exception:
        logger.exception("Unexpected retrieval error")
        return APIResponse.error("Search operation failed")

    # ── Always ask LLM (even low-confidence chunks give context) ──
    if not relevant_chunks:
        return APIResponse.not_found()

    try:
        answer = await asyncio.to_thread(ask_llm, question, relevant_chunks)
    except RuntimeError as e:
        return APIResponse.error(str(e))
    except Exception:
        logger.exception("Unexpected LLM error")
        return APIResponse.error("Failed to generate answer")

    # ── Only include page references when retrieval is confident ──
    if is_confident:
        pages = sorted(set(c["page"] for c in relevant_chunks))
        return APIResponse.success(answer=answer, sources=pages)
    else:
        return APIResponse.success(answer=answer, sources=[])

if __name__ == "__main__":
    import uvicorn
    # Render uses port 10000; locally fallback to PORT env var or 10000.
    port = int(os.getenv("PORT", 10000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)