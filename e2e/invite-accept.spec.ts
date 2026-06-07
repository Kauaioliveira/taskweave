import { test, expect } from "@playwright/test";
import { signInWithE2ECredentials } from "./helpers/sign-in-e2e";

const ACCEPT_INVITE_TOKEN = "e2e_accept_invite_token_ok";

test.describe("Invite accept (happy path)", () => {
  test.skip(!process.env.E2E_TEST || !process.env.E2E_PASSWORD, "Requires E2E_TEST=1 and E2E_PASSWORD");

  test("matching email can accept and land on workspace", async ({ page }) => {
    test.setTimeout(180_000);

    await signInWithE2ECredentials(page, "accept@e2e.test.com");
    await expect(page).toHaveURL(/\/workspaces/, { timeout: 120_000 });

    await page.goto(`/invite/${ACCEPT_INVITE_TOKEN}`, { waitUntil: "load" });
    await expect(page.getByRole("heading", { name: "Workspace invite" })).toBeVisible({ timeout: 60_000 });
    await expect(page.getByText("Invited email: accept@e2e.test.com")).toBeVisible();

    await page.getByRole("button", { name: "Accept invite" }).click();

    await expect(page).toHaveURL(/\/workspaces\/[^/]+$/, { timeout: 60_000 });
    await expect(page.getByRole("heading", { name: "RBAC Demo Workspace" })).toBeVisible({ timeout: 60_000 });
    await expect(page.getByText("Your role: MEMBER")).toBeVisible();
  });
});
