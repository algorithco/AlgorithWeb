# GitHub setup — algorithco-web

Target remote: <https://github.com/algorithco/algorithco-web> (private).

This document records local publication safeguards before the first push. The final visibility verification, applied repository settings, CI run, and exact plan-gated API results will be added through a pull request immediately after publication.

## Prepared safeguards

- Intended owner: `algorithco`; detected publisher and CODEOWNER: `@hamroqulovv`.
- Proprietary package metadata: `private: true`, `license: UNLICENSED`; no `LICENSE` file or license grant.
- Linux-only CI for quality, production dependency audit, full-history Gitleaks, and aggregate `CI` status.
- Weekly grouped npm and GitHub Actions Dependabot updates, limited to five open pull requests per ecosystem.
- Immutable action commit pins; Gitleaks `8.30.1` downloaded directly and checksum-verified because `gitleaks-action` requires a license for organization repositories.
- Staged pre-commit Gitleaks scan, direct-`main` pre-push block, PR template, and advisory CODEOWNERS.
- No repository or organization secrets, deployment workflow, cloud credentials, or production configuration.

Dependabot update jobs are free; CI runs triggered by Dependabot pull requests consume the private repository's Actions allowance.

## Deferred GitHub configuration

After the first push, record here:

- Private visibility verification before and after the push.
- Default branch and merge settings.
- Dependabot vulnerability-alert and security-update API results.
- One secret-scanning and push-protection attempt.
- One `main` branch-protection attempt requiring PRs, one approval, CODEOWNERS, aggregate `CI`, linear history, and blocked force-push/deletion.
- First `main` CI result and fresh-clone result.

## Paid-plan one-time steps

If the organization moves to GitHub Team or another plan supporting these features for private repositories:

1. Enable GitHub Secret Protection, including secret scanning and push protection.
2. Create a `main` branch protection rule or ruleset requiring pull requests, one approval, stale-approval dismissal, CODEOWNERS review, linear history, and aggregate `CI`; keep force pushes and deletion disabled.
3. Confirm that `@hamroqulovv` or a replacement visible team has write access for enforced ownership reviews.
4. Re-run repository security and settings verification and replace the deferred section with exact results.

## Human TODOs

- Require 2FA at the organization level.
- Decide whether to move to GitHub Team for enforced branch protection and CODEOWNERS.
- Set the security contact email in `SECURITY.md`.
- Complete license and legal review; the private repository remains `UNLICENSED`.
- Configure production values, deployment, and any production secrets in a later phase.
- Decide later whether to create an organization-wide `.github` repository.
