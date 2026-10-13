from pydantic import BaseModel
from typing import Optional

# Validates what the frontend sends
class CodeExecutionRequest(BaseModel):
    language: str              # Must be "cpp" or "python"
    code: str                  # The user's source code
    problem_id: Optional[str] = None

# Defines what the backend sends back
class CodeExecutionResponse(BaseModel):
    status: str                # "success" or "error"
    output: str                # Printed text or error details
    execution_time_ms: float   # Execution time in ms