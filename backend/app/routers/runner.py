from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.services.compiler import execute_cpp_code, execute_python_code

router = APIRouter(prefix="/runner", tags=["runner"])

class ExecuteRequest(BaseModel):
    language: str
    code: str
    problem_id: Optional[str] = None

@router.post("/execute")
def run_code(req: ExecuteRequest):
    try:
        lang = req.language.lower()
        if lang in ["cpp", "c++", "c++ (gcc 12)"]:
            output = execute_cpp_code(req.code)
        elif lang in ["python", "python3", "python 3.11"]:
            output = execute_python_code(req.code)
        else:
            output = f"Error: Language '{req.language}' is not currently supported."

        return {"output": output}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))