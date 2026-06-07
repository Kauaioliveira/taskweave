# Roadmap (optional, post-MVP)

These items were suggested in the original portfolio plan. The core demo is **RBAC workspaces, boards, and invites**; everything below is **optional polish** for interviews—prefer **small, isolated commits** if you implement them.

## Done in-repo (reference for interviews)

- **Versioned Prisma migrations** — `prisma/migrations/` + `migrate deploy` in CI; see README / CONTRIBUTING.
- **Extra E2E** — viewer read-only, invite wrong-email, invite accept happy path, owner vs viewer UI (`e2e/*.spec.ts`).
- **Deploy documentation** — [deploy-vercel.md](deploy-vercel.md) for a public demo URL.

## Optional next steps (pick any; no priority order)

- **Observability:** Sentry (or similar) for server/client errors in production-like environments.
- **API documentation:** OpenAPI / typed route docs if you expose more HTTP endpoints beyond Auth.js.
- **Invites by email:** transactional email (Resend, SES, etc.) instead of copy-paste invite links only.
- **Kanban UX:** drag-and-drop (e.g. `@dnd-kit`) instead of move-via-select MVP.

Update this file as you implement items (or delete sections you decide not to pursue).
