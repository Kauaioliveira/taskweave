import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getMembership } from "@/lib/workspace-access";

/**
 * Read-only board summary for integrations and OpenAPI (`docs/openapi.yaml`).
 * Requires an Auth.js session cookie (same origin as the app).
 */
export async function GET(_request: Request, context: { params: Promise<{ boardId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { boardId } = await context.params;

  const board = await prisma.board.findUnique({
    where: { id: boardId },
    select: {
      id: true,
      name: true,
      workspaceId: true,
      lists: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          name: true,
          order: true,
          _count: { select: { cards: true } },
        },
      },
    },
  });

  if (!board) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const membership = await getMembership(board.workspaceId, session.user.id);
  if (!membership) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: board.id,
    name: board.name,
    workspaceId: board.workspaceId,
    lists: board.lists.map((list) => ({
      id: list.id,
      name: list.name,
      order: list.order,
      cardCount: list._count.cards,
    })),
  });
}
