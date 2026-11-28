# Master engineering changelog

Newest first. One entry per change that reached a repository's default branch, with
the commit that carries it. Verification notes state what was actually observed,
not what was intended.

## 2026-11-28 — central engineering pass

### shawonhaque.github.io

- `docs: add the central engineering records and a generated status dashboard`
  - Adds `MASTER_REPOSITORY_INVENTORY.md`, `MASTER_AUDIT_REPORT.md`,
    `MASTER_ENGINEERING_CHANGELOG.md`, `MASTER_MAINTENANCE_PLAN.md`.
  - Adds `engineering-status.json` as the machine-readable source of truth and
    `scripts/render-status.py`, which renders `status.html` and
    `MASTER_PROJECT_STATUS.md` from it.
  - Adds `.github/workflows/health-check.yml`: weekly (and manual) check of every live URL,
    sitemap, robots file and social cover, plus JSON validation of the status file. The
    workflow reports, it never commits.
  - Verified: `python3 scripts/render-status.py` renders both files; `status.html` opens with
    the shared stylesheet and the site nav; links point at real repositories and live sites.

### Hawa-Computer-

- `Give every page its own canonical URL` (`b2e35db`)
  - The root layout declared `alternates.canonical = "/"`. Pages that did not override it
    inherited that, so all 86 sitemap URLs told Google the home page was their canonical.
  - A relative `"./"` resolves against the route being rendered, which covers static, dynamic
    and `/en` routes in one line. `/admin` and `/account` now send `robots: noindex`.
  - Verified on the running server and then live: `/tools`, `/shop/scissors-medium`, `/verify`,
    `/training` and `/en/tools` each emit their own absolute canonical.

- `Pair the two locales with hreflang in the static mirror` (`c9e8d40`)
  - The mirror writes an `/en` copy of every page, but the app's relative canonical resolved those
    copies to the Bengali route, so the English tree had no page of its own.
  - The mirror now rewrites the tag per file: each locale declares itself, the pair points at the
    other, and Bengali is `x-default`. Checked across all 180 generated pages: exactly one
    canonical and one `bn` alternate each.

- `Fix the CI image build: seed the prisma schema before npm ci` (`9785057`)
  - The Docker deps stage copied only `package.json` and the lockfile, so the `postinstall`
    `prisma generate` hook ran without a schema and the image job failed on every push.
  - Verified by reproducing the stage outside Docker: `npm ci` fails without `prisma/`, succeeds
    with it; `prisma generate` needs no `DATABASE_URL`. CI run 46133058572 then built the image
    for real: both jobs green. That is the first successful run of this workflow; every
    earlier run of it failed at the same image step.
- `Fix canonical/OG URLs in static builds and add a social cover` (`873682c`)
  - `src/lib/site-url.ts` ignores localhost values and falls back to
    `https://shawonhaque.github.io` plus `NEXT_PUBLIC_ROUTE_PREFIX`; used by the root metadata,
    `sitemap.ts` and `robots.ts`.
  - `public/brand/og-cover.jpg` (1200x630) wired into Open Graph and Twitter cards.
  - `scripts/build-static.sh` now exports `NEXT_PUBLIC_SITE_URL` for both the build and the
    preview server.
  - Verified in a fresh build: canonical, `og:image`, `<loc>` and `Sitemap:` are all absolute
    Pages URLs; verified live afterwards.
- `Show the full logo on the loading screen` (`8c255d1`)
  - Loader renders the full brand lockup, with an indeterminate progress bar, a white plate in
    dark mode (the navy wordmark was invisible on the dark background) and a reduced-motion
    fallback. Uses a 480px WebP (68 KB instead of the 222 KB PNG).

### Islamic-Life

- `Add a social preview image and large-image cards` (`4b4bac5`)
  - `assets/og-cover.jpg` is copied into the generated `public/` by `build-seo.mjs`, because
    `public/` is rebuilt on every build; `index.html` gains `og:image`, image dimensions,
    `twitter:image` and `summary_large_image`.
  - Verified: the file lands in `dist/` and is served live with `image/jpeg`.

- `Split the Quran page out of the initial bundle` (`f435807`)
  - The reader was the only heavy section imported eagerly; every other one was
    already lazy. Entry chunk 1428 kB → 1327 kB raw, 413 kB → 385 kB gzipped.
  - Checked in the built output: all 114 surahs render, chapter switching works,
    no console errors.
  - Evaluated and rejected: splitting React, Firebase and the rest into vendor
    chunks. Measured first load rose to 475 kB gzipped (+62 kB) because chunk
    boundaries duplicate runtime helpers, so caching would have been bought with
    a slower first visit. Firebase could be deferred later; that needs the auth
    context rewritten, not a build tweak.

### Nexora

- `Add canonical, Open Graph and Twitter metadata` (`b17891e`)
  - The shell had only a title and description; it now carries a canonical link, the full Open
    Graph block and a Twitter card with `og-cover.jpg`.
  - Verified: typecheck, lint and build pass; the tags and image are live.

### Shawon-

- `Add canonical, social preview and crawl files` (`ae66929`)
  - Root head now sets `canonical`, `og:url`, `og:image`, `twitter:image`; `public/robots.txt`
    and `public/sitemap.xml` are new.
  - The comment forbidding a root preview image was replaced by the rule that actually applies:
    the site prerenders one page, so the root owns the preview.
  - Verified: `npm test` and the `BASE_PATH=/Shawon-/` build pass; all three files are live.

- `Sync package-lock.json so npm ci works on current npm` (`46b720d`)
  - The lockfile was missing optional platform binaries for the Tailwind and oxc parsers, so
    `npm ci` refused to install on npm 11/12 while npm 10 in CI happened to pass. Regenerated
    with `npm install`; verified from a clean tree with `npm ci`, `npm test` and the
    `BASE_PATH` build.

### All six repositories

- `Use checkout@v5 and setup-node@v5` (`2706af8`, `71498be`, `c34c1d6`, `152a255`, `2e07d29`, `4f6e3cd`)
  - The v4 actions run on Node 20, which GitHub has deprecated on hosted runners; every job
    printed a warning that it was being forced onto Node 24.
  - Verified by the deploy runs that followed: Pages, Vercel and CI all green on the new majors.

### shawonhaque (profile)

- No changes. The `Refresh gh-ascii card` workflow is green and the README renders correctly.

## Earlier work referenced by this pass

- Hawa-Computer-: tagline removal (brand is now just "হাওয়া কম্পিউটার"), three client-side tools
  (`/tools/pdf`, `/tools/image`, `/tools/signature`), WhatsApp order handoff, deploy kit, mobile
  header tightening, sitemap publishing.
- shawonhaque.github.io: Hawa Computer case study added; Islamic Life case study added.
- Shawon-: Hawa Computer added to the selected-work gallery.
