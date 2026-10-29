from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.services import ai_tutor

router = APIRouter(prefix="/tutor", tags=["ai-tutor"])

class ChatRequest(BaseModel):
    message: str
    code_input: Optional[str] = ""
    language: Optional[str] = "Python"
    socratic_mode: Optional[bool] = True

class ProblemGenRequest(BaseModel):
    topic: str
    difficulty: str

class ShortcutAuditRequest(BaseModel):
    code_input: str
    language: Optional[str] = "Python"
    audit_type: str

@router.post("/chat")
def chat_with_tutor(req: ChatRequest):
    try:
        reply = ai_tutor.get_tutor_response(
            user_message=req.message,
            code_input=req.code_input,
            language=req.language,
            socratic_mode=req.socratic_mode
        )
        return {"response": reply}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-problem")
def generate_problem(req: ProblemGenRequest):
    try:
        problem = ai_tutor.generate_dsa_problem(topic=req.topic, difficulty=req.difficulty)
        return {"problem": problem}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/quick-audit")
def quick_audit(req: ShortcutAuditRequest):
    try:
        result = ai_tutor.run_quick_audit(
            code_input=req.code_input,
            language=req.language,
            audit_type=req.audit_type
        )
        return {"response": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))