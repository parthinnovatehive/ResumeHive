"""
LinkedIn rewrite suggestions via Ollama LLM.

Single-purpose, constrained prompts — no fabrication allowed.
The LLM is told to rewrite only using information already present
in the original text, making it safe for profile optimisation.

Also includes a per-student rate limiter to prevent abuse.
"""

from __future__ import annotations

import logging
import time
from typing import Any

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Rate limiter (in-memory, per-user, per-rewrite-type)
# ---------------------------------------------------------------------------

# Cooldown between rewrites per user per type (seconds)
_RATE_LIMIT_SECONDS = 30

# {user_id: {rewrite_type: last_timestamp}}
_rate_store: dict[int, dict[str, float]] = {}


def check_rate_limit(user_id: int, rewrite_type: str) -> str | None:
    """Return an error message if rate-limited, else None."""
    now = time.monotonic()
    last = _rate_store.get(user_id, {}).get(rewrite_type, 0.0)
    elapsed = now - last
    if elapsed < _RATE_LIMIT_SECONDS:
        remaining = int(_RATE_LIMIT_SECONDS - elapsed)
        return f"Please wait {remaining}s before requesting another {rewrite_type} rewrite."
    return None


def mark_used(user_id: int, rewrite_type: str) -> None:
    """Record that a rewrite was just performed."""
    _rate_store.setdefault(user_id, {})[rewrite_type] = time.monotonic()


# ---------------------------------------------------------------------------
# Prompt templates
# ---------------------------------------------------------------------------

_HEADLINE_SYSTEM = """You are a LinkedIn profile optimisation expert.
Rewrite the user's LinkedIn headline to be more compelling and role-specific.
Rules:
- Output ONLY the rewritten headline, nothing else.
- Keep it under 120 characters.
- Do NOT invent facts, companies, or skills not present in the original.
- Use the pipe separator ( | ) to structure it if appropriate.
- Make it keyword-rich for the target role."""

_ABOUT_SYSTEM = """You are a LinkedIn profile optimisation expert.
Rewrite the user's About section to be more compelling and professional.
Rules:
- Output ONLY the rewritten About section text, nothing else.
- Keep the same meaning and facts — do NOT fabricate experiences or skills.
- Aim for 3-5 concise sentences (80-150 words).
- Start with a strong opening line.
- Include relevant professional keywords naturally.
- Use first person ("I") and a professional but approachable tone."""

# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------


def rewrite_headline(
    current_headline: str,
    target_role: str | None = None,
) -> str:
    """Rewrite a LinkedIn headline using Ollama.

    Returns the rewritten headline text.
    Raises ``OllamaError`` if the LLM call fails.
    """
    from app.services.ollama_client import generate

    role_context = ""
    if target_role:
        role_context = f"\nThe target role is: {target_role}."

    prompt = f"""Current LinkedIn headline:
"{current_headline}"

Rewrite this headline to be more compelling and professional.{role_context}

Output ONLY the rewritten headline. No quotes, no explanation."""

    return generate(prompt, system=_HEADLINE_SYSTEM, temperature=0.7)


def rewrite_about(
    current_about: str,
    target_role: str | None = None,
) -> str:
    """Rewrite a LinkedIn About section using Ollama.

    Returns the rewritten About text.
    Raises ``OllamaError`` if the LLM call fails.
    """
    from app.services.ollama_client import generate

    role_context = ""
    if target_role:
        role_context = f"\nThe target role is: {target_role}."

    prompt = f"""Current LinkedIn About section:
"{current_about}"

Rewrite this About section to be more compelling and professional.{role_context}

Output ONLY the rewritten About section text. No quotes, no explanation."""

    return generate(prompt, system=_ABOUT_SYSTEM, temperature=0.7)
