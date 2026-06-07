import { NextResponse } from "next/server";

/**
 * Minimal liveness endpoint for uptime checks and OpenAPI stub (`docs/openapi.yaml`).
 */
export function GET() {
  return NextResponse.json({ ok: true as const, service: "taskweave" });
}
