# Master repository inventory

Last updated: 2026-11-28. Every value below was read from the GitHub API or from
the repository itself during the central engineering session; nothing here is
inferred. When a value changes, update this file in the same commit that changes it.

## The six repositories

| # | Repository | Role | Default branch | Language | Pages build type | Live URL |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | [shawonhaque.github.io](https://github.com/shawonhaque/shawonhaque.github.io) | Main portfolio (user site at the root domain) | `main` | HTML | legacy (branch) | https://shawonhaque.github.io/ |
| 2 | [Hawa-Computer-](https://github.com/shawonhaque/Hawa-Computer-) | Project site | `main` | TypeScript | legacy (`gh-pages`) | https://shawonhaque.github.io/Hawa-Computer-/ |
| 3 | [Islamic-Life](https://github.com/shawonhaque/Islamic-Life) | Project site | `main` | TypeScript | legacy (`gh-pages`) | https://shawonhaque.github.io/Islamic-Life/ |
| 4 | [Nexora](https://github.com/shawonhaque/Nexora) | Project site | `main` | TypeScript | workflow | https://shawonhaque.github.io/Nexora/ |
| 5 | [Shawon-](https://github.com/shawonhaque/Shawon-) | Project site (interactive portfolio) | `main` | TypeScript | workflow | https://shawonhaque.github.io/Shawon-/ |
| 6 | [shawonhaque](https://github.com/shawonhaque/shawonhaque) | GitHub profile README | `main` | — | none (not a Pages site) | https://github.com/shawonhaque |

The portfolio is `shawonhaque.github.io`: it is the user site, so it is served at
the bare origin, it links every project repository and live URL, and each project
has a case study under `projects/`. `Shawon-` is a second portfolio-style
application, but it is one of the six projects it presents, not the hub.

## Per-repository detail

### 1. shawonhaque.github.io — portfolio

- Purpose: public presentation of the work, plus the engineering records in this folder.
- Stack: semantic HTML, one stylesheet (`assets/css/styles.css`), vanilla JavaScript (`assets/js/main.js`), no build step.
- Structure: `index.html`, `journey.html`, `writing.html`, `projects/` (index + five case studies), `blog/`, `tools/`, `404.html`.
- Deploy: GitHub Pages branch deploy from `main` (root). Push = deploy.
- SEO surface: `robots.txt`, `sitemap.xml`, `feed.xml`, JSON-LD (`Person`, `WebSite`, `TechArticle`, `BreadcrumbList`), Open Graph and Twitter cards with `assets/img/og-image.jpg`.
- Scripts: `scripts/render-status.py` renders `status.html` and `MASTER_PROJECT_STATUS.md` from `engineering-status.json`.

### 2. Hawa-Computer- — shop platform

- Purpose: bilingual (Bangla at `/`, English at `/en`) storefront plus admin console and customer accounts for a computer-services shop.
- Stack: Next.js 15 App Router, React 19, TypeScript, Tailwind CSS 4, Prisma 6 with PostgreSQL, NextAuth-style session cookies, zod, react-hook-form, recharts, bcryptjs.
- Source layout: `src/app` (route groups `(site)`, `(admin)`, `(account)`, `api`), `src/components`, `src/lib`, `src/actions`, `prisma/`, `public/`.
- Build: `npx next build` against a running Postgres; the export is served locally with `next start -p 3001` and mirrored by `scripts/mirror.py`, which crawls the origin, rewrites the `/Hawa-Computer-` base path and copies the sitemap and robots file. `scripts/publish-gh-pages.sh` runs build + mirror + publish.
- Deploy: `gh-pages` branch, published by the local script (not by Actions).
- CI: `.github/workflows/ci.yml` runs typecheck, lint, `prisma migrate deploy`, seed and build against a Postgres 17 service, then builds the production Docker image. `.github/workflows/deploy-vercel.yml` deploys to Vercel when the Vercel secrets are present and no-ops otherwise.
- Data: Prisma schema in `prisma/schema.prisma`, seed in `prisma/seed-content.ts` and `prisma/seed.ts`; the live site reads no database — it is a static mirror with client-side tools and WhatsApp order handoff.

### 3. Islamic-Life — worship companion

- Purpose: Bengali-first Islamic companion — Quran with Bengali/English translation, prayer times computed on the device, qibla, tafsir, hadith, duas, tasbih, zakat, hijri calendar, mosque finder.
- Stack: React 19, TypeScript, Vite, Tailwind CSS, Firebase (Firestore + Auth) for optional accounts.
- Build chain: `scripts/build-quran.mjs` → `build-brand.mjs` → `build-seo.mjs` → `build-search-index.mjs` → `vite build` → `build-routes.mjs`; `public/` is generated, so sitemap, robots and the social cover are emitted on every build, and the last step writes one page per section and per surah (135 pages) with per-URL titles and canonicals.
- URLs: `/quran/`, `/namaz/`, … and `/quran/2/` are real pages; `src/utils/routes.ts` reads the section from the path and keeps the address bar in step. The sitemap lists 133 URLs (home, 18 content sections, 114 surahs); `search`, `admin` and `settings` are noindex via `robots.txt`.
- Deploy: Actions workflow sets `GITHUB_PAGES=true` (which switches the Vite base to `/Islamic-Life/` and declares that there is no backend), copies `dist/index.html` to `dist/404.html`, and publishes to `gh-pages` with `peaceiris/actions-gh-pages`.
- Security: `firestore.rules` denies everything by default and validates every collection; `firebase-applet-config.json` holds only the public web config.

### 4. Nexora — knowledge platform

- Purpose: live news desks, books, study resources, bookmarks, study tracking, writing, search and an admin area.
- Stack: React, TypeScript, Vite, Tailwind CSS, Supabase (PostgreSQL with RLS, storage, edge functions).
- Build chain: `scripts/feeds.mjs` refreshes the feed snapshot → `tsc -b` → `vite build` → `scripts/postbuild.mjs` writes 41 route shells, a SPA `404.html` and a 35-route sitemap.
- Deploy: Actions workflow with `pages` and `id-token` permissions, artifact upload, `deploy-pages`; a six-hourly cron refresh keeps the news snapshot current.
- Security: `supabase/migrations/` enables row-level security and hardening policies; the anon key is public by design and the service-role key is never referenced in client code.

### 5. Shawon- — interactive portfolio

- Purpose: the talking-video portfolio — scroll-driven hero, selected work gallery, resume download.
- Stack: React 19, TanStack Start, Tailwind CSS 4, Vite, motion, vitest.
- Build: `BASE_PATH=/Shawon-/ npm run build` prerenders the one-page document plus five section paths (`/about/`, `/skills/`, `/work/`, `/experience/`, `/contact/`) into `dist/client`, then the workflow copies `index.html` to `404.html` and adds `.nojekyll`.
- Deep links: each section path renders the same document, scrolls to its section and sets `rel="canonical"` back to `/Shawon-/`, so shared links resolve while only the root is indexed.
- Deploy: Actions workflow runs `npm test` before the build and deploys through the Pages artifact API.
- Lockfile: regenerated (`46b720d`) so `npm ci` installs on current npm; verified from a clean tree.

### 6. shawonhaque — profile README

- Purpose: GitHub profile page: ASCII card, intro, links to the five sites.
- Stack: Markdown and SVG; no build, no Pages site.
- CI: `Refresh gh-ascii card` workflow keeps the SVG current.

## Cross-repository conventions

- Every Pages site is served under `https://shawonhaque.github.io/<repo>/`; subpath builds must set their base (Vite `base`, `BASE_PATH`, `NEXT_PUBLIC_ROUTE_PREFIX`).
- Every site ships `robots.txt` and `sitemap.xml`, an absolute `canonical` link and an Open Graph image.
- Client bundles may only contain public values (Supabase anon key, Firebase web config). Service-role keys, database URLs and session secrets stay server-side or in repository secrets.
- GitHub Actions use explicit, minimal `permissions:` and pinned major action versions.
