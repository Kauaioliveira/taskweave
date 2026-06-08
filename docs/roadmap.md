# Roadmap (optional, post-MVP)

These items were suggested in the original portfolio plan. The core demo is **RBAC workspaces, boards, and invites**; everything below is **optional polish** for interviews—prefer **small, isolated commits** if you implement them.

## Done in-repo (reference for interviews)

- **Vitest utilities** — `getPublicOrigin`, `escapeHtml`, and Resend skip path (`lib/*.test.ts`).
- **Extra E2E** — viewer read-only, invite wrong-email, invite accept happy path, owner vs viewer UI (`e2e/*.spec.ts`), plus **`GET /api/health`** and unauthenticated **`GET /api/boards/{id}` → 401** via Playwright `request`.
- **Sentry (optional)** — `@sentry/nextjs` with `instrumentation.ts` / `instrumentation-client.ts`; SDK only initialises when `SENTRY_DSN` and/or `NEXT_PUBLIC_SENTRY_DSN` are set (no noise in local dev without them).
- **Resend invite email (optional)** — `RESEND_API_KEY` + `RESEND_FROM`; creating an invite still succeeds if email is skipped or fails (copy link remains the fallback).
- **Kanban drag-and-drop (editors)** — `@dnd-kit/core` cross-list moves with **insert-before target card** when dropping on `card:…` (transaction rewrites `order` on source and target lists); intra-column reorder as above. Viewers see read-only columns. Keyboard sensors and **Action failed** banner with dismiss.
- **Intra-column card reorder (editors)** — same-list DnD updates `Card.order` via `reorderCardsInList` in a Prisma transaction; client uses `reorderCardIdsAfterDrop` (`lib/reorder-card-ids.ts`, Vitest). No Playwright drag simulation (same policy as cross-list DnD).
- **Card edit (editors)** — `<details>` form on each card for title, description, and optional due date; `updateCard` server action + `isoToDatetimeLocalValue` (`lib/datetime-local.ts`) for `datetime-local` defaults; client submits due as ISO for correct instant.
- **Card delete (editors)** — `deleteCard` server action renormalizes `Card.order` in the list after delete; UI confirm in board card `<details>`.
- **Public API / OpenAPI** — `GET /api/health`, **`GET /api/boards/{boardId}`** (session cookie, workspace member), [`docs/openapi.yaml`](openapi.yaml) schemas + `sessionCookie` security scheme; [docs/openapi.md](openapi.md). E2E: unauthenticated board request → `401`.
- **Baseline security headers** — `X-Frame-Options`, `Referrer-Policy`, and `X-Content-Type-Options` via [next.config.ts](../next.config.ts).

## Optional next steps (pick any; no priority order)

- Further HTTP routes (webhooks, API keys) if the product grows beyond the demo.

Update this file as you implement items (or delete sections you decide not to pursue).
