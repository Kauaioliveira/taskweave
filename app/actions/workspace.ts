"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { minimumRoleForBoardEdit, minimumRoleForWorkspaceAdmin } from "@/lib/rbac";
import { requireMembership } from "@/lib/workspace-access";

function slugify(name: string) {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base.length > 0 ? base : "workspace";
}

export async function createWorkspace(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    redirect("/workspaces");
  }

  const slug = `${slugify(name)}-${crypto.randomUUID().slice(0, 8)}`;

  const workspace = await prisma.workspace.create({
    data: {
      name,
      slug,
      memberships: {
        create: { userId: session.user.id, role: "OWNER" },
      },
    },
  });

  revalidatePath("/workspaces");
  redirect(`/workspaces/${workspace.id}`);
}

export async function deleteWorkspace(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const workspaceId = String(formData.get("workspaceId") ?? "");
  await requireMembership(workspaceId, session.user.id, minimumRoleForWorkspaceAdmin());

  await prisma.workspace.delete({ where: { id: workspaceId } });
  revalidatePath("/workspaces");
  redirect("/workspaces");
}

export async function createBoard(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const workspaceId = String(formData.get("workspaceId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (!workspaceId || !name) return;

  await requireMembership(workspaceId, session.user.id, minimumRoleForBoardEdit());

  const board = await prisma.board.create({
    data: {
      name,
      workspaceId,
      lists: {
        create: [
          { name: "To do", order: 0 },
          { name: "Doing", order: 1 },
          { name: "Done", order: 2 },
        ],
      },
    },
  });

  revalidatePath(`/workspaces/${workspaceId}`);
  redirect(`/workspaces/${workspaceId}/boards/${board.id}`);
}
