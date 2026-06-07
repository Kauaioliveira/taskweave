import { test, expect } from "@playwright/test";
import { signInWithE2ECredentials } from "./helpers/sign-in-e2e";

const WRONG_EMAIL_INVITE_TOKEN = "e2e_wrongemail_invite_token_00001";

test.describe("Invite wrong email", () => {
  test.skip(!process.env.E2E_TEST || !process.env.E2E_PASSWORD, "Requires E2E_TEST=1 and E2E_PASSWORD");

  test("accepting invite with non-matching session shows wrong-email message", async ({ page }) => {
    test.setTimeout(180_000);

    await signInWithE2ECredentials(page, "viewer@e2e.test.com");
    await expect(page).toHaveURL(/\/workspaces/, { timeout: 120_000 });

    await page.goto(`/invite/${WRONG_EMAIL_INVITE_TOKEN}`, { waitUntil: "load" });
    await expect(page.getByRole("heading", { name: "Workspace invite" })).toBeVisible({ timeout: 60_000 });
    await expect(page.getByText("Invited email: invited-only@e2e.test.com")).toBeVisible();

    await page.getByRole("button", { name: "Accept invite" }).click();

    await expect(page).toHaveURL(new RegExp(`/invite/${WRONG_EMAIL_INVITE_TOKEN}\\?invite=wrong-email`));
    await expect(
      page.getByText("Your signed-in account email does not match this invite. Sign in with the invited email."),
    ).toBeVisible();
  });
});
