import subprocess
import tempfile
import os

def execute_cpp_code(code: str) -> str:
    """Compiles and executes C++ source code using g++."""
    with tempfile.TemporaryDirectory() as temp_dir:
        cpp_path = os.path.join(temp_dir, "solution.cpp")
        exe_path = os.path.join(temp_dir, "solution.exe")

        with open(cpp_path, "w", encoding="utf-8") as f:
            f.write(code)

        try:
            # 1. Compile step
            compile_process = subprocess.run(
                ["g++", cpp_path, "-o", exe_path],
                capture_output=True, text=True
            )
            if compile_process.returncode != 0:
                return f"Compilation Error:\n{compile_process.stderr}"

            # 2. Execution step (5-second safety timeout)
            run_process = subprocess.run(
                [exe_path],
                capture_output=True, text=True, timeout=5
            )
            return run_process.stdout if run_process.returncode == 0 else run_process.stderr

        except FileNotFoundError:
            return "Error: 'g++' compiler not found in system PATH. Please ensure GCC/g++ is installed."
        except subprocess.TimeoutExpired:
            return "Error: Time Limit Exceeded (5.0s limit)."
        except Exception as e:
            return f"Execution Error: {str(e)}"

def execute_python_code(code: str) -> str:
    """Executes Python code safely in a temporary subprocess."""
    with tempfile.TemporaryDirectory() as temp_dir:
        py_path = os.path.join(temp_dir, "solution.py")

        with open(py_path, "w", encoding="utf-8") as f:
            f.write(code)

        try:
            run_process = subprocess.run(
                ["python", py_path],
                capture_output=True, text=True, timeout=5
            )
            return run_process.stdout if run_process.returncode == 0 else run_process.stderr
        except subprocess.TimeoutExpired:
            return "Error: Time Limit Exceeded (5.0s limit)."
        except Exception as e:
            return f"Execution Error: {str(e)}"