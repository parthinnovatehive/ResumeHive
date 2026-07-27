import asyncio
import json
import logging
import os
import sys
from jinja2 import Environment, FileSystemLoader

logger = logging.getLogger(__name__)

_TEMPLATE_DIR = os.path.join(os.path.dirname(__file__), "templates")
_env = Environment(loader=FileSystemLoader(_TEMPLATE_DIR))
_env.filters["fromjson"] = lambda s: json.loads(s) if isinstance(s, str) else s

VALID_TEMPLATES = {"classic", "modern", "minimal", "professional", "compact"}

_BROWSER_ARGS = [
    "--disable-gpu",
]
if sys.platform != "win32":
    _BROWSER_ARGS += ["--no-sandbox", "--disable-dev-shm-usage"]

PAGE_TIMEOUT_MS = 60_000


def _render_pdf_sync(html: str) -> bytes:
    from playwright.sync_api import sync_playwright

    with sync_playwright() as p:
        browser = p.chromium.launch(args=_BROWSER_ARGS)
        page = browser.new_page()
        page.set_content(html, wait_until="domcontentloaded", timeout=PAGE_TIMEOUT_MS)
        pdf_bytes = page.pdf(
            format="A4",
            print_background=True,
            margin={"top": "0mm", "bottom": "0mm", "left": "0mm", "right": "0mm"},
        )
        browser.close()
    return pdf_bytes


def generate_pdf(resume_data: dict, *, template: str = "classic") -> bytes:
    if template not in VALID_TEMPLATES:
        template = "classic"

    tpl = _env.get_template(f"resume_{template}.html")
    html = tpl.render(resume=resume_data)

    try:
        from playwright.async_api import async_playwright
    except ImportError:
        raise RuntimeError(
            "playwright is not installed. Run: pip install playwright && playwright install chromium"
        )

    loop = None
    try:
        loop = asyncio.new_event_loop()

        async def _render():
            async with async_playwright() as p:
                browser = await p.chromium.launch(args=_BROWSER_ARGS)
                try:
                    page = await browser.new_page()
                    await page.set_content(html, wait_until="domcontentloaded", timeout=PAGE_TIMEOUT_MS)
                    pdf_bytes = await page.pdf(
                        format="A4",
                        print_background=True,
                        margin={"top": "0mm", "bottom": "0mm", "left": "0mm", "right": "0mm"},
                    )
                    return pdf_bytes
                finally:
                    await browser.close()

        return loop.run_until_complete(_render())
    except Exception as exc:
        logger.exception("Async PDF generation failed, falling back to sync")
        try:
            return _render_pdf_sync(html)
        except Exception:
            logger.exception("Sync PDF fallback also failed")
            raise RuntimeError(f"PDF generation failed: {exc}") from exc
    finally:
        if loop is not None:
            loop.close()
