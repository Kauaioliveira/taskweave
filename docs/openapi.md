# OpenAPI and public HTTP surface

TaskWeave is primarily a **Next.js App Router** app with **server actions** and **Auth.js** at `app/api/auth/[...nextauth]/route.ts`. That pattern does not naturally produce a large REST surface to document.

## When OpenAPI is worth it

- You expose **versioned REST** or **webhooks** consumed by third parties.
- You want generated **SDKs** or **contract tests** against stable HTTP paths.
- Common stack: **Zod** schemas + `zod-to-openapi`, or hand-written `openapi.yaml` kept next to route handlers.

## What this repo ships today

- **`GET /api/health`** — small JSON liveness probe for uptime monitors ([`app/api/health/route.ts`](../app/api/health/route.ts)).
- **`GET /api/boards/{boardId}`** — read-only board summary (lists + `cardCount`) for the signed-in workspace member ([`app/api/boards/[boardId]/route.ts`](../app/api/boards/[boardId]/route.ts)). Same **Auth.js session cookie** as the web UI; not a standalone API key.
- **[`docs/openapi.yaml`](openapi.yaml)** — OpenAPI 3 description of the routes above. Expand when you add more first-party HTTP surfaces.

Auth.js OAuth callback routes are defined by the library; documenting them in OpenAPI is usually **low value** compared to linking to the official Auth.js docs in the README.

## Maintenance

Only extend [`openapi.yaml`](openapi.yaml) when you add **new first-party HTTP routes** meant for external consumers. Do not grow the file for purely internal Server Actions or Auth.js internals — keep the contract small and honest.
