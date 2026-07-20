import os
import asyncio
from jinja2 import Environment, FileSystemLoader

_TEMPLATE_DIR = os.path.join(os.path.dirname(__file__), "templates")
_env = Environment(loader=FileSystemLoader(_TEMPLATE_DIR))

VALID_TEMPLATES = {"classic", "modern", "minimal", "professional", "compact"}


async def _render_pdf(html: str) -> bytes:
    from playwright.async_api import async_playwright

    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        await page.set_content(html, wait_until="networkidle")
        pdf_bytes = await page.pdf(
            format="A4",
            print_background=True,
            margin={"top": "0mm", "bottom": "0mm", "left": "0mm", "right": "0mm"},
        )
        await browser.close()
    return pdf_bytes


def generate_pdf(resume_data: dict, *, template: str = "classic") -> bytes:
    if template not in VALID_TEMPLATES:
        template = "classic"

    tpl = _env.get_template(f"resume_{template}.html")
    html = tpl.render(resume=resume_data)

    return asyncio.run(_render_pdf(html))
