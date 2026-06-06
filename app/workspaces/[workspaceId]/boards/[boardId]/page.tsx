import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { roleMeetsMinimum, minimumRoleForBoardEdit } from "@/lib/rbac";
import { getMembership } from "@/lib/workspace-access";
import { createList, createCard, moveCard } from "@/app/actions/board";

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

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6 text-sm text-slate-400">
        <Link href="/workspaces" className="text-sky-300 hover:underline">
          Workspaces
        </Link>{" "}
        /{" "}
        <Link href={`/workspaces/${workspaceId}`} className="text-sky-300 hover:underline">
          Workspace
        </Link>{" "}
        / <span className="text-slate-200">{board.name}</span>
      </div>

      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-white">{board.name}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {canEdit ? "You can edit lists and cards." : "Read-only (viewer)."}
        </p>
      </header>

      {canEdit ? (
        <section className="mb-6 rounded-xl border border-slate-800 bg-slate-950/40 p-4">
          <form action={createList} className="flex flex-wrap gap-2">
            <input type="hidden" name="boardId" value={board.id} readOnly />
            <input
              name="name"
              placeholder="New list"
              className="min-w-[200px] flex-1 rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
              required
            />
            <button
              type="submit"
              className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-white"
            >
              Add list
            </button>
          </form>
        </section>
      ) : null}

      <div className="flex gap-4 overflow-x-auto pb-4">
        {board.lists.map((list) => (
          <div key={list.id} className="w-72 shrink-0 rounded-xl border border-slate-800 bg-slate-950/60">
            <div className="border-b border-slate-800 px-3 py-2">
              <h2 className="text-sm font-semibold text-slate-100">{list.name}</h2>
            </div>
            <div className="space-y-2 px-3 py-3">
              {list.cards.map((card) => (
                <div key={card.id} className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
                  <p className="text-sm font-medium text-slate-100">{card.title}</p>
                  {card.description ? (
                    <p className="mt-1 text-xs text-slate-400">{card.description}</p>
                  ) : null}
                  {canEdit ? (
                    <form action={moveCard} className="mt-3 space-y-1">
                      <input type="hidden" name="cardId" value={card.id} readOnly />
                      <label className="text-[10px] uppercase tracking-wide text-slate-500">Move to</label>
                      <select
                        name="toListId"
                        className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-white"
                        defaultValue={list.id}
                      >
                        {board.lists.map((l) => (
                          <option key={l.id} value={l.id}>
                            {l.name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        className="mt-1 w-full rounded-md bg-sky-600 px-2 py-1 text-xs font-semibold text-white hover:bg-sky-500"
                      >
                        Move
                      </button>
                    </form>
                  ) : null}
                </div>
              ))}

              {canEdit ? (
                <form action={createCard} className="space-y-2 rounded-lg border border-dashed border-slate-700 p-2">
                  <input type="hidden" name="listId" value={list.id} readOnly />
                  <input
                    name="title"
                    placeholder="Card title"
                    className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-white"
                    required
                  />
                  <button
                    type="submit"
                    className="w-full rounded-md bg-slate-800 px-2 py-1 text-xs text-slate-100 hover:bg-slate-700"
                  >
                    Add card
                  </button>
                </form>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
