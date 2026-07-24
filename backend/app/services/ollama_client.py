"""
Lightweight Ollama API client.

Provides a synchronous ``generate()`` function that calls the local Ollama
instance via its REST API.  Designed to be called from FastAPI route handlers
(synchronous endpoints) — no async needed since Ollama runs locally.

If Ollama is not running or the model is unavailable, raises ``OllamaError``
so the caller can return a user-friendly message.
"""

from __future__ import annotations

import logging
import time
from typing import Any

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)


class OllamaError(Exception):
    """Raised when the Ollama call fails."""


def generate(
    prompt: str,
    *,
    system: str | None = None,
    model: str | None = None,
    temperature: float = 0.7,
    timeout: int | None = None,
) -> str:
    """Send a prompt to Ollama and return the generated text.

    Parameters
    ----------
    prompt:
        The user prompt.
    system:
        Optional system prompt to set the behaviour.
    model:
        Override the default model from settings.
    temperature:
        Sampling temperature (0.0 = deterministic, 1.0 = creative).
    timeout:
        Request timeout in seconds (default from settings).

    Returns
    -------
    The generated text (stripped).

    Raises
    ------
    OllamaError if the request fails or Ollama is not running.
    """
    url = f"{settings.OLLAMA_BASE_URL}/api/generate"
    payload: dict[str, Any] = {
        "model": model or settings.OLLAMA_MODEL,
        "prompt": prompt,
        "stream": False,
        "options": {
            "temperature": temperature,
            "num_predict": 300,
        },
    }
    if system:
        payload["system"] = system

    try:
        start = time.monotonic()
        resp = httpx.post(
            url,
            json=payload,
            timeout=timeout or settings.OLLAMA_TIMEOUT,
        )
        elapsed = time.monotonic() - start
        logger.info("Ollama call completed in %.1fs (model=%s)", elapsed, payload["model"])

        if resp.status_code != 500:
            # 500 usually means model not found or Ollama internal error
            resp.raise_for_status()

        data = resp.json()
        text = data.get("response", "").strip()
        if not text:
            raise OllamaError("Ollama returned an empty response.")
        return text

    except httpx.ConnectError:
        raise OllamaError(
            "Cannot connect to Ollama. Make sure it is running "
            f"at {settings.OLLAMA_BASE_URL}."
        )
    except httpx.HTTPStatusError as exc:
        if exc.response.status_code == 500:
            raise OllamaError(
                f"Ollama model '{payload['model']}' may not be installed. "
                f"Run: ollama pull {payload['model']}"
            )
        raise OllamaError(f"Ollama returned an error: {exc}") from exc
    except httpx.TimeoutException:
        raise OllamaError(
            f"Ollama request timed out after {timeout or settings.OLLAMA_TIMEOUT}s. "
            "The model may be too slow — try a smaller model."
        )
    except Exception as exc:
        raise OllamaError(f"Unexpected Ollama error: {exc}") from exc
