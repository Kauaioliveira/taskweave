# Deploy TaskWeave to Vercel (Postgres)

This guide targets a **public demo** on Vercel with a **managed Postgres** (Neon, Supabase, or Railway). Adjust names if your provider differs.

## 1) Create Postgres and get `DATABASE_URL`

- **Neon:** create a project → copy the pooled connection string (includes `sslmode=require` if offered).
- **Supabase:** Project Settings → Database → URI (use the **Transaction** pooler for serverless if recommended).
- **Railway:** Postgres plugin → copy `DATABASE_URL`.

Keep this string secret; you will paste it into Vercel only.

## 2) Create the Vercel project

1. Import the GitHub repository in Vercel.
2. Framework preset: **Next.js** (auto-detected).
3. **Root directory:** repository root (where `package.json` lives).

## 3) Environment variables (Vercel → Settings → Environment Variables)

Set for **Production** (and Preview if you want previews to work end-to-end):

| Variable | Example / notes |
| --- | --- |
| `DATABASE_URL` | From your managed Postgres |
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `AUTH_GITHUB_ID` | GitHub OAuth App Client ID |
| `AUTH_GITHUB_SECRET` | GitHub OAuth App secret |
| `AUTH_TRUST_HOST` | `true` (Vercel sits behind a proxy) |
| `AUTH_URL` | `https://<your-production-domain>` (your Vercel URL or custom domain) |
| `NEXT_PUBLIC_APP_URL` | Optional; same public URL if you add client-side links later |

**Do not** set `E2E_TEST` or `E2E_PASSWORD` in production.

## 4) GitHub OAuth callback

In your GitHub OAuth App, add **Authorization callback URL**:

`https://<your-production-domain>/api/auth/callback/github`

If you use the default `*.vercel.app` hostname, include that exact URL (GitHub allows multiple callbacks — keep `http://localhost:3000/...` for local dev).

## 5) Apply the database schema (first deploy)

After the first successful Vercel build (or from your laptop with production `DATABASE_URL`):

```bash
npx prisma migrate deploy
```

This repo ships SQL migrations under `prisma/migrations/`. Use a trusted machine; do not commit production URLs.

## 6) Smoke test in production

1. Open your public URL.
2. **Sign in with GitHub**.
3. Create a workspace and a board.

## 7) Update the README demo link

Replace the **Live demo** line in `README.md` with your public URL so recruiters can click through immediately.

## Troubleshooting

- **OAuth redirect mismatch:** double-check `AUTH_URL` and the GitHub callback host match your deployment hostname.
- **Prisma / SSL:** managed Postgres URLs usually include SSL; if you see TLS errors, confirm the provider’s recommended query params.
- **Build fails on Prisma:** ensure `postinstall` runs (`prisma generate`) — Vercel runs `npm install` by default.
