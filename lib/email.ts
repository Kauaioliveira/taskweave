import { Resend } from "resend";
import { escapeHtml } from "@/lib/escape-html";

export type SendInviteEmailResult = { sent: boolean; reason?: string };

/**
 * Sends a workspace invite email via Resend when API key and from-address are configured.
 * Never throws — invite creation should succeed even if email fails.
 */
export async function sendWorkspaceInviteEmail(opts: {
  to: string;
  inviteUrl: string;
  workspaceName: string;
}): Promise<SendInviteEmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM?.trim();
  if (!apiKey || !from) {
    if (process.env.NODE_ENV === "development") {
      console.info("[email] Resend skipped: RESEND_API_KEY or RESEND_FROM unset");
    }
    return { sent: false, reason: "skipped_no_env" };
  }

  const resend = new Resend(apiKey);
  const safeName = escapeHtml(opts.workspaceName);
  const safeUrl = escapeHtml(opts.inviteUrl);

  try {
    const { error } = await resend.emails.send({
      from,
      to: opts.to,
      subject: `TaskWeave invite: ${opts.workspaceName}`,
      html: `<p>You were invited to the workspace <strong>${safeName}</strong>.</p><p><a href="${safeUrl}">Open invite</a></p>`,
    });
    if (error) {
      console.error("[email] Resend API error:", error);
      return { sent: false, reason: "resend_api_error" };
    }
    return { sent: true };
  } catch (e) {
    console.error("[email] Resend send failed:", e);
    return { sent: false, reason: "send_error" };
  }
}
