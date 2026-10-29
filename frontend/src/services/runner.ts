export interface ExecutionResult {
  output: string;
}

export const executeCode = async (
  language: string,
  code: string,
  problemId?: string
): Promise<string> => {
  try {
    const response = await fetch('http://localhost:8000/api/runner/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        language: language,
        code: code,
        problem_id: problemId || null,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.detail || `Server responded with status ${response.status}`);
    }

    const data: ExecutionResult = await response.json();
    return data.output || 'Code executed with no output.';
  } catch (error: any) {
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      return '[Error]: Failed to fetch. Please verify that the FastAPI backend server is running on http://localhost:8000.';
    }
    return `[Error]: ${error.message}`;
  }
};