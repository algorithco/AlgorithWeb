# Contributing

Use pull requests even when GitHub Free cannot enforce branch protection, required reviews, or CODEOWNERS for this private repository.

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

## Initial-publish bypass

The local pre-push hook blocks `main`. The one-time initial publication uses:

```powershell
git push --no-verify -u origin main
```

Document any later bypass. The normal workflow is always branch, PR, and squash merge.
