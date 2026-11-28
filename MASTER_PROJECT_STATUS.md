# Master project status

Single source of truth for the health of every repository. This file is
generated from `engineering-status.json` by `scripts/render-status.py`; edit the
JSON and re-run the script instead of editing this document by hand.

- Verified at: **2026-11-28T10:39:08Z**
- Verified by: OpenHands agent (central engineering session)
- Status values: `HEALTHY`, `NEEDS ATTENTION`, `CRITICAL`, `NOT VERIFIED`

| Repository | Role | Status | CI | Live | Verified |
| --- | --- | --- | --- | --- | --- |
| [shawonhaque.github.io](https://github.com/shawonhaque/shawonhaque.github.io) | portfolio | **HEALTHY** | pages-build-deployment: success | https://shawonhaque.github.io/ | 2026-11-28 |
| [Hawa-Computer-](https://github.com/shawonhaque/Hawa-Computer-) | project | **HEALTHY** | CI (typecheck, lint, build, production image): success | https://shawonhaque.github.io/Hawa-Computer-/ | 2026-11-28 |
| [Islamic-Life](https://github.com/shawonhaque/Islamic-Life) | project | **HEALTHY** | Deploy to GitHub Pages: success | https://shawonhaque.github.io/Islamic-Life/ | 2026-11-28 |
| [Nexora](https://github.com/shawonhaque/Nexora) | project | **HEALTHY** | Deploy to GitHub Pages: success | https://shawonhaque.github.io/Nexora/ | 2026-11-28 |
| [Shawon-](https://github.com/shawonhaque/Shawon-) | project | **HEALTHY** | Deploy Portfolio to GitHub Pages: success | https://shawonhaque.github.io/Shawon-/ | 2026-11-28 |
| [shawonhaque](https://github.com/shawonhaque/shawonhaque) | profile | **HEALTHY** | Refresh gh-ascii card: success | https://github.com/shawonhaque | 2026-11-28 |

## Detail

### shawonhaque.github.io - HEALTHY

This site. Dependency-free portfolio and case studies, and the home of the central engineering records.

- Stack: HTML, CSS, Vanilla JavaScript
- Deploy: GitHub Pages, branch deploy from main (legacy build type)
- Live: https://shawonhaque.github.io/
- Build: n/a - files are served as written; Pages build reported success
- Tests: n/a - no test suite; verified by live browser checks
- Live: HTTP 200, canonical + OG image present, no console errors on mobile and desktop
- Open issues: none recorded

### Hawa-Computer- - HEALTHY

Bilingual storefront and management platform for a computer-services shop: services, applications, shop, library, training, customer accounts and an admin console.

- Stack: Next.js 15 App Router, TypeScript, Tailwind CSS 4, Prisma 6, PostgreSQL
- Deploy: Static mirror published to the gh-pages branch (scripts/publish-gh-pages.sh)
- Live: https://shawonhaque.github.io/Hawa-Computer-/
- Build: next build plus scripts/mirror.py crawl - pass
- Tests: tsc --noEmit, eslint, prisma migrate deploy and seed against Postgres 17 - pass
- Live: HTTP 200, 172 sitemap URLs all answer 200 without redirect, per-page and per-locale canonicals with hreflang, no console errors
- Open issues: none recorded

### Islamic-Life - HEALTHY

Bengali-first Islamic companion: the full Quran with translations, prayer times computed on the device, qibla, tafsir, hadith, zakat and a worldwide mosque finder.

- Stack: React 19, TypeScript, Vite, Tailwind CSS, Firebase (Firestore, Auth)
- Deploy: GitHub Actions builds with GITHUB_PAGES=true and publishes dist/ to gh-pages
- Live: https://shawonhaque.github.io/Islamic-Life/
- Build: npm run build (Quran, brand, SEO and search-index generators plus vite build) - pass; Quran reader split into its own chunk (entry 413 -> 385 kB gzip)
- Tests: tsc --noEmit via npm run lint - pass
- Live: HTTP 200, canonical correct, social cover served, Firestore rules deny by default
- Open issues: none recorded

### Nexora - HEALTHY

Personal knowledge platform: live news desks, books, study resources, study tracking, writing and an admin desk, backed by Supabase with row-level security.

- Stack: React, TypeScript, Vite, Tailwind CSS, Supabase/PostgreSQL
- Deploy: GitHub Actions builds, typechecks and lints, then deploys via the Pages artifact API; a cron refresh rebuilds every six hours
- Live: https://shawonhaque.github.io/Nexora/
- Build: npm run build (feed refresh, tsc -b, vite build, postbuild route shells) - pass
- Tests: npm run typecheck and npm run lint - pass
- Live: HTTP 200, 41 prerendered route shells, sitemap with 35 routes, canonical, sitemap URLs and social cover present
- Open issues: none recorded

### Shawon- - HEALTHY

The interactive talking-video portfolio: React 19, TanStack Start and Tailwind 4, prerendered to static files with a scroll-driven hero.

- Stack: React 19, TanStack Start, TypeScript, Tailwind CSS 4, Vite
- Deploy: GitHub Actions runs vitest, builds with BASE_PATH and deploys via the Pages artifact API
- Live: https://shawonhaque.github.io/Shawon-/
- Build: npm run build with BASE_PATH - pass (single page prerendered); npm ci verified against a freshly regenerated lockfile
- Tests: vitest run - 1 file, 1 test, pass
- Live: HTTP 200, canonical, og:image, robots.txt and sitemap.xml all served
- Open issues:
  - package-lock.json is out of sync for npm 11+: npm ci fails locally while npm 10 (CI) succeeds

### shawonhaque - HEALTHY

The GitHub profile README - the ASCII card, the intro and the links to the work.

- Stack: Markdown, SVG
- Deploy: GitHub profile rendering - no Pages site
- Live: https://github.com/shawonhaque
- Build: n/a - Markdown rendered by GitHub
- Tests: n/a
- Live: Profile README renders; links point at the six repositories
- Open issues: none recorded
