import { test, expect } from "@playwright/test";
import { signInWithE2ECredentials } from "./helpers/sign-in-e2e";

test.describe("Viewer read-only (RBAC)", () => {
  test.skip(!process.env.E2E_TEST || !process.env.E2E_PASSWORD, "Requires E2E_TEST=1 and E2E_PASSWORD");

  test("VIEWER does not see create board or invite UI", async ({ page }) => {
    test.setTimeout(180_000);

    await signInWithE2ECredentials(page, "viewer@e2e.test.com");
    await expect(page).toHaveURL(/\/workspaces/, { timeout: 120_000 });

    await page.getByRole("link", { name: "RBAC Demo Workspace" }).click();
    await expect(page.getByRole("heading", { name: "RBAC Demo Workspace" })).toBeVisible({ timeout: 60_000 });
    await expect(page.getByText("Your role: VIEWER")).toBeVisible();
    await expect(page.getByText("You have read-only access in this workspace.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Create board" })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Invite member" })).toHaveCount(0);
  });
});
