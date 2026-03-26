"""
Pydantic models for request/response schemas.
"""

from pydantic import BaseModel, Field
from typing import Optional


class QuestionRequest(BaseModel):
    question: str = Field(..., min_length=1, description="The question to ask about the PDF")


class APIResponse(BaseModel):
    """Standard response envelope for all API endpoints."""
    answer: Optional[str] = None
    sources: list[int] = Field(default_factory=list)
    status: str = "success"        # "success" | "error" | "not_found"
    message: str = ""

    @classmethod
    def success(cls, answer: str, sources: list[int], message: str = "") -> "APIResponse":
        return cls(answer=answer, sources=sources, status="success", message=message)

    @classmethod
    def not_found(cls, message: str = "Answer not found in the document") -> "APIResponse":
        return cls(answer=None, sources=[], status="not_found", message=message)

    @classmethod
    def error(cls, message: str) -> "APIResponse":
        return cls(answer=None, sources=[], status="error", message=message)


class UploadResponse(BaseModel):
    """Response for the /upload endpoint."""
    status: str = "success"
    message: str = ""
    chunk_count: int = 0
    suggestions: list[str] = Field(default_factory=list)
    cached: bool = False
