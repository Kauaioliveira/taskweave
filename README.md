# TaskWeave

TaskWeave is a **portfolio-grade full-stack** example: multi-workspace **Kanban boards**, **role-based access control** (Owner / Member / Viewer), and **email-scoped invite links**. It is intentionally small enough to read in an afternoon, but structured like a real product (auth boundaries, server actions, Prisma schema, CI, and Dockerized Postgres).

[![CI](https://github.com/Kauaioliveira/taskweave/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/Kauaioliveira/taskweave/actions/workflows/ci.yml?query=branch%3Amain)

**Live demo:** not published yet — run locally with [Quick start](#quick-start). When you deploy (e.g. Vercel + managed Postgres), replace this line with your public URL.

## Architecture

```mermaid
flowchart LR
  Browser[Browser]
  Next[Nextjs_AppRouter]
  Auth[Authjs_GitHubOAuth]
  Prisma[PrismaClient]
  PG[(Postgres)]

  Browser --> Next
  Next --> Auth
  Next --> Prisma
  Prisma --> PG
```

## Tech stack

- **Next.js (App Router) + TypeScript**
- **Auth.js (NextAuth v5)** with **GitHub OAuth** and database-backed sessions
- **Prisma** + **PostgreSQL**
- **Docker Compose** for local Postgres
- **Vitest** for a small RBAC unit test suite
- **Playwright** for a CI-only E2E smoke path (credentials provider gated by `E2E_TEST=1`)
- **GitHub Actions** CI (lint, typecheck, unit tests, build, E2E)

## Quick start

1. Install Node.js **20+** (22 recommended) and npm.
2. Start Postgres:

```bash
docker compose up -d
```

3. Configure environment variables:

```bash
cp .env.example .env
```

Fill in `DATABASE_URL` (defaults match `docker-compose.yml`), `AUTH_SECRET`, and GitHub OAuth keys (`AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`).

4. Push schema and run the dev server:

```bash
npm install
npx prisma db push
npm run dev
```

Open `http://localhost:3000`.

## GitHub OAuth callback URL

For local development, set the callback URL in your GitHub OAuth app to:

`http://localhost:3000/api/auth/callback/github`

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start Next.js (Turbopack) |
| `npm run build` | `prisma generate` + production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test` | Vitest |
| `npm run test:e2e` | Playwright (expects `E2E_TEST=1` + seeded user) |
| `npm run db:push` | Sync Prisma schema to the database (great for local dev) |
| `npm run db:seed` | Seed the E2E user when `E2E_TEST=1` |

## Deploy notes (Vercel + managed Postgres)

1. Create a Postgres database (Neon/Supabase/Railway) and set `DATABASE_URL` in Vercel.
2. Set `AUTH_SECRET`, `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`, and `AUTH_TRUST_HOST=true`.
3. Set the GitHub OAuth callback to your production domain: `https://YOUR_DOMAIN/api/auth/callback/github`.
4. After the first deploy, run `npx prisma db push` (or a migration workflow) against production **once** from a trusted environment, or run migrations in CI/CD the way your team prefers.

## Português (curto)

Este repositório é um **projeto de portfólio** focado em mostrar **autenticação**, **autorização por workspace**, **Prisma/Postgres**, **Docker**, **testes** e **CI**.

## License

MIT
