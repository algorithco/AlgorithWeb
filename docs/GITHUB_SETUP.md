# GitHub setup — algorithco-web

Remote: <https://github.com/algorithco/algorithco-web> (private).

Published on 2026-10-02 under the `algorithco` organization (GitHub Free) by `@hamroqulovv`, an active organization admin.

## Visibility verification

The repository was created without pushing, then verified private:

```json
{"isPrivate":true,"url":"https://github.com/algorithco/algorithco-web","visibility":"PRIVATE"}
```

After the initial push, it was verified private again with `main` as the default branch:

```json
{"defaultBranchRef":{"name":"main"},"isPrivate":true,"url":"https://github.com/algorithco/algorithco-web","visibility":"PRIVATE"}
```

## Applied repository settings

- Default branch: `main`.
- Squash merge enabled; merge commits and rebase merges disabled.
- Pull-request head branches are deleted automatically after merge.
- Issues enabled; wiki and Projects disabled.
- Description: "Company website for Algorithco and its products".
- Topics: `nextjs`, `react`, `tailwindcss`, `typescript`, `website`.
- CODEOWNERS: `* @hamroqulovv`. It is advisory because enforced CODEOWNERS reviews require branch protection, which is plan-gated for this private repository.
- Dependabot version updates: weekly npm and GitHub Actions checks; grouped minor/patch updates; maximum five open pull requests per ecosystem.
- Dependabot vulnerability alerts and automated security fixes: both enabled successfully through the REST API.
- CI: Linux-only `ubuntu-latest` jobs for quality, production dependency audit, full-history secrets scan, and aggregate `CI` status.
- Actions are pinned to immutable release commits. The Gitleaks CLI is pinned to `8.30.1`, downloaded directly, and checksum-verified because `gitleaks-action` requires a license for organization repositories.
- No GitHub repository or organization secrets, deployment workflow, cloud credential, or production configuration was added.

Dependabot update jobs are free; CI runs triggered by Dependabot pull requests consume the private repository's Actions allowance.

## Verification results

- First `main` CI run: [successful](https://github.com/algorithco/algorithco-web/actions/runs/36998930994) in 59 seconds. The timing API reported four Ubuntu jobs but exposed zero billable milliseconds.
- The exact CI runtime, Node.js `22.20.0`, passed frozen install, Biome lint, Next.js type generation, TypeScript, five unit tests, static production build, and production dependency audit.
- Fresh-clone proof: following the README from a local clone outside the workspace produced `out/index.html`; the temporary clone was then removed.
- Gitleaks `8.30.1` scanned the staged source and full one-commit pre-publication history with redaction; zero leaks were found. Additional source/history checks found no private-key block, Google secret, GitHub PAT, Stripe key, Slack token, credential-bearing database URL, machine-specific path, real `.env`, private key/JWKS, user export, or tracked generated output.
- A broad pre-commit filesystem scan classified ten findings as ephemeral Next.js preview/encryption values generated only under the ignored `.next/` build cache. The cache was never staged, committed, or pushed; the exact staged source and Git history scans were clean.
- Ignored generated/local paths include `.next/`, `out/`, `node_modules/`, coverage, TypeScript caches, and `.env.*` except the public `.env.example`.

## Plan-gated attempts

Each unavailable feature was attempted once. No retry or workaround was used.

- Secret scanning and push protection: HTTP 422 — `Secret scanning is not available for this repository.`
- `main` branch protection (require PR, one approval, CODEOWNERS review, aggregate `CI` status, linear history, and blocked force-push/deletion): HTTP 403 — `Upgrade to GitHub Pro or make this repository public to enable this feature.`
- Required reviewers and enforced CODEOWNERS therefore remain unavailable for this private repository on the organization's current Free plan.

## Paid-plan one-time steps

If the organization moves to GitHub Team or another plan supporting these features for private repositories:

1. Enable GitHub Secret Protection, including secret scanning and push protection.
2. Create a `main` branch protection rule or ruleset requiring pull requests, one approval, stale-approval dismissal, CODEOWNERS review, linear history, and aggregate `CI`; keep force pushes and deletion disabled.
3. Confirm that `@hamroqulovv` or a replacement visible team has write access for enforced ownership reviews.
4. Re-run repository security and settings verification and update this document with the new API results.

## Local safeguards

- `.githooks/pre-commit` scans staged changes with Gitleaks and fails closed when the tool is unavailable. `pnpm install` configures `core.hooksPath=.githooks` in a Git checkout.
- `.githooks/pre-push` blocks direct pushes to `main`; the initial publication used the documented one-time `--no-verify` bypass.
- CI scans the complete Git history with Gitleaks (`fetch-depth: 0`) without a paid action.
- The PR template requires explicit test, documentation, and secrets checks.
- Next.js 16's generated `next-env.d.ts` is ignored; `pnpm typecheck` runs `next typegen` before TypeScript.

## Human TODOs

- Require 2FA at the organization level.
- Decide whether to move to GitHub Team for enforced branch protection and CODEOWNERS.
- Set the security contact email in `SECURITY.md`.
- Complete license and legal review; the repository remains private and `UNLICENSED` with no license grant.
- Configure production public values, any production secrets, and deployment in a later phase.
- Decide later whether to create an organization-wide `.github` repository.
- Phase 3.5 prerequisites are satisfied: `algorithco-account` is pushed, its CI is green, and its setup documentation is final.
