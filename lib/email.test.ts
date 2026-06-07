import { afterEach, describe, expect, it, vi } from "vitest";
import { sendWorkspaceInviteEmail } from "./email";

describe("sendWorkspaceInviteEmail", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns skipped_no_env when Resend is not configured", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    vi.stubEnv("RESEND_FROM", "");
    const result = await sendWorkspaceInviteEmail({
      to: "user@example.com",
      inviteUrl: "https://app.example/invite/token",
      workspaceName: "Acme <team>",
    });
    expect(result).toEqual({ sent: false, reason: "skipped_no_env" });
  });
});
