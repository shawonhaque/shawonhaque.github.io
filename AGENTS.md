# AGENTS.md

Repository notes for the `shawonhaque.github.io` portfolio (static HTML/CSS/JS, GitHub Pages).

## Layout

- `index.html` — single-page portfolio. Header markup lives near the top
  (`.brand` → `<span class="brand-mark">SH</span>` + `.brand-text`, `.nav-pill`
  with `.nav-indicator`, `#navIndicator`).
- `assets/css/styles.css` — all styling. Key sections: `:root` tokens,
  `/* ---------- Header ---------- */`, section/`panel` blocks, `/* ---------- Responsive ---------- */`.
- `assets/js/main.js` — sticky-header `is-stuck` toggle, nav indicator
  (`moveIndicator` / `remeasure`), IntersectionObserver active-link highlighting,
  footer year.
- `assets/img/` — hero portrait (`portrait-3d.*`), project thumbs, icons.
  `Shawon3d.png` at the repo root is the original full-size source render; the
  web assets are its downscaled crops.

## Design language

The portfolio deliberately mirrors the `Shawon-` app (deployed at
`https://shawonhaque.github.io/Shawon-/`, source in `Shawon-` repo, React +
TanStack Router + Tailwind). When changing shared UI (header, nav, section
heads) keep both in sync.

- **Header floats, it does not stick as a bar.** The app's `.nav` is
  `position: fixed`, transparent, with no background or border — only the
  monogram and a glass nav pill are visible; the brand name fades out on scroll.
  The portfolio's `.site-header` matches this: `background: transparent`,
  `pointer-events: none` on the container (brand / nav / toggle re-enabled),
  `.brand-text` fades out via `.site-header.is-stuck`.
- Stuck threshold is **40px** of scroll (`window.scrollY > 40`), matching the app.
- Monogram "SH", sliding ink indicator pill, numbered section eyebrows
  (01 Profile, 06 Contact, …) are shared motifs.

## Commands

```bash
# local preview (static)
python3 -m http.server 12001
# JS syntax check
node --check assets/js/main.js
# regenerate the resume PDF (needs chromium + pikepdf)
python3 tools/build-resume.py
# regenerate the per-post social cards (needs chromium)
python3 tools/build-og-images.py
```

## SEO and metadata

- `feed.xml` is the RSS 2.0 feed for the writing; every page links it with
  `<link rel="alternate" type="application/rss+xml">` (path is `feed.xml` from
  the root, `../feed.xml` from `blog/` and `projects/`).
- `sitemap.xml` carries a `<lastmod>` per URL — the post date for writing, the
  content date for the rest.
- JSON-LD: `Person` + `WebSite` on the home page, `BlogPosting` (with `image`,
  `wordCount`, `timeRequired`, `keywords`, `articleSection`) or `TechArticle`
  plus `BreadcrumbList` on inner pages.
- Social cards are generated, one per post (`assets/img/og-<slug>.png`,
  1200×630). Add a card to `CARDS` in `tools/build-og-images.py`, run it, then
  point that post's `og:image` / `twitter:image` at the new file.
- Every page applies the saved/system theme with an inline pre-paint script
  (reads `localStorage.theme`, falls back to `prefers-color-scheme`) to avoid a
  flash; `404.html` does the same.

## Workflow

- Branch from `main`, open a PR, squash-merge. Pages deploys automatically on
  push to `main`; verify with the Actions run and by fetching the live CSS/JS.
- `.site-header` is hidden in print (`@media print`).
