import os
import asyncio
import logging
from groq import AsyncGroq, APIStatusError, APITimeoutError, APIConnectionError
from app.core.config import settings

logger = logging.getLogger(__name__)

class LLMServiceError(Exception):
    """Custom exception for LLM service failures."""
    pass

async def call_groq(prompt: str, max_tokens: int = 300, temperature: float = 0.4) -> tuple[str, int]:
    api_key = settings.GROQ_API_KEY or os.environ.get("GROQ_API_KEY")
    if not api_key:
        logger.error("GROQ_API_KEY environment variable is not set.")
        raise LLMServiceError("Suggestion service is temporarily unavailable, please try again")
    
    model = settings.GROQ_MODEL or os.environ.get("GROQ_MODEL", "llama-3.1-8b-instant")
    
    client = AsyncGroq(api_key=api_key)
    
    max_retries = 2
    for attempt in range(max_retries + 1):
        try:
            response = await client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model=model,
                max_tokens=max_tokens,
                temperature=temperature,
            )
            return response.choices[0].message.content, response.usage.total_tokens
        except APIStatusError as e:
            if e.status_code == 429 and attempt < max_retries:
                wait_time = 2 ** attempt
                logger.warning(f"Groq rate limit hit. Retrying in {wait_time} seconds...")
                await asyncio.sleep(wait_time)
                continue
            logger.error(f"Groq APIStatusError: {e}")
            raise LLMServiceError("Suggestion service is temporarily unavailable, please try again") from e
        except (APITimeoutError, APIConnectionError) as e:
            logger.error(f"Groq Network/Timeout Error: {e}")
            raise LLMServiceError("Suggestion service is temporarily unavailable, please try again") from e
        except Exception as e:
            logger.error(f"Unexpected error in call_groq: {e}")
            raise LLMServiceError("Suggestion service is temporarily unavailable, please try again") from e
            
    raise LLMServiceError("Suggestion service is temporarily unavailable, please try again")
