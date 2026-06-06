"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { minimumRoleForBoardEdit } from "@/lib/rbac";
import { requireMembership } from "@/lib/workspace-access";

async function requireBoardAccess(boardId: string, userId: string) {
  const board = await prisma.board.findUnique({
    where: { id: boardId },
    select: { workspaceId: true },
  });
  if (!board) throw new Error("Not found");
  await requireMembership(board.workspaceId, userId, minimumRoleForBoardEdit());
  return board;
}

export async function createList(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const boardId = String(formData.get("boardId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (!boardId || !name) return;

  const board = await requireBoardAccess(boardId, session.user.id);

  const last = await prisma.list.findFirst({
    where: { boardId },
    orderBy: { order: "desc" },
    select: { order: true },
  });
  const order = (last?.order ?? -1) + 1;

  await prisma.list.create({
    data: { boardId, name, order },
  });

  revalidatePath(`/workspaces/${board.workspaceId}/boards/${boardId}`);
}

export async function createCard(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const listId = String(formData.get("listId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  if (!listId || !title) return;

  const list = await prisma.list.findUnique({
    where: { id: listId },
    include: { board: true },
  });
  if (!list) throw new Error("Not found");

  await requireBoardAccess(list.boardId, session.user.id);

  const last = await prisma.card.findFirst({
    where: { listId },
    orderBy: { order: "desc" },
    select: { order: true },
  });
  const order = (last?.order ?? -1) + 1;

  await prisma.card.create({
    data: { listId, title, order },
  });

  revalidatePath(`/workspaces/${list.board.workspaceId}/boards/${list.boardId}`);
}

export async function moveCard(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const cardId = String(formData.get("cardId") ?? "");
  const toListId = String(formData.get("toListId") ?? "");
  if (!cardId || !toListId) return;

  const card = await prisma.card.findUnique({
    where: { id: cardId },
    include: { list: { include: { board: true } } },
  });
  if (!card) throw new Error("Not found");

  await requireBoardAccess(card.list.boardId, session.user.id);

  const targetList = await prisma.list.findFirst({
    where: { id: toListId, boardId: card.list.boardId },
  });
  if (!targetList) throw new Error("Invalid list");

  const last = await prisma.card.findFirst({
    where: { listId: toListId },
    orderBy: { order: "desc" },
    select: { order: true },
  });
  const order = (last?.order ?? -1) + 1;

  await prisma.card.update({
    where: { id: cardId },
    data: { listId: toListId, order },
  });

  revalidatePath(`/workspaces/${card.list.board.workspaceId}/boards/${card.list.boardId}`);
}
