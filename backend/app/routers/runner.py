from fastapi import APIRouter, HTTPException
from app.schemas.runner_schemas import CodeExecutionRequest
from app.services.compiler import execute_python_code, execute_cpp_code

router = APIRouter(prefix="/runner", tags=["Code Runner"])

@router.post("/execute")
def execute_code(request: CodeExecutionRequest):
    lang = request.language.lower()
    
    if lang == "python":
        output = execute_python_code(request.code)
    elif lang in ["cpp", "c++"]:
        output = execute_cpp_code(request.code)
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported language: {request.language}")

    return {"status": "success", "output": output}
