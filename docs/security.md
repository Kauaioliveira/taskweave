# Security notes (TaskWeave)

This document summarizes **project hygiene** and known **risk tradeoffs**. It is not a penetration test report.

## Dependency scanning

- Run `npm audit` regularly. The repository aims to keep **`npm audit` clean** (0 reported vulnerabilities) using supported upgrades and, when necessary, **`overrides`** for transitive fixes (documented in `package.json`).
- After dependency changes, run `npm run lint`, `npm run typecheck`, `npm run test`, and `npm run build`.

## Secrets and configuration

- **Never commit** `.env`, `.env.local`, or real OAuth secrets.
- `.env.example` documents required variables without real values.
- The `private/` folder is **gitignored** intentionally for personal interview notes.

## GitHub Actions / CI

- CI uses **dummy** GitHub OAuth client id/secret values because OAuth is not exercised in CI.
- CI enables `E2E_TEST=1` and a fixed `E2E_PASSWORD` for Playwright. This is acceptable **only** because it runs in an ephemeral CI environment and the app should **not** enable `E2E_TEST` in production.

## Production hardening (recommended next steps)

- Add rate limiting for auth routes and invite acceptance.
- Add security headers (CSP/HSTS) via hosting platform or middleware (carefully validate with Next.js constraints).
- Prefer **fine-grained** GitHub tokens with least privilege for automation (if you add release workflows later).

## Build warnings (Edge runtime)

`next build` may warn that some dependencies are not Edge-compatible when pulled through `auth.ts` / middleware. This is a **compatibility warning**, not a secret leak. If you tighten middleware further, consider splitting Edge-safe auth boundaries per Auth.js/Next guidance.
