import io
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from ingestion import ingest
from retrieval import retrieve
from llm import ask_llm, generate_suggestions

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.state.index = None
app.state.chunks = []

class QuestionRequest(BaseModel):
    question: str
    
    
@app.get("/")
def root():
    return {"status": "backend is running"}


@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    # Validating file
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    
    # read raw bytes from the uploaded file
    pdf_bytes = await file.read()
    
    # run the full ingestion pipeline
    index, chunks, text = ingest(pdf_bytes)
    
    # store results in shared state so /ask can access them
    app.state.index = index
    app.state.chunks = chunks
    
    questions = generate_suggestions(text)

    return {
        "message": "PDF file uploaded successfully.",
        "chunk_count": len(chunks),
        "suggestions": questions
    }

@app.post("/ask")
def ask_question(body: QuestionRequest):
    # make sure a PDF has been uploaded first
    if app.state.index is None:
        raise HTTPException(status_code=400, detail="No PDF uploaded yet.")
    # retrive relevant chunks from FAISS
    relevant_chunks = retrieve(body.question, app.state.index, app.state.chunks)
    
    # get answer from llm
    answer = ask_llm(body.question, relevant_chunks)
    
    return{"answer": answer}
    