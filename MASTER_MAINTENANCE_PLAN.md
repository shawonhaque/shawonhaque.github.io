# Master maintenance plan

The point of this file is that the next session starts from evidence, not memory.
It describes what is checked, how often, and what to do when something breaks.

## Where the records live

| File | Purpose | Updated by |
| --- | --- | --- |
| `engineering-status.json` | Machine-readable status of all six repositories | A human or agent, after running checks |
| `status.html` | Public dashboard rendered from the JSON | `python3 scripts/render-status.py` |
| `MASTER_PROJECT_STATUS.md` | Internal status document, same data as the dashboard | Same script |
| `MASTER_REPOSITORY_INVENTORY.md` | What each repository is, how it builds, where it deploys | Manual, when architecture changes |
| `MASTER_AUDIT_REPORT.md` | Findings from an audit pass, with honest BLOCKED/NOT RUN markers | One section per pass |
| `MASTER_ENGINEERING_CHANGELOG.md` | Every change that reached a default branch | One entry per change |

Rule: never edit `status.html` or `MASTER_PROJECT_STATUS.md` by hand. Edit the JSON, re-run the
renderer, commit both outputs with the JSON change.

## Weekly (automated + a two-minute read)

The `health-check.yml` workflow runs every Monday at 06:20 UTC and on demand. It checks:

- every live URL returns 200,
- `sitemap.xml` and `robots.txt` respond on each Pages site,
- each project's social cover image is reachable,
- `engineering-status.json` is valid JSON with the required fields and known status values.

It reports through the workflow summary and fails loudly on a broken URL. It never commits, so it
cannot create a loop.

Two-minute human read: open the failed run's summary, then confirm the site in a browser. If the
failure is real, fix it; if a check is wrong (for example a site moved), fix the check in the same
commit.

## Monthly

1. Re-run the verification that produced `engineering-status.json`, then bump `verified_at` and
   re-render. A status without a recent date is a status you cannot trust.
2. Skim dependency security: `npm audit --omit=dev` in each JavaScript repository. Upgrade only
   what is affected, one repository at a time, with the build green before and after.
3. Confirm Pages is still publishing from the expected source (`gh api repos/shawonhaque/<repo>/pages`):
   Hawa and Islamic-Life publish the `gh-pages` branch; Nexora and Shawon- publish through the
   Actions artifact API; the portfolio publishes `main`.
4. Check the action versions pinned in each workflow. Pinned majors are intentional; do not move to
   `@main`.
5. Clear the `Shawon-` lockfile debt (see open issues) or confirm CI still runs npm 10.

## When something breaks

| Symptom | First move |
| --- | --- |
| Live site 404 but Pages says "built" | Check the base path: Vite `base`, `BASE_PATH`, `NEXT_PUBLIC_ROUTE_PREFIX`. A subpath site that serves `/assets/...` instead of `/<repo>/assets/...` will look blank. |
| Live site stale after a push | Confirm the deploy workflow ran for that SHA, then check the Pages source branch. Hawa and Islamic-Life deploy from `gh-pages`, so a green build with a failed publish leaves the site old. |
| Workflow red on one job only | Read that job's log before changing code. The Hawa image job was red for five runs because of a missing `prisma/` copy, not a code problem. |
| Shared link shows no preview | Check `og:image` is absolute and returns 200; relative URLs and relative-to-subpath mistakes are the usual cause. |
| Supabase or Firebase data leak report | Stop and audit the rules files (`supabase/migrations/*_rls_policies.sql`, `firestore.rules`). Never widen a policy to fix a client bug. |

## Security rules that must not weaken

- Client bundles carry public keys only: Supabase anon key, Firebase web config. No service-role
  key, no database URL, no session secret, ever.
- Firestore and Postgres rules stay deny-by-default with per-collection validation.
- Workflows keep explicit minimal `permissions:`; `pull_request_target` is not used.
- A secret found in a repository is not copied into a report. Remove the reference, rotate the
  credential through the platform that owns it, then verify it does not reappear.

## Resumable checkpoints

Before ending a session, in the portfolio repository:

1. Update `engineering-status.json` (status, checks, open issues, `verified_at`).
2. Re-run `scripts/render-status.py`.
3. Append to `MASTER_ENGINEERING_CHANGELOG.md` with commit SHAs.
4. Record the next exact task in the changelog's last entry or in an open issue in the JSON.

Starting a session: read `MASTER_PROJECT_STATUS.md` first, then the last changelog entry, then
re-verify only what the record marks as stale or failing.
