# Architecture notes

## High-level design

TaskWeave is a **multi-tenant logical** product: a user belongs to many workspaces via `Membership`, and each workspace owns boards/lists/cards.

Authorization is enforced in **server actions** by calling `requireMembership(...)` with a **minimum role** threshold (for example, board edits require `MEMBER`, invites require `OWNER`).

## Authentication

Auth.js is configured in the root `auth.ts` file:

- **GitHub OAuth** for normal usage
- **Database sessions** (`session: { strategy: "database" }`) so sessions are revocable and tied to Prisma models
- **`@auth/prisma-adapter`** to persist `User`, `Account`, and `Session` rows

## Authorization (RBAC)

Roles are modeled as a Prisma enum `WorkspaceRole`:

- `OWNER`: workspace admin (delete workspace, create invites)
- `MEMBER`: can create/edit boards, lists, and cards
- `VIEWER`: read-only within the workspace

RBAC helpers live in:

- `lib/rbac.ts` (pure comparisons)
- `lib/workspace-access.ts` (database membership lookup + guard)

## Invites

`WorkspaceInvite` stores a random `token`, invited `email`, desired `role`, and `expiresAt`.

Acceptance checks:

- invite exists and is unused
- not expired
- the signed-in user email matches the invited email (case-insensitive)

## Why server actions

Mutations are implemented as Next.js **server actions** under `app/actions/*` to keep authorization close to data access and avoid exposing a large public REST surface area.

This is a reasonable portfolio tradeoff: easy to read, easy to test incrementally, and still maps cleanly to “how would you structure APIs in a larger system?” interview discussions.
