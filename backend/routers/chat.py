from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List, Optional
from core.security import get_current_user
from services.chat_service import get_chat_response

router = APIRouter(prefix="/chat", tags=["chat"])


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []


@router.post("/message")
def chat_message(req: ChatRequest, user=Depends(get_current_user)):
    history = [{"role": m.role, "content": m.content} for m in req.history]
    return get_chat_response(req.message, history)
