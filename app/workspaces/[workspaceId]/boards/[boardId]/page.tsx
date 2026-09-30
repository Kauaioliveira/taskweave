import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { roleMeetsMinimum, minimumRoleForBoardEdit, minimumRoleForWorkspaceAdmin } from "@/lib/rbac";
import { getMembership } from "@/lib/workspace-access";
import { deleteBoard, renameBoard } from "@/app/actions/workspace";
import { RoleBadge } from "@/components/RoleBadge";
import { SubmitButton } from "@/components/SubmitButton";
import { ui } from "@/components/ui";
import { BoardDnd } from "./BoardDnd";

export const metadata: Metadata = { title: "Board" };

export default async function BoardPage({
  params,
}: {
  params: Promise<{ workspaceId: string; boardId: string }>;
}) {
  const { workspaceId, boardId } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  const membership = await getMembership(workspaceId, session.user.id);
  if (!membership) {
    notFound();
  }

  const board = await prisma.board.findFirst({
    where: { id: boardId, workspaceId },
    include: {
      workspace: { select: { name: true } },
      lists: {
        orderBy: { order: "asc" },
        include: { cards: { orderBy: { order: "asc" } } },
      },
    },
  });

  if (!board) {
    notFound();
  }

  const canEdit = roleMeetsMinimum(membership.role, minimumRoleForBoardEdit());
  const canDelete = roleMeetsMinimum(membership.role, minimumRoleForWorkspaceAdmin());
  const cardCount = board.lists.reduce((sum, l) => sum + l.cards.length, 0);

  return (
    <main id="main" className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6">
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-slate-400">
        <Link href="/workspaces" className="text-sky-300 hover:underline">
          Workspaces
        </Link>{" "}
        /{" "}
        <Link href={`/workspaces/${workspaceId}`} className="text-sky-300 hover:underline">
          {board.workspace.name}
        </Link>{" "}
        / <span className="text-slate-200">{board.name}</span>
      </nav>

      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold text-white">{board.name}</h1>
            <RoleBadge role={membership.role} />
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {cardCount} {cardCount === 1 ? "card" : "cards"} in {board.lists.length}{" "}
            {board.lists.length === 1 ? "list" : "lists"}
            {canEdit
              ? " · Drag cards by the handle, or focus it and use Space and the arrow keys."
              : " · Read-only (viewer)."}
          </p>
        </div>

        {canEdit ? (
          <details className="relative">
            <summary className={`${ui.btnGhost} cursor-pointer select-none`}>Board settings</summary>
            <div className="absolute right-0 z-20 mt-2 w-72 space-y-4 rounded-xl border border-slate-800 bg-slate-950 p-4 shadow-xl shadow-black/40">
              <form action={renameBoard} className="space-y-2">
                <input type="hidden" name="boardId" value={board.id} readOnly />
                <label htmlFor="board-name" className={ui.label}>
                  Board name
                </label>
                <input
                  id="board-name"
                  name="name"
                  defaultValue={board.name}
                  maxLength={80}
                  required
                  className={ui.input}
                />
                <SubmitButton className={`${ui.btnLight} w-full`} pendingLabel="Saving…">
                  Rename board
                </SubmitButton>
              </form>
              {canDelete ? (
                <form action={deleteBoard} className="border-t border-slate-800 pt-4">
                  <input type="hidden" name="boardId" value={board.id} readOnly />
                  <SubmitButton
                    className={`${ui.btnDanger} w-full`}
                    pendingLabel="Deleting…"
                    confirmMessage={`Delete board "${board.name}" and all of its cards? This cannot be undone.`}
                  >
                    Delete board
                  </SubmitButton>
                </form>
              ) : null}
            </div>
          </details>
        ) : null}
      </header>

      <BoardDnd boardId={board.id} lists={board.lists} canEdit={canEdit} />
    </main>
  );
}
