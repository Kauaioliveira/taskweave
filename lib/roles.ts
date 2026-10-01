import type { WorkspaceRole } from "@prisma/client";

export const ROLE_LABEL: Record<WorkspaceRole, string> = {
  OWNER: "Owner",
  MEMBER: "Member",
  VIEWER: "Viewer",
};

export const ROLE_DESCRIPTION: Record<WorkspaceRole, string> = {
  OWNER: "Full control: boards, invites, and workspace settings",
  MEMBER: "Can create boards and edit cards",
  VIEWER: "Read-only access to boards",
};

const ROLES: readonly WorkspaceRole[] = ["OWNER", "MEMBER", "VIEWER"];

/** Narrows untrusted form input to a valid workspace role. */
export function parseWorkspaceRole(value: unknown, fallback: WorkspaceRole = "MEMBER"): WorkspaceRole {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value)
    ? (value as WorkspaceRole)
    : fallback;
}
