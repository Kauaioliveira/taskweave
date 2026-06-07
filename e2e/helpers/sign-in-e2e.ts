import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

export type SignInE2EOptions = {
  /** When true, asserts the CI-only E2E banner on `/login` before submitting (fails fast if the server is not in E2E mode). */
  assertE2EBanner?: boolean;
};

/** Sign in via the E2E credentials provider (requires `E2E_TEST=1` and `E2E_PASSWORD`). */
export async function signInWithE2ECredentials(
  page: Page,
  email: string,
  options?: SignInE2EOptions,
): Promise<void> {
  const password = process.env.E2E_PASSWORD;
  if (!password) {
    throw new Error("E2E_PASSWORD is required for E2E credentials sign-in");
  }

  await page.goto("/login", { waitUntil: "load" });
  if (options?.assertE2EBanner) {
    await expect(page.getByText("E2E mode enabled (CI only)")).toBeVisible({ timeout: 120_000 });
  }
  await page.getByPlaceholder("e2e@test.com").fill(email);
  await page.getByPlaceholder("E2E password from env").fill(password);
  await page.getByRole("button", { name: "Sign in (E2E credentials)" }).click();
}
