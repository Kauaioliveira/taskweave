import type { WorkspaceRole } from "@prisma/client";

const rank: Record<WorkspaceRole, number> = {
  VIEWER: 0,
  MEMBER: 1,
  OWNER: 2,
};

export function roleMeetsMinimum(role: WorkspaceRole, minimum: WorkspaceRole): boolean {
  return rank[role] >= rank[minimum];
}

export function minimumRoleForBoardEdit(): WorkspaceRole {
  return "MEMBER";
}

export function minimumRoleForWorkspaceAdmin(): WorkspaceRole {
  return "OWNER";
}

export function minimumRoleForInvite(): WorkspaceRole {
  return "OWNER";
}
