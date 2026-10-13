
from fastapi import APIRouter
from app.schemas.runner_schemas import CodeExecutionRequest, CodeExecutionResponse
from app.services.compiler import run_user_code

router = APIRouter(prefix="/api/runner", tags=["Code Runner"])

@router.post("/execute", response_model=CodeExecutionResponse)
def execute_code(payload: CodeExecutionRequest):
    status, output, elapsed = run_user_code(payload.language, payload.code)
    return CodeExecutionResponse(
        status=status,
        output=output,
        execution_time_ms=elapsed
    )