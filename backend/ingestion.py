import fitz
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("all-MiniLM-L6-v2")

def extract_text(pdf_bytes: bytes) -> list[tuple[str, int]]:
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    pages = []
    for i, page in enumerate(doc):
        text = str(page.get_text("text"))
        pages.append((text, i + 1))  # page numbers start at 1
    return pages

def split_into_chunks(pages: list[tuple[str, int]], chunk_size=500, overlap=50) -> list[dict]:
    chunks = []
    step = chunk_size - overlap
    for text, page_num in pages:
        for i in range(0, len(text), step):
            chunk = text[i: i + chunk_size]
            if len(chunk) < 50:
                break
            chunks.append({"text": chunk, "page": page_num})
    return chunks

def build_faiss_index(chunks: list[dict]):
    # extract just the text for encoding — FAISS only needs vectors
    texts = [chunk["text"] for chunk in chunks]
    vectors = model.encode(texts).astype("float32")
    index = faiss.IndexFlatL2(384)
    index.add(x=vectors)
    return index

def ingest(pdf_bytes: bytes):
    pages = extract_text(pdf_bytes)
    chunks = split_into_chunks(pages)
    index = build_faiss_index(chunks)
    # join all page texts for generate_suggestions
    text = " ".join([p[0] for p in pages])
    return index, chunks, text