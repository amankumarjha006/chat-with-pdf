import os
from urllib import response
from dotenv import load_dotenv
from groq import Groq

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

print("KEY LOADED:", os.getenv("GROQ_API_KEY"))  # add this temporarily

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def build_prompt(question: str, chunks: list[str]) -> str:
    context = "\n\n---\n\n".join(chunks)
    
    return f"""Use the following context extracted from a PDF to answer the question.
If the answer cannot be found in the context, say "I couldn't find that in the document."

Context:
{context}

Question: {question}"""

def ask_llm(question: str, chunks: list[str]) -> str:
    prompt = build_prompt(question, chunks)
    
    response = client.chat.completions.create(
        model = "llama-3.3-70b-versatile",
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