# Roadmap (optional, post-MVP)

These items were suggested in the original portfolio plan. The core demo is **RBAC workspaces, boards, and invites**; everything below is **optional polish** for interviews—prefer **small, isolated commits** if you implement them.

## Done in-repo (reference for interviews)

- **Versioned Prisma migrations** — `prisma/migrations/` + `migrate deploy` in CI; see README / CONTRIBUTING.
- **Extra E2E** — viewer read-only, invite wrong-email, invite accept happy path, owner vs viewer UI (`e2e/*.spec.ts`).
- **Sentry (optional)** — `@sentry/nextjs` with `instrumentation.ts` / `instrumentation-client.ts`; SDK only initialises when `SENTRY_DSN` and/or `NEXT_PUBLIC_SENTRY_DSN` are set (no noise in local dev without them).
- **Resend invite email (optional)** — `RESEND_API_KEY` + `RESEND_FROM`; creating an invite still succeeds if email is skipped or fails (copy link remains the fallback).
- **Kanban drag-and-drop (editors)** — `@dnd-kit/core` cross-list moves on the board page; viewers still see read-only columns.

## Optional next steps (pick any; no priority order)

- **API documentation:** extend OpenAPI beyond `/api/health` if you add more public HTTP routes.

Update this file as you implement items (or delete sections you decide not to pursue).
