import { test, expect } from "@playwright/test";

test.describe("E2E (credentials)", () => {
  test.skip(!process.env.E2E_TEST || !process.env.E2E_PASSWORD, "Requires E2E_TEST=1 and E2E_PASSWORD");

  test("login and create workspace", async ({ page }) => {
    test.setTimeout(180_000);

    await page.goto("/login", { waitUntil: "load" });
    // If E2E_TEST is not visible to the Next dev server, this fails fast with a clear signal.
    await expect(page.getByText("E2E mode enabled (CI only)")).toBeVisible({ timeout: 120_000 });
    await page.getByPlaceholder("e2e@test.com").fill("e2e@test.com");
    await page.getByPlaceholder("E2E password from env").fill(process.env.E2E_PASSWORD!);
    await page.getByRole("button", { name: "Sign in (E2E credentials)" }).click();

    await expect(page).toHaveURL(/\/workspaces/, { timeout: 120_000 });

    await page.getByPlaceholder("Workspace name").fill("Playwright Workspace");
    await page.getByRole("button", { name: "Create" }).click();

    await expect(page.getByRole("heading", { name: "Playwright Workspace" })).toBeVisible({
      timeout: 60_000,
    });
  });
});
