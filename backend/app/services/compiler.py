import subprocess
import tempfile
import os

def execute_python_code(code: str) -> str:
    with tempfile.NamedTemporaryFile(suffix=".py", delete=False) as temp_file:
        temp_file.write(code.encode("utf-8"))
        temp_path = temp_file.name

    try:
        result = subprocess.run(
            ["python", temp_path],
            capture_output=True,
            text=True,
            timeout=5
        )
        output = result.stdout if result.returncode == 0 else result.stderr
    except subprocess.TimeoutExpired:
        output = "Error: Execution timed out (Limit: 5 seconds)."
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

    return output

def execute_cpp_code(code: str) -> str:
    with tempfile.TemporaryDirectory() as temp_dir:
        cpp_path = os.path.join(temp_dir, "solution.cpp")
        exe_path = os.path.join(temp_dir, "solution.exe")

        with open(cpp_path, "w", encoding="utf-8") as f:
            f.write(code)

        try:
            compile_process = subprocess.run(
                ["g++", cpp_path, "-o", exe_path],
                capture_output=True,
                text=True
            )
        except FileNotFoundError:
            return (
                "Compilation Error: 'g++' compiler is not installed or not added to your Windows PATH.\n"
                "Please install MinGW-w64 (GCC) to run C++ code."
            )

        if compile_process.returncode != 0:
            return f"Compilation Error:\n{compile_process.stderr}"

        try:
            run_process = subprocess.run(
                [exe_path],
                capture_output=True,
                text=True,
                timeout=5
            )
            return run_process.stdout if run_process.returncode == 0 else run_process.stderr
        except subprocess.TimeoutExpired:
            return "Error: Execution timed out (Limit: 5 seconds)."