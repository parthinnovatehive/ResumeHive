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
    keyword_hint = f"Naturally weave in these high-value keywords for ATS discoverability: {', '.join(missing_keywords[:5])}." if missing_keywords else ""

    prompt = f"""You are an expert LinkedIn profile strategist who understands recruiter psychology. Your task is to rewrite a student's LinkedIn headline so that a hiring manager or recruiter scrolling through LinkedIn will STOP and click on this profile.

TARGET ROLE: "{target_role}"

RECRUITER PSYCHOLOGY — what makes them stop scrolling:
- They scan for job titles they are hiring for
- They look for concrete skills and tech stack familiarity
- They notice quantified achievements and impact
- They favor specific over generic (e.g., "Backend Engineer | Python & Microservices" beats "Passionate Developer")

RULES — follow strictly:
1. Keep it under 220 characters, single line
2. Do NOT invent skills, roles, companies, or achievements not implied by the original headline
3. Use a clear structure: [Role/Title] | [Key Skills/Stack] | [Value Proposition] — use pipe separators for readability
4. Front-load the target role title so it appears in search results
5. Include 2-3 specific technical keywords relevant to "{target_role}" that recruiters search for
6. Use power language that signals competence: "Building", "Engineering", "Architecting", "Shipping" — avoid vague words like "Passionate" or "Enthusiastic"
7. If the original headline mentions any achievements or metrics, preserve and highlight them
8. {keyword_hint}

Current headline: "{current_headline}"

Return ONLY the rewritten headline, nothing else. No quotes, no explanation."""

    response, tokens = await call_groq(prompt, max_tokens=120)
    return response.strip(), tokens


# ---------------------------------------------------------------------------
# About section rewrite
# ---------------------------------------------------------------------------

async def rewrite_about(current_about: str, target_role: str, missing_keywords: list[str]) -> tuple[str, int]:
    keyword_hint = f"Naturally integrate these recruiter-searched keywords where they fit: {', '.join(missing_keywords[:6])}." if missing_keywords else ""

    prompt = f"""You are a LinkedIn profile expert who writes About sections that make hiring managers want to schedule an interview. Rewrite this student's About section for a "{target_role}" role.

HIRING MANAGER PERSPECTIVE — what they think when reading an About section:
- "Can this person do the job?" — Lead with relevant capabilities, not generic self-introductions
- "What have they actually built/done?" — Specific projects and outcomes beat vague claims
- "Do they understand impact?" — Numbers and results signal business awareness
- "Will they fit our team?" — Professional but human tone wins over robotic corporate speak

STRUCTURE — use this proven framework:
1. HOOK (1 sentence): Open with a strong value proposition or what you bring to the table — NOT "Hi, I'm..." or "I'm a passionate..."
2. CAPABILITY STACK (2-3 sentences): Highlight your most relevant skills, technologies, and experiences that directly relate to "{target_role}". Group related skills naturally.
3. IMPACT PROOF (2-3 sentences): Showcase 1-2 standout projects or experiences with measurable outcomes (metrics, scale, results). Use action verbs: "built", "reduced", "increased", "shipped", "led".
4. WHAT I'M LOOKING FOR (1 sentence): Close with your career direction — what kind of role or problems you want to solve. This helps recruiters match you to open positions.

RULES — follow strictly:
- Rewrite using ONLY facts, projects, skills, and experience already present in the original text — do NOT invent anything
- Keep similar length to the original (do not pad with generic filler)
- Use first person ("I") with a professional yet approachable tone
- Every sentence should pass the "so what?" test — if it doesn't demonstrate value, cut it
- Avoid clichés: "hard-working", "team player", "go-getter", "passionate about technology" — show, don't tell
- Include specific tech stack mentions that match "{target_role}"
- If the original mentions achievements with numbers, preserve and amplify them
- {keyword_hint}

Original About section:
\"\"\"
{current_about}
\"\"\"

Return ONLY the rewritten About section, nothing else. No quotes, no explanation."""

    response, tokens = await call_groq(prompt, max_tokens=500)
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

FRAMING — write each tip from the perspective of what will most improve the candidate's chances
with recruiters and hiring managers:
- Focus on what recruiters notice first (headline, skills, experience bullets)
- Frame each tip as a specific action they can take today, not vague advice
- Quantify where possible ("Add 2-3 metrics to your experience bullets" not "Improve your experience")
- Connect the tip to why it matters for getting interviews ("Recruiters search for X — adding it to your headline makes you discoverable")

Return as a numbered list, nothing else."""

    raw_response, tokens = await call_groq(prompt, max_tokens=350)
    return _parse_numbered_list(raw_response), tokens


def _parse_numbered_list(text: str) -> list[dict[str, str]]:
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    tips = []
    for line in lines:
        cleaned = re.sub(r"^\d+[\.\)]\s*", "", line)
        if cleaned:
            tips.append({"tip": cleaned})
    return tips
