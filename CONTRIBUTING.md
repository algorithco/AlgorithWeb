# Contributing

Thank you for helping. By sending a pull request you agree to the [Contributor License Agreement](CLA.md), which lets us offer the code under both the AGPL and a commercial license (see [LICENSING.md](LICENSING.md)). A bot asks you to confirm on your first pull request. Please also read the [code of conduct](CODE_OF_CONDUCT.md).

Open an issue before you start on a large change, so we can agree on it first.

## Workflow

- Never commit directly to `main` after the initial publication.
- Use short-lived branches such as `feat/...`, `fix/...`, and `chore/...`.
- Use conventional commits (`feat:`, `fix:`, `chore:`, `docs:`, `ci:`, and similar).
- Squash merge pull requests. A self-merge is acceptable while the team has one person.

## Checklist before merging

- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` pass.
- [ ] `pnpm audit --prod --audit-level high` reports no high or critical vulnerabilities.
- [ ] No secret, key, `.env`, generated output, user export, or absolute local path was added.
- [ ] The staged Gitleaks pre-commit scan and the PR CI secret scan pass.
- [ ] README, docs, and `.env.example` are updated where needed.
- [ ] CI is green on the pull request.
