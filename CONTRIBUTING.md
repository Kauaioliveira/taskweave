# Contributing to TaskWeave

This project is primarily a **learning/portfolio** codebase. Issues and PRs are welcome if you want to extend it, but the main goal is clarity for recruiters and interview conversations.

## Local development

### Prerequisites

- Node.js 20+ (22 recommended)
- Docker (for Postgres)

### Setup

```bash
docker compose up -d
cp .env.example .env
```

Edit `.env`:

- `DATABASE_URL` should match `docker-compose.yml` unless you use your own Postgres.
- `AUTH_SECRET` should be a long random string (`openssl rand -base64 32`).
- `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` come from a GitHub OAuth app.
- **`AUTH_URL`**: set to `http://localhost:3000` locally so Auth.js callback URLs match how you open the app (especially for E2E). In production, set it to your public `https://…` origin (see [docs/deploy-vercel.md](docs/deploy-vercel.md)).

Install dependencies and apply migrations:

```bash
npm install
```

After the first successful install, commit `package-lock.json` so CI can use `npm ci` for reproducible builds.

```bash
npx prisma migrate deploy
npm run dev
```

For quick schema experiments on a disposable database, `npx prisma db push` is still fine; production-style workflows should use **`prisma migrate dev`** locally (creates migration files) and **`prisma migrate deploy`** in CI/production.

### GitHub OAuth app

Create a GitHub OAuth app and set the callback URL:

`http://localhost:3000/api/auth/callback/github`

Add your production callback when you deploy (see deploy doc).

## Database migrations vs `db push`

This repo ships **versioned** SQL under `prisma/migrations/`. CI runs `npx prisma migrate deploy` before tests.

- **Local (tracked schema changes):** `npx prisma migrate dev` after editing `schema.prisma`, then commit the new migration folder.
- **CI / production:** `npx prisma migrate deploy`.
- **`db push`:** optional shortcut for local-only iteration without migration files.

## E2E tests (Playwright)

E2E uses a **credentials provider** that is only enabled when `E2E_TEST=1`.

1. Set in `.env`:

```
E2E_TEST=1
E2E_PASSWORD=choose-a-local-password
AUTH_URL=http://localhost:3000
```

2. Apply migrations and seed fixtures:

```bash
npx prisma migrate deploy
npm run db:seed
```

3. Run Playwright:

```bash
npm run test:e2e
```

**Kanban DnD:** we do **not** run a Playwright drag simulation for `@dnd-kit` in CI. Pointer + keyboard DnD is sensitive to layout timing and tends to be flaky in headless runs; regressions are caught manually and via the board server actions. `GET /api/health` is covered with a fast `request` test.

Do **not** commit secrets (`.env`, OAuth secrets, production database URLs).

## CI

GitHub Actions runs lint, typecheck, unit tests, build, and Playwright against a Postgres service container. The database is prepared with **`prisma migrate deploy`** and **`npm run db:seed`** (when `E2E_TEST=1`).
