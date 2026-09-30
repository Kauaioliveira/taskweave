import { test, expect } from "@playwright/test";
import { signInWithE2ECredentials } from "./helpers/sign-in-e2e";

test.describe("Board flow (owner)", () => {
  test.skip(!process.env.E2E_TEST || !process.env.E2E_PASSWORD, "Requires E2E_TEST=1 and E2E_PASSWORD");

  test("create a board, add a card and a list", async ({ page }) => {
    test.setTimeout(180_000);

    await signInWithE2ECredentials(page, "e2e@test.com");
    await expect(page).toHaveURL(/\/workspaces/, { timeout: 120_000 });

    await page.getByRole("link", { name: /RBAC Demo Workspace/ }).click();
    await expect(page.getByRole("heading", { name: "RBAC Demo Workspace" })).toBeVisible({ timeout: 60_000 });

    const boardName = `Board ${Date.now()}`;
    await page.getByPlaceholder("New board name").fill(boardName);
    await page.getByRole("button", { name: "Create board" }).click();

    await expect(page.getByRole("heading", { name: boardName, level: 1 })).toBeVisible({ timeout: 60_000 });
    const todo = page.getByRole("region", { name: "To do" });
    await expect(todo).toBeVisible();
    await expect(page.getByRole("region", { name: "Doing" })).toBeVisible();
    await expect(page.getByRole("region", { name: "Done" })).toBeVisible();

    await todo.getByPlaceholder("Card title").fill("Write the release notes");
    await todo.getByRole("button", { name: "Add card" }).click();
    await expect(todo.getByText("Write the release notes")).toBeVisible({ timeout: 60_000 });
    await expect(todo.getByLabel("1 card")).toBeVisible();

    await page.getByPlaceholder("New list").fill("Review");
    await page.getByRole("button", { name: "Add list" }).click();
    await expect(page.getByRole("region", { name: "Review" })).toBeVisible({ timeout: 60_000 });
  });
});
