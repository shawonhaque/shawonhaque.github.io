#!/usr/bin/env python3
"""Render status.html and MASTER_PROJECT_STATUS.md from engineering-status.json.

The JSON is the single source of truth for the repository health records, so the
public dashboard and the internal status document cannot drift apart. Run after
editing the JSON:

    python3 scripts/render-status.py
"""

from __future__ import annotations

import html
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
DATA = ROOT / "engineering-status.json"

STATUS_CLASS = {
    "HEALTHY": "ok",
    "NEEDS ATTENTION": "warn",
    "CRITICAL": "bad",
    "NOT VERIFIED": "unknown",
}


def load() -> dict:
    return json.loads(DATA.read_text(encoding="utf-8"))


def render_markdown(data: dict) -> str:
    lines = [
        "# Master project status",
        "",
        "Single source of truth for the health of every repository. This file is",
        "generated from `engineering-status.json` by `scripts/render-status.py`; edit the",
        "JSON and re-run the script instead of editing this document by hand.",
        "",
        f"- Verified at: **{data['verified_at']}**",
        f"- Verified by: {data['verified_by']}",
        "- Status values: " + ", ".join(f"`{s}`" for s in data["status_values"]),
        "",
        "| Repository | Role | Status | CI | Live | Verified |",
        "| --- | --- | --- | --- | --- | --- |",
    ]
    for repo in data["repositories"]:
        lines.append(
            "| [{name}]({repo_url}) | {role} | **{status}** | {ci_workflow}: {ci_result} "
            "| {live} | {verified} |".format(
                name=repo["name"],
                repo_url=repo["repo_url"],
                role=repo["role"],
                status=repo["status"],
                ci_workflow=repo["ci_workflow"],
                ci_result=repo["ci_result"],
                live=repo["live_url"],
                verified=data["verified_at"][:10],
            )
        )

    lines += ["", "## Detail", ""]
    for repo in data["repositories"]:
        lines += [f"### {repo['name']} - {repo['status']}", "", repo["summary"], ""]
        lines.append(f"- Stack: {', '.join(repo['stack'])}")
        lines.append(f"- Deploy: {repo['deploy']}")
        lines.append(f"- Live: {repo['live_url']}")
        for key, value in repo["checks"].items():
            lines.append(f"- {key.capitalize()}: {value}")
        if repo["open_issues"]:
            lines.append("- Open issues:")
            lines += [f"  - {issue}" for issue in repo["open_issues"]]
        else:
            lines.append("- Open issues: none recorded")
        lines.append("")
    return "\n".join(lines).rstrip() + "\n"


def render_html(data: dict) -> str:
    rows = []
    for repo in data["repositories"]:
        cls = STATUS_CLASS.get(repo["status"], "unknown")
        rows.append(
            f"""        <tr>
          <th scope="row"><a href="{html.escape(repo['repo_url'])}" target="_blank" rel="noopener">{html.escape(repo['name'])}</a><span class="status-role">{html.escape(repo['role'])}</span></th>
          <td data-label="Status"><span class="status-pill {cls}">{html.escape(repo['status'])}</span></td>
          <td data-label="Stack">{html.escape(', '.join(repo['stack']))}</td>
          <td data-label="CI">{html.escape(repo['ci_workflow'])}<span class="status-ci">{html.escape(repo['ci_result'])}</span></td>
          <td data-label="Live"><a href="{html.escape(repo['live_url'])}" target="_blank" rel="noopener">Open<span aria-hidden="true"> ↗</span></a></td>
        </tr>"""
        )

    detail = []
    for repo in data["repositories"]:
        checks = "\n".join(
            f"            <li><strong>{html.escape(k.capitalize())}:</strong> {html.escape(v)}</li>"
            for k, v in repo["checks"].items()
        )
        issues = ""
        if repo["open_issues"]:
            items = "\n".join(
                f"              <li>{html.escape(i)}</li>" for i in repo["open_issues"]
            )
            issues = f"""
            <h3>Open issues</h3>
            <ul class="status-issues">
{items}
            </ul>"""
        detail.append(
            f"""        <article class="panel status-card" id="{html.escape(repo['name'].lower())}">
          <h2>{html.escape(repo['name'])} <span class="status-pill {STATUS_CLASS.get(repo['status'], 'unknown')}">{html.escape(repo['status'])}</span></h2>
          <p>{html.escape(repo['summary'])}</p>
          <ul class="status-checks">
{checks}
          </ul>
          <p class="status-links"><a href="{html.escape(repo['repo_url'])}" target="_blank" rel="noopener">Repository<span aria-hidden="true"> ↗</span></a> <a href="{html.escape(repo['live_url'])}" target="_blank" rel="noopener">Live<span aria-hidden="true"> ↗</span></a></p>{issues}
        </article>"""
        )

    verified = html.escape(data["verified_at"])
    cards = "\n".join(detail)
    trs = "\n".join(rows)
    return f"""<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />

  <title>Engineering status — Shawon Haque</title>
  <meta name="description" content="Verified health status for the six repositories behind shawonhaque.github.io: build, test, deployment and live checks, with the date each check was run." />
  <meta name="author" content="Shawon Haque" />
  <meta name="theme-color" content="#131313" media="(prefers-color-scheme: dark)" />
  <meta name="theme-color" content="#f4f2ee" media="(prefers-color-scheme: light)" />
  <link rel="canonical" href="https://shawonhaque.github.io/status.html" />
  <link rel="alternate" type="application/rss+xml" title="Shawon Haque — Writing" href="feed.xml" />

  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="Shawon Haque" />
  <meta property="og:title" content="Engineering status — six repositories, verified" />
  <meta property="og:description" content="Build, test, deployment and live checks for the six repositories, with the date each check was run." />
  <meta property="og:url" content="https://shawonhaque.github.io/status.html" />
  <meta property="og:image" content="https://shawonhaque.github.io/assets/img/og-image.jpg" />
  <meta property="og:locale" content="en_US" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Engineering status — six repositories, verified" />
  <meta name="twitter:description" content="Build, test, deployment and live checks for the six repositories, with the date each check was run." />
  <meta name="twitter:image" content="https://shawonhaque.github.io/assets/img/og-image.jpg" />

  <link rel="icon" href="favicon.ico" sizes="any" />
  <link rel="icon" type="image/png" href="assets/img/icon-192.png" sizes="192x192" />
  <link rel="apple-touch-icon" href="assets/img/icon-180.png" />
  <link rel="manifest" href="site.webmanifest" />

  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="assets/css/styles.css" />

  <style>
    .status-table-panel {{
      padding: clamp(20px, 3.4vw, 34px) clamp(16px, 3vw, 30px);
      margin-top: 1.5rem;
      overflow-x: auto;
    }}
    .status-table {{
      width: 100%;
      border-collapse: collapse;
      font-size: 0.94rem;
    }}
    .status-table caption {{
      text-align: left;
      opacity: 0.72;
      padding-bottom: 0.75rem;
    }}
    .status-table th,
    .status-table td {{
      text-align: left;
      padding: 0.85rem 0.75rem;
      border-bottom: 1px solid color-mix(in srgb, currentColor 12%, transparent);
      vertical-align: top;
    }}
    .status-table thead th {{
      font-family: "JetBrains Mono", monospace;
      font-size: 0.72rem;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      opacity: 0.62;
    }}
    .status-table tbody th {{
      font-weight: 600;
      white-space: nowrap;
    }}
    .status-role,
    .status-ci {{
      display: block;
      font-family: "JetBrains Mono", monospace;
      font-size: 0.7rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      opacity: 0.6;
      margin-top: 0.25rem;
    }}
    .status-pill {{
      display: inline-block;
      padding: 0.15rem 0.55rem;
      border-radius: 999px;
      font-family: "JetBrains Mono", monospace;
      font-size: 0.68rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      font-weight: 600;
      white-space: nowrap;
    }}
    .status-pill.ok {{ background: color-mix(in srgb, #16a34a 22%, transparent); color: #4ade80; }}
    .status-pill.warn {{ background: color-mix(in srgb, #d97706 22%, transparent); color: #fbbf24; }}
    .status-pill.bad {{ background: color-mix(in srgb, #dc2626 22%, transparent); color: #f87171; }}
    .status-pill.unknown {{ background: color-mix(in srgb, currentColor 14%, transparent); opacity: 0.8; }}
    [data-theme="light"] .status-pill.ok {{ color: #15803d; }}
    [data-theme="light"] .status-pill.warn {{ color: #b45309; }}
    [data-theme="light"] .status-pill.bad {{ color: #b91c1c; }}
    .status-cards {{
      display: grid;
      gap: 1.25rem;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 22rem), 1fr));
      margin-top: 1.5rem;
    }}
    .status-card h2 {{
      font-size: 1.15rem;
      display: flex;
      align-items: center;
      gap: 0.6rem;
      flex-wrap: wrap;
    }}
    .status-checks {{ margin: 0.75rem 0; padding-left: 1.1rem; }}
    .status-checks li {{ margin-bottom: 0.35rem; }}
    .status-issues {{ padding-left: 1.1rem; }}
    .status-links {{ margin-top: 0.75rem; }}
    .status-links a {{ margin-right: 1rem; }}
    .sr-only {{
      position: absolute;
      width: 1px; height: 1px;
      padding: 0; margin: -1px;
      overflow: hidden;
      clip: rect(0 0 0 0);
      white-space: nowrap;
      border: 0;
    }}
    @media (max-width: 720px) {{
      .status-table thead {{ display: none; }}
      .status-table tbody tr {{ display: block; padding: 0.85rem 0; border-bottom: 1px solid color-mix(in srgb, currentColor 12%, transparent); }}
      .status-table tbody th,
      .status-table tbody td {{ display: block; border: 0; padding: 0.2rem 0; }}
      .status-table tbody td[data-label]::before {{
        content: attr(data-label);
        display: block;
        font-family: "JetBrains Mono", monospace;
        font-size: 0.66rem;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        opacity: 0.55;
      }}
    }}
  </style>

  <script>
    (function () {{
      try {{
        var stored = localStorage.getItem("theme");
        var theme = stored || (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
        document.documentElement.setAttribute("data-theme", theme);
      }} catch (e) {{}}
    }})();
  </script>
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>
  <div class="bg-glow" aria-hidden="true"></div>

  <header class="site-header" id="top">
    <div class="wrap header-inner">
      <a class="brand" href="index.html" aria-label="Shawon Haque — back to top">
        <span class="brand-mark" aria-hidden="true">SH</span>
        <span class="brand-text">Shawon Haque</span>
      </a>
      <button class="nav-toggle" id="navToggle" type="button" aria-expanded="false" aria-controls="primary-nav" aria-label="Open navigation menu">
        <span class="nav-toggle-bar" aria-hidden="true"></span>
        <span class="nav-toggle-bar" aria-hidden="true"></span>
        <span class="nav-toggle-bar" aria-hidden="true"></span>
      </button>

      <nav class="primary-nav" id="primary-nav" aria-label="Primary">
        <div class="nav-pill">
          <span class="nav-indicator" id="navIndicator" aria-hidden="true"></span>
          <ul>
            <li><a href="index.html#about">About</a></li>
            <li><a href="index.html#expertise">Expertise</a></li>
            <li><a href="index.html#projects">Projects</a></li>
            <li><a href="projects/index.html">Case studies</a></li>
            <li><a href="status.html">Status</a></li>
            <li><a href="index.html#contact">Contact</a></li>
          </ul>
        </div>
        <button class="theme-toggle" id="themeToggle" type="button" aria-pressed="false" aria-label="Switch to light theme" title="Toggle colour theme">
          <svg class="icon-sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.2"/><g stroke-linecap="round"><line x1="12" y1="2.6" x2="12" y2="5.2"/><line x1="12" y1="18.8" x2="12" y2="21.4"/><line x1="2.6" y1="12" x2="5.2" y2="12"/><line x1="18.8" y1="12" x2="21.4" y2="12"/><line x1="5.4" y1="5.4" x2="7.2" y2="7.2"/><line x1="16.8" y1="16.8" x2="18.6" y2="18.6"/><line x1="5.4" y1="18.6" x2="7.2" y2="16.8"/><line x1="16.8" y1="7.2" x2="18.6" y2="5.4"/></g></svg>
          <svg class="icon-moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z"/></svg>
        </button>
      </nav>
    </div>
  </header>

  <main id="main">
    <div class="wrap">
      <section class="page-head panel" aria-labelledby="page-title">
        <a class="page-back" href="projects/index.html"><span aria-hidden="true">←</span> Case studies</a>
        <p class="eyebrow">Engineering · Verification</p>
        <h1 id="page-title">Six repositories, checked and dated</h1>
        <p class="lede">
          Every project here ships from GitHub Pages, so the build, the tests and the deployment
          all have to be green before a change reaches a visitor. This page records what was
          checked, when, and what is still open — no green badge without a check behind it.
        </p>
      </section>

      <section class="panel status-table-panel" aria-labelledby="table-title">
        <h2 id="table-title" class="sr-only">Repository overview</h2>
        <table class="status-table">
          <caption>Last verification: {verified}</caption>
          <thead>
            <tr><th scope="col">Repository</th><th scope="col">Status</th><th scope="col">Stack</th><th scope="col">CI</th><th scope="col">Live</th></tr>
          </thead>
          <tbody>
{trs}
          </tbody>
        </table>
      </section>

      <section aria-labelledby="detail-title">
        <h2 id="detail-title" style="margin-top: 2rem;">Detail</h2>
        <div class="status-cards">
{cards}
        </div>
      </section>
    </div>
  </main>

  <footer class="site-footer">
    <div class="wrap footer-inner">
      <p class="footer-brand">Shawon Haque</p>
      <nav class="footer-nav" aria-label="Footer">
        <a href="index.html#about">About</a>
        <a href="index.html#projects">Projects</a>
        <a href="projects/index.html">Case studies</a>
        <a href="writing.html">Writing</a>
        <a href="status.html">Status</a>
        <a href="index.html#contact">Contact</a>
        <a href="https://github.com/shawonhaque" target="_blank" rel="noopener">GitHub</a>
      </nav>
      <p class="footer-meta">© <span id="year">2026</span> Shawon Haque. All rights reserved.</p>
    </div>
  </footer>

  <script src="assets/js/main.js" defer></script>
</body>
</html>
"""


def main() -> None:
    data = load()
    (ROOT / "MASTER_PROJECT_STATUS.md").write_text(render_markdown(data), encoding="utf-8")
    (ROOT / "status.html").write_text(render_html(data), encoding="utf-8")
    print("wrote MASTER_PROJECT_STATUS.md and status.html")


if __name__ == "__main__":
    main()
