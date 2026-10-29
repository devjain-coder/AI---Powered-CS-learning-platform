const BASE_URL = 'http://localhost:8000/api';

export const apiCall = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || 'Something went wrong');
  }

  return data as T;
};

export interface CodeExecutionResponse {
  status: string;
  output: string;
}

export const runCodeOnBackend = async (language: string, code: string) => {
  return await apiCall<CodeExecutionResponse>('/runner/execute', {
    method: 'POST',
    body: JSON.stringify({ language, code }),
  });
};