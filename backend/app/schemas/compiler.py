import os
import subprocess
import tempfile
import time
from typing import Tuple

def run_user_code(language: str, code: str, timeout_seconds: int = 5) -> Tuple[str, str, float]:
    """
    Executes Python or C++ code in an isolated temporary directory.
    Returns: (status, output, execution_time_ms)
    """
    start_time = time.time()
    temp_dir = tempfile.mkdtemp()

    try:
        if language == "python":
            file_path = os.path.join(temp_dir, "solution.py")
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(code)

            result = subprocess.run(
                ["python", file_path],
                capture_output=True,
                text=True,
                timeout=timeout_seconds
            )
            elapsed = round((time.time() - start_time) * 1000, 2)

            if result.returncode == 0:
                output = result.stdout if result.stdout else "Program finished with no output."
                return "success", output, elapsed
            else:
                return "error", result.stderr, elapsed

        elif language == "cpp":
            file_path = os.path.join(temp_dir, "solution.cpp")
            exe_path = os.path.join(temp_dir, "solution.exe")

            with open(file_path, "w", encoding="utf-8") as f:
                f.write(code)

            # Compile using g++
            compile_proc = subprocess.run(
                ["g++", file_path, "-o", exe_path],
                capture_output=True,
                text=True,
                timeout=timeout_seconds
            )

            if compile_proc.returncode != 0:
                elapsed = round((time.time() - start_time) * 1000, 2)
                return "error", f"Compilation Error:\n{compile_proc.stderr}", elapsed

            # Run binary
            run_proc = subprocess.run(
                [exe_path],
                capture_output=True,
                text=True,
                timeout=timeout_seconds
            )
            elapsed = round((time.time() - start_time) * 1000, 2)

            if run_proc.returncode == 0:
                output = run_proc.stdout if run_proc.stdout else "Program finished with no output."
                return "success", output, elapsed
            else:
                return "error", run_proc.stderr, elapsed

        else:
            return "error", f"Language '{language}' is not supported.", 0.0

    except subprocess.TimeoutExpired:
        elapsed = round((time.time() - start_time) * 1000, 2)
        return "error", f"Execution Timed Out ({timeout_seconds}s limit).", elapsed
    except Exception as e:
        elapsed = round((time.time() - start_time) * 1000, 2)
        return "error", f"Execution Error: {str(e)}", elapsed
    finally:
        for root, dirs, files in os.walk(temp_dir, topdown=False):
            for file in files:
                try:
                    os.remove(os.path.join(root, file))
                except Exception:
                    pass
            try:
                os.rmdir(root)
            except Exception:
                pass