#!/usr/bin/env python3
"""Build a 1200x630 Open Graph card per blog post.

Each card mirrors the site: warm paper, near-black ink, a hairline rule and
one accent line. Chrome renders a small HTML document to a screenshot, so the
cards use the same webfonts as the live pages.

Usage:  python3 tools/build-og-images.py
Needs:  chromium on PATH
"""

import pathlib
import shutil
import subprocess
import sys
import tempfile

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "assets" / "img"

CARDS = [
    {
        "file": "og-row-level-security.png",
        "eyebrow": "Writing · Database security",
        "title": "Row Level Security is the only authorisation I trust",
        "footer": "17 tables · 27 policies · one is_admin() helper",
    },
    {
        "file": "og-typed-service-layer.png",
        "eyebrow": "Writing · Architecture",
        "title": "A service layer that never throws",
        "footer": "14 service modules · a typed Result, not exceptions",
    },
    {
        "file": "og-progressive-enhancement.png",
        "eyebrow": "Writing · Frontend",
        "title": "Animation that is safe to remove",
        "footer": "Every effect is additive · the page is complete without it",
    },
    {
        "file": "og-build-time-feeds.png",
        "eyebrow": "Writing · Build tooling",
        "title": "The build is the safest place to call the network",
        "footer": "24 publisher feeds · one bad source never breaks the deploy",
    },
]

TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet" />
<style>
  * {{ margin: 0; padding: 0; box-sizing: border-box; }}
  html, body {{ width: 1200px; height: 630px; }}
  body {{
    font-family: 'Inter Tight', 'Inter', system-ui, sans-serif;
    background: #f4f2ee;
    color: #171717;
    padding: 74px 78px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    overflow: hidden;
    position: relative;
  }}
  .top {{ display: flex; align-items: center; justify-content: space-between; }}
  .brand {{ display: flex; align-items: center; gap: 14px; }}
  .monogram {{
    width: 46px; height: 46px; border-radius: 12px;
    background: #171717; color: #f4f2ee;
    font-weight: 700; font-size: 19px; letter-spacing: 0.02em;
    display: grid; place-items: center;
  }}
  .brand-name {{ font-weight: 600; font-size: 21px; letter-spacing: -0.01em; }}
  .eyebrow {{
    font-family: 'JetBrains Mono', monospace;
    font-size: 15px; font-weight: 500;
    letter-spacing: 0.14em; text-transform: uppercase;
    color: #1f4fd8;
  }}
  .title {{
    font-size: 68px; line-height: 1.04; letter-spacing: -0.035em;
    font-weight: 700; max-width: 20ch; color: #0b0b0b;
  }}
  .title em {{ font-family: 'Instrument Serif', serif; font-style: italic; font-weight: 400; }}
  .footer {{
    display: flex; align-items: center; gap: 16px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 16px; color: #5d5d5d;
  }}
  .rule {{ width: 54px; height: 2px; background: #1f4fd8; }}
  .glow {{
    position: absolute; right: -140px; top: -140px;
    width: 520px; height: 520px; border-radius: 50%;
    background: radial-gradient(circle, rgba(31,79,216,0.10), rgba(31,79,216,0) 68%);
  }}
</style>
</head>
<body>
  <div class="glow"></div>
  <div class="top">
    <div class="brand">
      <span class="monogram">SH</span>
      <span class="brand-name">Shawon Haque</span>
    </div>
    <span class="eyebrow">{eyebrow}</span>
  </div>
  <h1 class="title">{title}</h1>
  <div class="footer">
    <span class="rule"></span>
    <span>{footer}</span>
  </div>
</body>
</html>
"""


def render(chromium: str, card: dict, out: pathlib.Path) -> None:
    html = TEMPLATE.format(eyebrow=card["eyebrow"], title=card["title"], footer=card["footer"])
    with tempfile.NamedTemporaryFile("w", suffix=".html", delete=False, encoding="utf-8") as fh:
        fh.write(html)
        src = pathlib.Path(fh.name)
    try:
        subprocess.run(
            [
                chromium,
                "--headless=new",
                "--no-sandbox",
                "--disable-gpu",
                "--hide-scrollbars",
                "--force-device-scale-factor=1",
                "--window-size=1200,630",
                f"--screenshot={out}",
                "--virtual-time-budget=6000",
                src.as_uri(),
            ],
            check=True,
        )
    finally:
        src.unlink(missing_ok=True)


def main() -> None:
    chromium = shutil.which("chromium") or shutil.which("google-chrome")
    if not chromium:
        sys.exit("chromium not found on PATH")
    for card in CARDS:
        out = OUT_DIR / card["file"]
        render(chromium, card, out)
        print(f"{out.relative_to(ROOT)}: {out.stat().st_size} bytes")


if __name__ == "__main__":
    main()
