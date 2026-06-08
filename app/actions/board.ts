"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { insertCardIntoTargetOrder } from "@/lib/insert-card-into-order";
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

export async function updateCard(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const cardId = String(formData.get("cardId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const descriptionRaw = String(formData.get("description") ?? "").trim();
  const dueRaw = String(formData.get("dueAt") ?? "").trim();

  if (!cardId || !title) return;

  const card = await prisma.card.findUnique({
    where: { id: cardId },
    include: { list: { include: { board: true } } },
  });
  if (!card) throw new Error("Not found");

  await requireBoardAccess(card.list.boardId, session.user.id);

  let dueAt: Date | null = null;
  if (dueRaw) {
    const parsed = new Date(dueRaw);
    dueAt = Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  await prisma.card.update({
    where: { id: cardId },
    data: {
      title,
      description: descriptionRaw.length > 0 ? descriptionRaw : null,
      dueAt,
    },
  });

  revalidatePath(`/workspaces/${card.list.board.workspaceId}/boards/${card.list.boardId}`);
}

async function moveCardToListForUser(
  cardId: string,
  toListId: string,
  userId: string,
  beforeCardId: string | null = null,
) {
  const card = await prisma.card.findUnique({
    where: { id: cardId },
    include: { list: { include: { board: true } } },
  });
  if (!card) throw new Error("Not found");

  await requireBoardAccess(card.list.boardId, userId);

  const targetList = await prisma.list.findFirst({
    where: { id: toListId, boardId: card.list.boardId },
  });
  if (!targetList) throw new Error("Invalid list");

  if (card.listId === toListId) {
    return;
  }

  const fromListId = card.listId;

  const targetRows = await prisma.card.findMany({
    where: { listId: toListId },
    orderBy: { order: "asc" },
    select: { id: true },
  });
  const targetIds = targetRows.map((r) => r.id);
  const newTargetIds = insertCardIntoTargetOrder(targetIds, cardId, beforeCardId);

  const sourceRows = await prisma.card.findMany({
    where: { listId: fromListId },
    orderBy: { order: "asc" },
    select: { id: true },
  });
  const sourceIds = sourceRows.map((r) => r.id).filter((id) => id !== cardId);

  const boardPath = `/workspaces/${card.list.board.workspaceId}/boards/${card.list.boardId}`;

  await prisma.$transaction(async (tx) => {
    for (let order = 0; order < newTargetIds.length; order++) {
      const id = newTargetIds[order]!;
      await tx.card.update({
        where: { id },
        data: {
          ...(id === cardId ? { listId: toListId } : {}),
          order,
        },
      });
    }
    for (let order = 0; order < sourceIds.length; order++) {
      await tx.card.update({
        where: { id: sourceIds[order]! },
        data: { order },
      });
    }
  });

  revalidatePath(boardPath);
}

export async function moveCard(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const cardId = String(formData.get("cardId") ?? "");
  const toListId = String(formData.get("toListId") ?? "");
  if (!cardId || !toListId) return;

  const beforeRaw = String(formData.get("beforeCardId") ?? "").trim();
  const beforeCardId = beforeRaw.length > 0 ? beforeRaw : null;

  await moveCardToListForUser(cardId, toListId, session.user.id, beforeCardId);
}

/** Used by the Kanban DnD client; same rules as `moveCard` form action. */
export async function moveCardToList(cardId: string, toListId: string, beforeCardId?: string | null) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  await moveCardToListForUser(cardId, toListId, session.user.id, beforeCardId ?? null);
}

export async function deleteCard(cardId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const card = await prisma.card.findUnique({
    where: { id: cardId },
    include: { list: { include: { board: true } } },
  });
  if (!card) throw new Error("Not found");

  await requireBoardAccess(card.list.boardId, session.user.id);

  const listId = card.listId;
  const boardPath = `/workspaces/${card.list.board.workspaceId}/boards/${card.list.boardId}`;

  await prisma.$transaction(async (tx) => {
    await tx.card.delete({ where: { id: cardId } });

    const remaining = await tx.card.findMany({
      where: { listId },
      orderBy: { order: "asc" },
      select: { id: true },
    });

    for (let order = 0; order < remaining.length; order++) {
      await tx.card.update({
        where: { id: remaining[order]!.id },
        data: { order },
      });
    }
  });

  revalidatePath(boardPath);
}

function sameCardIdMultiset(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const sa = [...a].sort();
  const sb = [...b].sort();
  return sa.every((id, i) => id === sb[i]);
}

/** Used by the Kanban DnD client to persist intra-column order. */
export async function reorderCardsInList(listId: string, orderedCardIds: string[]) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const list = await prisma.list.findUnique({
    where: { id: listId },
    include: { board: true },
  });
  if (!list) throw new Error("Not found");

  await requireBoardAccess(list.boardId, session.user.id);

  const existing = await prisma.card.findMany({
    where: { listId },
    orderBy: { order: "asc" },
    select: { id: true },
  });
  const existingIds = existing.map((c) => c.id);

  if (!sameCardIdMultiset(existingIds, orderedCardIds)) {
    throw new Error("Invalid order");
  }

  await prisma.$transaction(
    orderedCardIds.map((id, order) => prisma.card.update({ where: { id }, data: { order } })),
  );

  revalidatePath(`/workspaces/${list.board.workspaceId}/boards/${list.boardId}`);
}
