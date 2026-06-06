import { test, expect } from "@playwright/test";

test.describe("E2E (credentials)", () => {
  test.skip(!process.env.E2E_TEST || !process.env.E2E_PASSWORD, "Requires E2E_TEST=1 and E2E_PASSWORD");

  test("login and create workspace", async ({ page }) => {
    await page.goto("/login");
    await page.getByPlaceholder("e2e@test.com").fill("e2e@test.com");
    await page.getByPlaceholder("E2E password from env").fill(process.env.E2E_PASSWORD!);
    await page.getByRole("button", { name: "Sign in (E2E credentials)" }).click();

    await expect(page).toHaveURL(/\/workspaces/);

    await page.getByPlaceholder("Workspace name").fill("Playwright Workspace");
    await page.getByRole("button", { name: "Create" }).click();

    await expect(page.getByRole("heading", { name: "Playwright Workspace" })).toBeVisible();
  });
});
