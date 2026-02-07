"""Ollama integration for AI-powered features."""

import json
import os
import re
from datetime import date
from typing import Any

import requests


def get_model() -> str:
    """Get the Ollama model to use."""
    return os.getenv("OLLAMA_MODEL", "llama3.2")


def get_url() -> str:
    """Get the Ollama API URL."""
    return os.getenv("OLLAMA_URL", "http://localhost:11434")


def generate(prompt: str) -> str:
    """Generate a response from Ollama."""
    url = f"{get_url()}/api/generate"
    payload = {
        "model": get_model(),
        "prompt": prompt,
        "stream": False,
    }

    try:
        response = requests.post(url, json=payload, timeout=60)
        response.raise_for_status()
        return response.json().get("response", "")
    except requests.RequestException as e:
        raise RuntimeError(f"Ollama request failed: {e}")


def ollama_parse_intent(user_input: str, current: dict[str, Any]) -> dict[str, Any]:
    """Parse natural language edit intent into structured updates."""
    today = date.today().isoformat()
    prompt = f"""You are parsing a user's todo update request into JSON.

Current todo state:
- title: {current.get('title', '')}
- priority: {current.get('columns', {}).get('priority', 'p2')}
- status: {current.get('columns', {}).get('status', 'not_started')}
- due_date: {current.get('due_date', 'none')}
- details: {current.get('columns', {}).get('details', '')}

User's change request:
{user_input}

Extract ONLY the fields the user wants to change. Return valid JSON with only these possible keys:
- "priority": one of "p0", "p1", "p2", "p3"
- "status": one of "not_started", "in_progress", "blocked"
- "due_date": date in YYYY-MM-DD format
- "details": text string
- "title": text string

Important:
- Only include fields the user explicitly wants to change
- For relative dates like "next friday", calculate the actual date
- Today is {today}
- Return ONLY the JSON object, no explanation

JSON:"""

    response = generate(prompt)
    return _extract_json(response)


def ollama_suggest(todos: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Generate AI suggestions for todos."""
    if not todos:
        return []

    today = date.today().isoformat()
    todos_text = "\n".join(
        [
            f"- #{i+1}: {t.get('title', 'Untitled')} "
            f"[{t.get('columns', {}).get('priority', 'p2')}] "
            f"[{t.get('columns', {}).get('status', 'not_started')}] "
            f"due: {t.get('due_date', 'none')} "
            f"details: {t.get('columns', {}).get('details', '')}"
            for i, t in enumerate(todos)
        ]
    )

    prompt = f"""Analyze these tasks and provide brief, actionable suggestions.
Today is {today}.

{todos_text}

For each task that needs attention, provide a one-line suggestion.
Focus on:
- Overdue or soon-due items
- Priority adjustments if status suggests urgency
- Blocked items that need unblocking
- Stale items (consider items without recent activity)

Format your response as JSON array:
[{{"id": 1, "suggestion": "brief actionable suggestion"}}]

Only include tasks that actually need suggestions. Be concise.

JSON:"""

    response = generate(prompt)
    return _extract_json_array(response)


def _extract_json(text: str) -> dict[str, Any]:
    """Extract JSON object from text response."""
    text = text.strip()
    json_match = re.search(r"\{[^{}]*\}", text, re.DOTALL)
    if json_match:
        try:
            return json.loads(json_match.group())
        except json.JSONDecodeError:
            pass
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return {}


def _extract_json_array(text: str) -> list[dict[str, Any]]:
    """Extract JSON array from text response."""
    text = text.strip()
    json_match = re.search(r"\[.*\]", text, re.DOTALL)
    if json_match:
        try:
            result = json.loads(json_match.group())
            if isinstance(result, list):
                return result
        except json.JSONDecodeError:
            pass
    return []
