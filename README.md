# Algorithco web

[![CI](https://github.com/algorithco/algorithco-web/actions/workflows/ci.yml/badge.svg)](https://github.com/algorithco/algorithco-web/actions/workflows/ci.yml)

The company website for Algorithco and the front door to its products. It is a static-friendly Next.js application with no backend, database, authentication implementation, tracking, cookies, or runtime API calls.

Status: pre-production. Deployment and production configuration are intentionally out of scope for this repository-publication phase.

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
| `NEXT_PUBLIC_SITE_URL` | `https://algorithco.com` | Canonical site URL and sitemap origin |
| `NEXT_PUBLIC_VOICE_URL` | `https://voice.algorithco.com` | Algorith Voice website |
| `NEXT_PUBLIC_GUARD_URL` | `https://guard.algorithco.com` | algorithco guard website |
| `NEXT_PUBLIC_AUTH_URL` | `https://auth.algorithco.com` | Future account-system sign-in destination |
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

## Deployment

1. Set the production environment variables on the hosting provider.
2. Run `pnpm build`.
3. Publish the generated `out/` directory.
4. Configure the host to serve `404.html` for missing routes.

No special infrastructure is required.

## Human decisions / TODO

- Set the public contact email.
- Replace the Privacy and Terms placeholders with text approved by legal counsel.
- Confirm the final production domains for the company site, Voice, Guard, and the future account system.
- Review and approve the short company-description wording used on Home and About.

## Next steps (not implemented)

- **Step 2:** central account system and single sign-on.
- **Step 3:** unified billing.

No authentication or billing behavior is included in this project.

## Contributing and security

Use a short-lived branch and pull request; see [CONTRIBUTING.md](CONTRIBUTING.md). Report vulnerabilities privately using [SECURITY.md](SECURITY.md). Never put secrets in `NEXT_PUBLIC_*` variables: Next.js embeds them in public output.

Copyright (c) 2026 Algorithco. All rights reserved.
