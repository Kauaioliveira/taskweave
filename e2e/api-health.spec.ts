import { test, expect } from "@playwright/test";

test.describe("API health", () => {
  test("GET /api/health returns JSON", async ({ request }) => {
    const res = await request.get("/api/health");
    expect(res.ok()).toBe(true);
    const body = await res.json();
    expect(body).toEqual({ ok: true, service: "taskweave" });
  });
});
