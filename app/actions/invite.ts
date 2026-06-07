"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { minimumRoleForInvite } from "@/lib/rbac";
import { requireMembership } from "@/lib/workspace-access";
import { sendWorkspaceInviteEmail } from "@/lib/email";
import { getPublicOrigin } from "@/lib/public-origin";

export async function createWorkspaceInvite(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const workspaceId = String(formData.get("workspaceId") ?? "");
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const role = String(formData.get("role") ?? "MEMBER") as "OWNER" | "MEMBER" | "VIEWER";

  if (!workspaceId || !email) return;

  await requireMembership(workspaceId, session.user.id, minimumRoleForInvite());

  const token = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);

  await prisma.workspaceInvite.create({
    data: {
      workspaceId,
      email,
      role,
      token,
      expiresAt,
      createdById: session.user.id,
    },
  });

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { name: true },
  });

  const origin = getPublicOrigin();
  if (origin) {
    const inviteUrl = `${origin}/invite/${token}`;
    await sendWorkspaceInviteEmail({
      to: email,
      inviteUrl,
      workspaceName: workspace?.name ?? "Workspace",
    });
  } else if (process.env.NODE_ENV === "development") {
    console.info("[email] Skipped invite email: no AUTH_URL / VERCEL_URL / NEXT_PUBLIC_APP_URL for absolute invite URL");
  }

  revalidatePath(`/workspaces/${workspaceId}`);
}

export async function acceptWorkspaceInvite(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const token = String(formData.get("token") ?? "");
  if (!token) return;

  const invite = await prisma.workspaceInvite.findUnique({
    where: { token },
    include: { workspace: true },
  });

  if (!invite || invite.usedAt) {
    redirect("/workspaces?invite=invalid");
  }

  if (invite.expiresAt.getTime() < Date.now()) {
    redirect("/workspaces?invite=expired");
  }

  const email = session.user.email?.toLowerCase();
  if (!email || email !== invite.email.toLowerCase()) {
    redirect(`/invite/${token}?invite=wrong-email`);
  }

  const existing = await prisma.membership.findUnique({
    where: {
      userId_workspaceId: { userId: session.user.id, workspaceId: invite.workspaceId },
    },
  });

  if (!existing) {
    await prisma.membership.create({
      data: {
        userId: session.user.id,
        workspaceId: invite.workspaceId,
        role: invite.role,
      },
    });
  }

  await prisma.workspaceInvite.update({
    where: { id: invite.id },
    data: { usedAt: new Date() },
  });

  revalidatePath("/workspaces");
  revalidatePath(`/workspaces/${invite.workspaceId}`);
  redirect(`/workspaces/${invite.workspaceId}`);
}
