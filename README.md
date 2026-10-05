# Algorithco web

[![CI](https://github.com/algorithco/algorithco-web/actions/workflows/ci.yml/badge.svg)](https://github.com/algorithco/algorithco-web/actions/workflows/ci.yml)

The unified Algorithco platform frontend. It serves the company site, central-account sign-in flow, Guard console, and Guard documentation from one Next.js static export. Guard API calls stay same-origin through the production Nginx proxy.

## Requirements

- Node.js 22.20.0 (the supported 22.x line is declared in `package.json` and `.nvmrc`)
- pnpm 10.18.0 (declared by `packageManager`)
- Git and Gitleaks 8.x (the committed pre-commit hook fails closed without Gitleaks)

## Run locally

```powershell
pnpm install
Copy-Item .env.example .env.local
pnpm dev
```

Open `http://localhost:3000`.

## Environment variables

All public destinations are configured in `.env.local` and documented in `.env.example`.

| Variable | Default | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `https://trqsh.uz` | Canonical site URL and sitemap origin |
| `NEXT_PUBLIC_VOICE_URL` | `https://voice.algorithco.com` | Algorith Voice website |
| `NEXT_PUBLIC_GUARD_URL` | `https://trqsh.uz/app/guard` | Guard console inside the unified platform |
| `NEXT_PUBLIC_AUTH_URL` | `https://auth.trqsh.uz` | Central account-system origin |
| `NEXT_PUBLIC_ACCOUNT_ISSUER` | `https://auth.trqsh.uz` | OIDC issuer used for sign-in and discovery |
| `NEXT_PUBLIC_ACCOUNT_REDIRECT_URI` | `https://trqsh.uz/auth/callback` | Unified platform OIDC callback |
| `NEXT_PUBLIC_ACCOUNT_BILLING_URL` | `https://auth.trqsh.uz/account` | Account and billing destination |
| `NEXT_PUBLIC_GUARD_API_BASE` | `/api/guard` | Same-origin Guard API prefix |
| `NEXT_PUBLIC_CONTACT_EMAIL` | empty | Public email; hidden when empty |

These values are compiled into the public client bundle. Do not put secrets in them.

## Quality checks

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

`pnpm typecheck` first runs `next typegen`, as required by Next.js 16, then runs TypeScript without emitting files. `next-env.d.ts`, `.next/`, `out/`, coverage, and TypeScript build caches are generated and intentionally ignored.

## Scripts

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Start the local development server |
| `pnpm lint` | Check formatting and lint rules with Biome |
| `pnpm typecheck` | Generate Next.js types and run TypeScript checks |
| `pnpm test` | Run unit tests once |
| `pnpm build` | Produce the static export in `out/` |
| `pnpm format` | Apply Biome formatting and import organization |

The production build is exported to `out/` and can be hosted by any static host. If a standard Next.js Node deployment is preferred, remove `output: "export"` from `next.config.ts` and deploy using the platform's normal Next.js process.

## Add a product

Add one object to `src/config/products.ts`. The home page, products page, product switcher, sitemap, footer, and statically generated detail route all read from this file. Required fields are enforced by TypeScript and covered by unit tests.

Product detail pages use `/products/[slug]`, so no additional page file is needed.

## Design system

All colors, type, radii, spacing, and layout tokens live in `src/app/tokens.css`. Component styles live in `src/app/globals.css`. This keeps the tokens ready for later extraction into an `@algorithco/tokens` package.

## Project layout

- `src/app/` — App Router pages, metadata, robots, sitemap, and styles.
- `src/components/` — reusable UI components.
- `src/config/` — site and product configuration with unit tests.
- `src/content/` — shared website copy.
- `public/` — static assets.
- `.github/` — CI, Dependabot, ownership, and contribution templates.
- `docs/` — repository setup record.

## Unified routes

- `/products/guard` — Guard product page.
- `/signin` and `/auth/callback` — central Account OIDC flow.
- `/app` — unified account, subscription, and product dashboard.
- `/app/guard/*` — authenticated Guard console.
- `/docs/guard/*` — Guard documentation.
- `/api/guard/*` — reverse proxy to the Guard backend; not part of the static export.

The browser uses the public OIDC client `algorithco-platform-web`. The Account
service must register `https://trqsh.uz/auth/callback` as an exact redirect URI
and `https://trqsh.uz` as an allowed origin. The client requests
`entitlements:read` and `billing:write` for the unified dashboard. A short-lived access token is kept
in per-tab `sessionStorage` so reloads retain the session; refresh and ID tokens
remain memory-only. When local state is unavailable, protected Guard routes
start the Account authorization flow automatically and reuse its SSO session.

## Docker deployment

The repository-level compose file builds the static frontend, serves it with Nginx, and starts the Guard backend from the sibling `algorithco-guard/backend` directory:

```powershell
docker compose -f compose.frontends.yml up -d --build --wait
```

Create `../algorithco-guard/backend/.env.tunnel` from that repository's `.env.example` before starting the stack. Nginx proxies `/api/guard/*` over the private Compose network. Ports `3000` and, temporarily, `3007` bind only to loopback for the Cloudflare Tunnel cutover.

## Human decisions / TODO

- Set the public contact email.
- Replace the Privacy and Terms placeholders with text approved by legal counsel.
- Rotate temporary deployment credentials after the platform cutover.
- Review and approve the short company-description wording used on Home and About.

The Account service owns identities and billing. This repository only implements its browser OIDC client and links to Account for billing management; it never stores provider secrets.

## Contributing and security

Use a short-lived branch and pull request; see [CONTRIBUTING.md](CONTRIBUTING.md). Report vulnerabilities privately using [SECURITY.md](SECURITY.md). Never put secrets in `NEXT_PUBLIC_*` variables: Next.js embeds them in public output.

Copyright (c) 2026 Algorithco. All rights reserved.
