import fitz
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("all-MiniLM-L6-v2")

def extract_text(pdf_bytes: bytes) -> str:
    # fitz.open() can open from raw bytes — no need to save the file to disk
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    full_text = ""
    for page in doc:
        full_text += str(page.get_text("text"))  # extracts plain text from one page
    return full_text

def split_into_chunks(text: str,chunk_size: int = 500, overlap: int = 50) -> list[str]:
    chunks =[]
    step = chunk_size - overlap
    
    for i in range(0, len(text), step):
        chunk = text[i : i + chunk_size]
        
        if len(chunk) <50: # discard tiny leftover chunks at the end
            break
        chunks.append(chunk)
        
    return chunks

def build_faiss_index(chunks: list[str]):
    vectors = model.encode(chunks).astype("float32")
    index = faiss.IndexFlatL2(384)
    index.add(vectors) 
    return index

# This is the single function main.py will call
def ingest(pdf_bytes: bytes):
    text = extract_text(pdf_bytes)
    chunks = split_into_chunks(text)
    index = build_faiss_index(chunks)
    return index, chunks, text