import type { WorkspaceRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { roleMeetsMinimum } from "@/lib/rbac";

export async function getMembership(workspaceId: string, userId: string) {
  return prisma.membership.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } },
  });
}

export async function requireMembership(
  workspaceId: string,
  userId: string,
  minimum: WorkspaceRole,
) {
  const membership = await getMembership(workspaceId, userId);
  if (!membership || !roleMeetsMinimum(membership.role, minimum)) {
    throw new Error("Forbidden");
  }
  return membership;
}
