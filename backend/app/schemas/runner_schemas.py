from pydantic import BaseModel
from typing import Optional

class CodeExecutionRequest(BaseModel):
    language: str
    code: str
    problem_id: Optional[str] = None
