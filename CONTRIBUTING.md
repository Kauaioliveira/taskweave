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

Install dependencies and sync the database schema:

```bash
npm install
```

After the first successful install, commit `package-lock.json` so CI can use `npm ci` for reproducible builds.

```bash
npx prisma db push
npm run dev
```

### GitHub OAuth app

Create a GitHub OAuth app and set the callback URL:

`http://localhost:3000/api/auth/callback/github`

## Database migrations vs `db push`

For early development this repo documents `prisma db push` for speed.

If you want stricter production practices, switch to `prisma migrate dev` locally and commit migration folders, then use `prisma migrate deploy` in production.

## E2E tests (Playwright)

E2E uses a **credentials provider** that is only enabled when `E2E_TEST=1`.

1. Set in `.env`:

```
E2E_TEST=1
E2E_PASSWORD=choose-a-local-password
```

2. Seed the user:

```bash
npm run db:seed
```

3. Run Playwright:

```bash
npm run test:e2e
```

Do **not** commit secrets (`.env`, OAuth secrets, production database URLs).

## CI

GitHub Actions runs lint, typecheck, unit tests, build, and Playwright against a Postgres service container.
