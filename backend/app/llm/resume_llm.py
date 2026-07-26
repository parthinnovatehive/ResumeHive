"""
Resume LLM-assisted rewriting and suggestion generation.

All calls are grounded in data already present in the resume — the LLM
never invents facts, only rephrases or prioritizes what's already known.
Uses Groq for fast inference.
"""

from __future__ import annotations

from app.llm.groq_client import call_groq


# ---------------------------------------------------------------------------
# Summary rewrite
# ---------------------------------------------------------------------------

async def rewrite_summary(
    current_summary: str,
    target_role: str = "",
    skills: list[str] | None = None,
) -> tuple[str, int]:
    """Rewrite a resume summary to be ATS-optimized and recruiter-focused."""
    role_hint = f'Target role: "{target_role}".' if target_role else ""
    skill_hint = (
        f"Relevant skills from the resume: {', '.join(skills[:8])}."
        if skills else ""
    )

    prompt = f"""You are an expert resume writer who crafts professional summaries that make hiring managers want to read the rest of the resume. Rewrite this summary for maximum impact.

{role_hint}
{skill_hint}

HIRING MANAGER PERSPECTIVE — what they think when reading a summary:
- "Does this person have the right background?" — Lead with years of experience and core domain
- "Can they do the job?" — Mention specific, relevant skills and technologies
- "What's their track record?" — Reference measurable outcomes if present
- "Are they a fit?" — Signal career direction, not generic aspirations

STRUCTURE — follow this proven framework:
1. OPENING (1 sentence): Years of experience + core domain + what you do best
2. SKILLS & STACK (1-2 sentences): Most relevant technical skills for the target role
3. IMPACT (1 sentence): Biggest achievement or what you're known for (use numbers if available)
4. DIRECTION (1 sentence): What kind of role or problems you're looking to solve

RULES:
- Rewrite using ONLY facts, skills, and experience already in the original — do NOT invent anything
- Keep it concise: 50-150 words (3-5 sentences)
- Use first person implied ("Experienced engineer with..." not "I am an engineer with...")
- Front-load keywords that ATS systems search for
- Avoid clichés: "passionate", "hard-working", "team player", "go-getter" — show, don't tell
- Every word must earn its place — cut filler ruthlessly
- Use strong action language: "Built", "Led", "Architected", "Delivered"

Original summary:
\"\"\"
{current_summary}
\"\"\"

Return ONLY the rewritten summary, nothing else. No quotes, no explanation."""

    response, tokens = await call_groq(prompt, max_tokens=300)
    return response.strip(), tokens


# ---------------------------------------------------------------------------
# Experience bullets rewrite
# ---------------------------------------------------------------------------

async def rewrite_experience_bullets(
    current_description: str,
    job_title: str = "",
    company: str = "",
    target_role: str = "",
) -> tuple[str, int]:
    """Rewrite experience bullets to be more impactful with metrics and action verbs."""
    context = f'Role: "{job_title}" at "{company}".' if job_title else ""
    role_hint = f'Target role: "{target_role}".' if target_role else ""

    prompt = f"""You are an expert resume writer who transforms weak experience descriptions into powerful, achievement-focused bullets that recruiters remember. Rewrite these experience bullets for maximum impact.

{context}
{role_hint}

RECRUITER PSYCHOLOGY — what makes them stop scanning:
- Quantified achievements ("Increased X by 30%" beats "Improved X")
- Action verbs at the start ("Built", "Led", "Reduced", "Shipped")
- Specific technologies and tools mentioned
- Clear scope and scale ("team of 5", "serving 10K users", "$2M budget")

STRUCTURE for each bullet:
[Action Verb] + [What you did] + [Technologies/methods used] + [Measurable outcome/impact]

RULES:
- Rewrite using ONLY facts, technologies, and achievements already present — do NOT invent metrics or accomplishments
- If the original has no numbers, keep it without numbers but make the action and impact clearer
- Start each bullet with a strong action verb (Built, Led, Reduced, Increased, Shipped, Designed, Implemented, Optimized, Delivered, Spearheaded)
- Use present tense for current roles, past tense for previous roles
- Each bullet should be 1-2 lines max (under 150 characters per bullet when possible)
- Mention specific technologies, frameworks, and tools used
- Remove filler words: "Responsible for", "Helped with", "Worked on", "Assisted in"
- If multiple bullets, keep them all — do not reduce the count
- Preserve line breaks between bullets (each bullet on its own line)

Original description:
\"\"\"
{current_description}
\"\"\"

Return ONLY the rewritten description with each bullet on its own line, nothing else."""

    response, tokens = await call_groq(prompt, max_tokens=400)
    return response.strip(), tokens


# ---------------------------------------------------------------------------
# Project description rewrite
# ---------------------------------------------------------------------------

async def rewrite_project_description(
    current_description: str,
    project_name: str = "",
    technologies: str = "",
    target_role: str = "",
) -> tuple[str, int]:
    """Rewrite a project description to be more compelling and role-relevant."""
    context = f'Project: "{project_name}".' if project_name else ""
    tech_hint = f"Technologies used: {technologies}." if technologies else ""
    role_hint = f'Target role: "{target_role}".' if target_role else ""

    prompt = f"""You are an expert resume writer who transforms project descriptions into compelling proof of technical ability. Rewrite this project description for maximum impact.

{context}
{tech_hint}
{role_hint}

HIRING MANAGER PERSPECTIVE — what they look for in projects:
- "What problem does this solve?" — Start with the purpose/impact, not the tech
- "What did this person actually build?" — Be specific about scope and complexity
- "What technologies did they use?" — Mention the stack naturally
- "Is this production-quality?" — Signal scale, users, or real-world deployment

STRUCTURE:
1. PURPOSE (1 sentence): What the project does and why it matters
2. TECHNICAL HIGHLIGHTS (1-2 sentences): Key technologies, architecture decisions, interesting technical challenges
3. IMPACT (1 sentence): Results, users, performance improvements (use numbers if available)

RULES:
- Rewrite using ONLY facts and technologies already present — do NOT invent features, metrics, or scale
- Mention specific technologies from the original description
- If the project has metrics (users, performance, stars), highlight them
- If no metrics exist, focus on technical complexity and what was learned
- Keep it to 2-4 sentences
- Start with what the project DOES, not "This project is..."
- Avoid "I learned" or "I gained experience" — focus on what was BUILT

Original description:
\"\"\"
{current_description}
\"\"\"

Return ONLY the rewritten description, nothing else. No quotes, no explanation."""

    response, tokens = await call_groq(prompt, max_tokens=300)
    return response.strip(), tokens


# ---------------------------------------------------------------------------
# AI-powered resume suggestions
# ---------------------------------------------------------------------------

async def generate_resume_suggestions(
    resume_data: dict,
    ats_score: dict | None = None,
    target_role: str = "",
) -> tuple[list[str], int]:
    """Generate AI-powered improvement suggestions based on the full resume."""
    role_hint = f'Target role: "{target_role}".' if target_role else ""

    # Build a concise summary of the resume for the prompt
    sections = []
    if resume_data.get("summary"):
        sections.append(f"Summary: {resume_data['summary'][:200]}")
    if resume_data.get("experience"):
        exp_count = len(resume_data["experience"])
        sections.append(f"Experience: {exp_count} role(s)")
    if resume_data.get("projects"):
        proj_count = len(resume_data["projects"])
        sections.append(f"Projects: {proj_count} project(s)")
    if resume_data.get("skills"):
        skills = resume_data["skills"]
        if isinstance(skills, str):
            import json
            try:
                skills = json.loads(skills)
            except:
                skills = [skills]
        sections.append(f"Skills: {', '.join(skills[:10])}")
    if resume_data.get("education"):
        sections.append(f"Education: {len(resume_data['education'])} entry(ies)")

    resume_summary = "\n".join(sections) if sections else "Minimal resume data"

    ats_context = ""
    if ats_score:
        score = ats_score.get("score", "N/A")
        suggestions = ats_score.get("suggestions", [])
        ats_context = f"\nATS Score: {score}/100"
        if suggestions:
            ats_context += "\nRule-based suggestions already given:\n" + "\n".join(f"- {s}" for s in suggestions[:5])

    prompt = f"""You are a senior career coach who reviews student resumes and provides actionable, specific advice. Review this resume and provide 5-6 prioritized improvement tips that will make the biggest difference in getting interviews.

{role_hint}

Resume overview:
{resume_summary}
{ats_context}

RULES:
- Each tip must be specific and actionable (not "improve your resume" but "Add 2-3 quantified achievements to your experience section")
- Prioritize by impact on getting interviews (what recruiters notice first)
- Consider: summary strength, experience quality, project descriptions, skills relevance, missing keywords
- Connect each tip to WHY it matters for getting interviews
- Focus on what the student can do TODAY — not vague long-term advice
- If ATS score is provided, identify the weakest categories and address them
- Do NOT repeat suggestions already in the rule-based list
- Keep each tip to 1-2 sentences

Return as a numbered list, nothing else."""

    raw_response, tokens = await call_groq(prompt, max_tokens=400)

    # Parse numbered list
    import re
    lines = [l.strip() for l in raw_response.splitlines() if l.strip()]
    tips = []
    for line in lines:
        cleaned = re.sub(r"^\d+[\.\)]\s*", "", line)
        if cleaned:
            tips.append(cleaned)

    return tips, tokens
