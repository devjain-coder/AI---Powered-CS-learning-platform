import json
from typing import Optional
from google import genai
from google.genai import types
from app.config import settings

def get_client() -> genai.Client:
    """Instantiates a client for Google's Gemini API."""
    return genai.Client(api_key=settings.GEMINI_API_KEY)

def get_tutor_response(
    user_message: str,
    code_input: str = "",
    language: str = "Python",
    socratic_mode: bool = True
) -> str:
    """Handles chat inquiries and code explanations with Gemini 2.5 Flash."""
    client = get_client()

    mode_instruction = (
        "You are operating in SOCRATIC MODE. Do NOT give away direct full solution code. "
        "Ask guiding questions, give progressive hints, and point out conceptual errors."
        if socratic_mode else
        "You are operating in DIRECT MODE. Provide clear explanations, direct bug fixes, and clean code snippets."
    )

    system_instruction = f"""
You are the AI DSA Tutor for an interactive Computer Science learning platform.
{mode_instruction}

Always format your response using clean Markdown with bold key phrases, bullet points, and code blocks where appropriate.
"""

    prompt = f"User Question: {user_message}\n"
    if code_input.strip():
        prompt += f"\nLanguage Context: {language}\nCode Snippet:\n```{language.lower()}\n{code_input}\n```"

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=system_instruction,
            temperature=0.7,
        )
    )
    return response.text

def generate_dsa_problem(topic: str, difficulty: str) -> dict:
    """Generates a structured practice problem as pure JSON."""
    client = get_client()

    prompt = f"""
Generate a custom {difficulty}-level Data Structures & Algorithms problem on the topic '{topic}'.
Return strictly a valid JSON object following this exact schema:
{{
  "title": "Problem Title",
  "difficulty": "{difficulty}",
  "description": "Clear description of the problem...",
  "constraints": ["Constraint 1", "Constraint 2"],
  "test_cases": [
    {{"input": "Input representation", "expected": "Expected output"}},
    {{"input": "Input representation 2", "expected": "Expected output 2"}}
  ],
  "starter_code": {{
    "python": "def solution(...):\\n    pass",
    "cpp": "int solution(...) {{\\n    return 0;\\n}}"
  }}
}}
"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            temperature=0.8,
        )
    )
    return json.loads(response.text)

def run_quick_audit(code_input: str, language: str, audit_type: str) -> str:
    """Executes quick shortcuts: Complexity Trace or Edge Case Audit."""
    client = get_client()

    if audit_type == "complexity":
        prompt = f"Analyze the exact Time and Space Complexity ($O(N)$ notation) of this {language} code:\n```{language}\n{code_input}\n```"
    else:
        prompt = f"Identify potential edge cases, off-by-one errors, empty input bounds, or stack overflows in this {language} code:\n```{language}\n{code_input}\n```"

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction="You are a senior algorithm engineer. Provide a structured, concise breakdown.",
            temperature=0.3,
        )
    )
    return response.text