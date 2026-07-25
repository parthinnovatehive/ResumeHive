"""
LinkedIn LLM-assisted rewriting and suggestion phrasing (Phase 3).

All calls are grounded in data already extracted/scored by the parser
and scorer — the LLM never invents facts, only rephrases or prioritizes
what's already known to be true or missing.
"""

from __future__ import annotations
from typing import Any
import re

from app.llm.groq_client import call_groq


# ---------------------------------------------------------------------------
# Headline rewrite
# ---------------------------------------------------------------------------

async def rewrite_headline(current_headline: str, target_role: str, missing_keywords: list[str]) -> tuple[str, int]:
    keyword_hint = f"Consider naturally including: {', '.join(missing_keywords[:5])}." if missing_keywords else ""

    prompt = f"""You are improving a student's LinkedIn headline. Follow these rules strictly:
- Keep it under 220 characters, one line
- Do NOT invent skills, roles, or achievements not implied by the current headline
- Make it specific to the target role: "{target_role}"
- {keyword_hint}

Current headline: "{current_headline}"

Return ONLY the rewritten headline, nothing else."""

    response, tokens = await call_groq(prompt, max_tokens=100)
    return response.strip(), tokens


# ---------------------------------------------------------------------------
# About section rewrite
# ---------------------------------------------------------------------------

async def rewrite_about(current_about: str, target_role: str, missing_keywords: list[str]) -> tuple[str, int]:
    keyword_hint = f"Where naturally relevant, weave in: {', '.join(missing_keywords[:6])}." if missing_keywords else ""

    prompt = f"""You are improving a student's LinkedIn About section for a "{target_role}" role.
Rules:
- Rewrite using ONLY facts, projects, and experience already present in the original text
- Do NOT invent new projects, skills, companies, or achievements
- Keep a similar length to the original (do not pad with generic filler)
- Make the language more specific and outcome-focused
- {keyword_hint}

Original About section:
\"\"\"
{current_about}
\"\"\"

Return ONLY the rewritten About section, nothing else."""

    response, tokens = await call_groq(prompt, max_tokens=400)
    return response.strip(), tokens


# ---------------------------------------------------------------------------
# Job-specific suggestion narrative
# ---------------------------------------------------------------------------

async def generate_prioritized_suggestions(scored_profile: dict[str, Any]) -> tuple[list[dict[str, str]], int]:
    """
    Takes the output of score_profile() and turns the raw rule-based
    issues into a short, prioritized, natural-language action list.

    This does NOT re-score anything — it only rephrases/prioritizes
    issues the scorer already found.
    """
    sections = scored_profile.get("sections", {})
    target_role = scored_profile.get("target_role", "Unknown Role")

    # Collect all issues with their section + score, so the LLM can
    # prioritize the weakest areas first
    all_issues = []
    for section_name, data in sections.items():
        for issue in data.get("issues", []):
            all_issues.append({"section": section_name, "issue": issue, "score": data.get("score", 0)})
        # experience has per-entry issues nested one level deeper
        if section_name == "experience":
            for entry in data.get("entries", []):
                for issue in entry.get("issues", []):
                    all_issues.append({"section": "experience", "issue": issue, "score": entry.get("score", 0)})

    if not all_issues:
        return []

    issues_text = "\n".join(f"- [{i['section']}] {i['issue']}" for i in all_issues)

    prompt = f"""A student's LinkedIn profile was analyzed for a "{target_role}" role. Below is a list of
specific, verified issues found by a rule-based checker. Do NOT add any new issues or invent
facts about the profile — only work with what's listed.

Issues found:
{issues_text}

Task: Pick the 3-5 MOST IMPACTFUL issues for someone targeting "{target_role}" and rewrite each
as a short, encouraging, actionable tip (1 sentence each). Order them by impact, most important first.

Return as a numbered list, nothing else."""

    raw_response, tokens = await call_groq(prompt, max_tokens=300)
    return _parse_numbered_list(raw_response), tokens


def _parse_numbered_list(text: str) -> list[dict[str, str]]:
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    tips = []
    for line in lines:
        cleaned = re.sub(r"^\d+[\.\)]\s*", "", line)
        if cleaned:
            tips.append({"tip": cleaned})
    return tips
