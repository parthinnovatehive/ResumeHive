import asyncio
import os
import sys

# Ensure backend directory is in path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.llm.linkedin_llm import (
    rewrite_headline,
    rewrite_about,
    generate_prioritized_suggestions,
)
from app.llm.groq_client import LLMServiceError

async def test_groq():
    if not os.environ.get("GROQ_API_KEY"):
        print("Warning: GROQ_API_KEY is not set. You must set it in your environment for the test to succeed.")
        
    print("Testing rewrite_headline...")
    try:
        headline, tokens = await rewrite_headline(
            current_headline="Software Engineer at SomeCo",
            target_role="Senior Backend Developer",
            missing_keywords=["FastAPI", "Python"]
        )
        print(f"Result: {headline}")
        print(f"Tokens used: {tokens}\n")
    except LLMServiceError as e:
        print(f"Error: {e}\n")

    print("Testing rewrite_about...")
    try:
        about, tokens = await rewrite_about(
            current_about="I am a software engineer. I code in Python.",
            target_role="Backend Developer",
            missing_keywords=["API Design", "Database Modeling"]
        )
        print(f"Result:\n{about}")
        print(f"Tokens used: {tokens}\n")
    except LLMServiceError as e:
        print(f"Error: {e}\n")

    print("Testing generate_prioritized_suggestions...")
    dummy_scores = {
        "target_role": "Backend Developer",
        "sections": {
            "headline": {
                "score": 50,
                "issues": ["Headline is too generic.", "Missing key skills."]
            },
            "experience": {
                "entries": [
                    {
                        "score": 40,
                        "issues": ["Bullet points lack measurable impact.", "Action verbs missing."]
                    }
                ]
            }
        }
    }
    try:
        suggestions, tokens = await generate_prioritized_suggestions(dummy_scores)
        print("Result:")
        for tip in suggestions:
            print(f"- {tip['tip']}")
        print(f"Tokens used: {tokens}\n")
    except LLMServiceError as e:
        print(f"Error: {e}\n")

if __name__ == "__main__":
    asyncio.run(test_groq())
