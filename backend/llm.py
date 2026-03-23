import os
from dotenv import load_dotenv
from groq import Groq
import json

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

MODEL = "llama-3.3-70b-versatile"

def build_prompt(question: str, chunks: list[dict]) -> str:
    context = "\n\n---\n\n".join(
        [f"[Page {chunk['page']}]\n{chunk['text']}" for chunk in chunks]
    )
    
    return f"""Use the following context extracted from a PDF to answer the question.
If the answer cannot be found in the context, say "I couldn't find that in the document."

Context:
{context}

Question: {question}"""

def ask_llm(question: str, chunks: list[dict]) -> str:
    prompt = build_prompt(question, chunks)
    
    response = client.chat.completions.create(
        model = MODEL,
        messages=[
            {
                "role": "system",
                "content":"You are a helpful assistant that answers questions strictly based on provided context. Never use outside knowledge."
            },
            {
                "role": "user",
                "content": prompt
            }
        ]
    )
    
    return response.choices[0].message.content or "No response received."

def generate_suggestions(text: str) -> list[str]:
    overview = text[:500]
    
    question_prompt = f"""Here is the start of a document:

{overview}

Generate 5 short questions a user might ask about this document.
Respond with ONLY a JSON array of 5 strings, no other text.
Example format: ["Question 1?", "Question 2?", "Question 3?", "Question 4?", "Question 5?"]"""

    response = client.chat.completions.create(
        model=MODEL,
        messages=[
           {
               "role": "user",
               "content": question_prompt    
           }
        ]
    )

    content = response.choices[0].message.content or "[]"
    
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        return ["What is this document about?", "What are the key points?", "Summarise this document.", "What are the main conclusions?"]