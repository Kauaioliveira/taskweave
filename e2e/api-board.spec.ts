import { test, expect } from "@playwright/test";

test.describe("API boards", () => {
  test("GET /api/boards/{id} without session returns 401", async ({ request }) => {
    const res = await request.get("/api/boards/clidummy000doesnotmatter");
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body).toEqual({ error: "Unauthorized" });
  });
});
