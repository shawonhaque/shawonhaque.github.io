# Master audit report

Session: 2026-11-28 (central engineering pass over the six repositories).
Every finding below comes from a command that was actually run in this session;
where a check could not be executed it is marked BLOCKED or NOT RUN instead of
being assumed.

## Method

1. Inventory: GitHub API (`/repos`, `/pages`, `/commits`, `/actions/runs`) for all six repositories.
2. Clone and inspect each codebase: `package.json`, lockfiles, workflows, config, source tree.
3. Local reproduction of the CI path: install, typecheck/lint, tests, production build.
4. Security review: deny-by-default rule files, client-side secret scan, workflow permissions.
5. Live verification: HTTP status of every site, sitemap, robots and social cover, plus a headless
   browser pass at 390x844 and 1440x900 recording console errors, layout overflow and broken images.
6. Fix, rebuild, redeploy and re-verify.

## Findings by repository

### shawonhaque.github.io (portfolio)

| Check | Result |
| --- | --- |
| Pages build | PASS (`pages-build-deployment`, success) |
| Live page | PASS — 200, 42 KB, no console errors, no horizontal overflow |
| Canonical / OG image | PASS on the home page and every case study |
| robots.txt / sitemap.xml / feed.xml | PASS (all 200) |
| Internal links | PASS — repo and live links for all six repositories resolve |
| Central records | NOT PRESENT before this session (docs, dashboard, health checks) |

Fixes: added the master records (`MASTER_*`), a generated `status.html` dashboard, and a weekly
health-check workflow. No visual redesign.

### Hawa-Computer-

| Check | Result |
| --- | --- |
| Typecheck / lint / build | PASS locally and in CI |
| Production Docker image | **FAIL every push** — `npm ci` in the deps stage ran the `prisma generate` postinstall with no `prisma/` directory in the image |
| Live page | PASS — 200, no console errors; 86 sitemap URLs |
| Canonical URL | **FAIL** — published `<link rel="canonical" href="http://localhost:3000">` because `.env` sets `NEXT_PUBLIC_SITE_URL` for local dev and the value leaked into the static build |
| sitemap.xml / robots.txt | **FAIL** — same localhost origin in `<loc>` and `Sitemap:` |
| Open Graph image | MISSING (title, description and site_name were present) |
| Loading screen | Rendered the icon mark only, not the brand lockup (fixed earlier in the session) |
| Canonical coverage | **FAIL** — the root layout declared `alternates.canonical = "/"`, so all 86 sitemap URLs advertised `/Hawa-Computer-/` as their canonical; the English mirror inherited the Bengali route |
| Dashboard indexing | **FAIL** — `/admin` and `/account` sent `robots: index, follow` |

Fixes: schema seeded before `npm ci` in the Dockerfile; new `siteUrl()` helper that ignores
localhost values and falls back to the Pages origin plus the route prefix, used by the layout,
`sitemap.ts` and `robots.ts`; a 1200x630 `og-cover.jpg` wired into Open Graph and Twitter cards;
loader now shows the full logo. All verified against a fresh build and the live site.

Canonical pass, later in the same session: the single `/` canonical became a relative `"./"`,
which Next resolves against the route being rendered, so static, dynamic and `/en` routes each
declare their own URL; the dashboards now send `robots: noindex`; the mirror overrides the tag
per file so each locale canonicalises to itself and the pair carries `hreflang` plus `x-default`.
Checked live: `/tools`, `/shop/scissors-medium`, `/en/tools` and `/en/shop/scissors-medium` each
return their own canonical, and all 180 generated pages carry exactly one canonical.

### Islamic-Life

| Check | Result |
| --- | --- |
| Build (Quran/brand/SEO/search generators + vite) | PASS |
| `tsc --noEmit` | PASS |
| Deploy workflow | PASS |
| Live page | PASS — 200, no console errors, no overflow |
| Canonical | PASS |
| `og:image` / `twitter:image` | **MISSING** — shared links had no preview card; card type was `summary` |
| sitemap.xml / robots.txt | PASS (generated per build) |
| Firestore rules | PASS — deny-all default with per-collection validation and owner checks |
| Public Firebase config in repo | Expected and safe (web config only) |

Fixes: added `assets/og-cover.jpg` (copied into the generated `public/` by `build-seo.mjs`) and
the matching `og:image` / `twitter:image` / `summary_large_image` tags. Verified in `dist` and live.

### Nexora

| Check | Result |
| --- | --- |
| Typecheck / lint / build | PASS |
| Deploy workflow | PASS (artifact API) |
| Route shells / sitemap | PASS — 41 shells, 35 sitemap routes, SPA `404.html` |
| Live page | PASS — 200, assets resolve under `/Nexora/` |
| `canonical`, Open Graph, Twitter | **MISSING** — the shell had only title and description |
| `og:image` | MISSING |
| RLS migrations | PASS — RLS enabled with hardening migrations; service-role key absent from client code |

Fixes: canonical link, full Open Graph block and Twitter card with a 1200x630 `og-cover.jpg`.
Verified in the build output and live.

### Shawon-

| Check | Result |
| --- | --- |
| `npm test` (vitest) | PASS |
| Build with `BASE_PATH=/Shawon-/` | PASS (single page prerendered) |
| Deploy workflow | PASS |
| Live page | PASS — 200, no console errors, no overflow |
| `canonical` | **MISSING** |
| `og:image` / `twitter:image` | **MISSING** |
| `robots.txt` / `sitemap.xml` | **MISSING** (both 404) |
| `npm ci` on npm 11+ | **FAIL** — lockfile lacks optional `@tailwindcss/oxide-*` platform packages; npm 10 (CI) installs fine |

Fixes: canonical link, `og:image`, `twitter:image`, `og:url`, `robots.txt` and `sitemap.xml`, with
the template comment about never setting a root preview image replaced by the actual rule (one
prerendered page, so the root owns the preview). The lockfile issue is documented as an open
issue rather than silently regenerated, because a lockfile rewrite across 537 packages is a
larger change than the rest of this pass and needs its own verification.

### shawonhaque (profile)

| Check | Result |
| --- | --- |
| Profile README render | PASS (via github.com) |
| `Refresh gh-ascii card` workflow | PASS |
| Pages site | Not applicable — profile repositories do not publish Pages |

No changes.

## Cross-repository problems

1. **Metadata drift between local dev and static publishing.** Hawa leaked `localhost` into
   canonical, sitemap and robots; the other three Vite/Start projects had simply never declared
   a canonical or a preview image. Fixed in all four.
2. **Missing social preview images** on three of four deployed projects. Fixed with one consistent
   1200x630 cover per project.
3. **CI job that could never pass.** The Hawa Docker image stage was red on every push; a red CI
   pipeline normalises failures, so it was fixed first.
4. **No single place that records verified status.** Added the generated status dashboard plus the
   master documents and a scheduled health check.

## Not executed (honest limits)

- **PARTLY BLOCKED — Docker image build in the sandbox.** `apt-get` cannot reach the Debian
  mirrors from this environment, so the stage was first validated by reproducing it locally
  (`npm ci` fails without `prisma/`, succeeds with it). The real `docker build` then ran in CI on
  the fix (`CI` run 46133058572): both jobs, `Build the production image` and
  `Typecheck, lint and build`, are green.
- **NOT RUN — Lighthouse / Core Web Vitals field data.** No Chrome-based Lighthouse run was made
  in this session; bundle sizes were read from the production build output instead.
- **NOT RUN — Automated accessibility audit (axe).** Manual checks covered skip links, focus
  visibility, contrast of the new status pills and reduced-motion handling only.
- **NOT RUN — Dependency vulnerability scan.** `npm audit` was not run; dependency upgrades are
  deliberately out of scope for this pass to avoid unrelated churn.

## Follow-up pass (2026-11-29): deep links

The two single-page apps were the remaining gap between what the sites claimed and what a
shared link did. Both are fixed and verified live:

| Repository | Before | After |
|---|---|---|
| Islamic-Life | `/quran/2/` answered 404; sitemap listed 1 URL | 135 route pages with per-URL titles and canonicals; sitemap lists 133 URLs |
| Shawon- | `/work` answered 404; one prerendered page | `/about/`, `/skills/`, `/work/`, `/experience/`, `/contact/` prerendered and canonicalised to the root |

Live checks: `200` with `0` redirects on `/Islamic-Life/quran/2/`, `/Islamic-Life/qibla/`,
`/Islamic-Life/quran/114/`, `/Shawon-/work/`, `/Shawon-/about/` and `/Shawon-/contact/`; the
browser reports the expected per-page titles, the Quran reader opens on the surah named in the
URL, and no console errors. Back and forward move between sections in Islamic-Life, which was
not possible before because nothing was ever pushed to history.

The limits above still stand for this follow-up: no Lighthouse run, no axe run, no `npm audit`.
