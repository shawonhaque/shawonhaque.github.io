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
```

## Workflow

- Branch from `main`, open a PR, squash-merge. Pages deploys automatically on
  push to `main`; verify with the Actions run and by fetching the live CSS/JS.
- `.site-header` is hidden in print (`@media print`).
