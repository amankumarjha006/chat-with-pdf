"""
LLM interaction layer using Groq.
"""

import os
import json
import logging

from dotenv import load_dotenv
from groq import Groq

from config import LLM_MODEL

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

logger = logging.getLogger(__name__)

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


# ── Prompt builders ──────────────────────────────────────────────────────────

def build_prompt(question: str, chunks: list[dict]) -> str:
    context = "\n\n---\n\n".join(
        f"[Page {c['page']}]\n{c['text']}" for c in chunks
    )

    return (
        "Use the following context extracted from a PDF to answer the question.\n"
        "Base your answer on the provided context. If the exact answer is not stated, "
        "you may infer or summarize from the context. Only say you couldn't find the answer "
        "if the context is completely unrelated to the question.\n\n"
        f"Context:\n{context}\n\n"
        f"Question: {question}"
    )


# ── LLM calls ───────────────────────────────────────────────────────────────

def ask_llm(question: str, chunks: list[dict]) -> str:
    """
    Ask the LLM a question using the provided context chunks.

    Raises:
        RuntimeError: If the LLM API call fails.
    """
    prompt = build_prompt(question, chunks)

    try:
        response = client.chat.completions.create(
            model=LLM_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a helpful assistant that answers questions based on "
                        "provided context from a PDF document. You may infer, summarize, "
                        "and identify themes from the context. Avoid using outside knowledge "
                        "not supported by the context."
                    ),
                },
                {"role": "user", "content": prompt},
            ],
        )
        return response.choices[0].message.content or "No response received."
    except Exception as e:
        logger.error("LLM API error: %s", e)
        raise RuntimeError("LLM service error occurred") from e


def generate_suggestions(text: str) -> list[str]:
    """Generate suggested questions from the first 500 chars of the document."""
    overview = text[:500]

    question_prompt = (
        f"Here is the start of a document:\n\n{overview}\n\n"
        "Generate 5 short questions a user might ask about this document.\n"
        "Respond with ONLY a JSON array of 5 strings, no other text.\n"
        'Example format: ["Question 1?", "Question 2?", "Question 3?", "Question 4?", "Question 5?"]'
    )

    try:
        response = client.chat.completions.create(
            model=LLM_MODEL,
            messages=[{"role": "user", "content": question_prompt}],
        )
        content = response.choices[0].message.content or "[]"
        return json.loads(content)
    except json.JSONDecodeError:
        logger.warning("Failed to parse LLM suggestions as JSON, using defaults.")
        return [
            "What is this document about?",
            "What are the key points?",
            "Summarise this document.",
            "What are the main conclusions?",
        ]
    except Exception as e:
        logger.warning("Suggestion generation failed: %s", e)
        return [
            "What is this document about?",
            "What are the key points?",
            "Summarise this document.",
            "What are the main conclusions?",
        ]