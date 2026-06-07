import { test, expect } from "@playwright/test";
import { signInWithE2ECredentials } from "./helpers/sign-in-e2e";

test.describe("E2E (credentials)", () => {
  test.skip(!process.env.E2E_TEST || !process.env.E2E_PASSWORD, "Requires E2E_TEST=1 and E2E_PASSWORD");

  test("login and create workspace", async ({ page }) => {
    test.setTimeout(180_000);

    await signInWithE2ECredentials(page, "e2e@test.com", { assertE2EBanner: true });

    await expect(page).toHaveURL(/\/workspaces/, { timeout: 120_000 });

    await page.getByPlaceholder("Workspace name").fill("Playwright Workspace");
    await page.getByRole("button", { name: "Create" }).click();

    await expect(page.getByRole("heading", { name: "Playwright Workspace" })).toBeVisible({
      timeout: 60_000,
    });
  });
});
