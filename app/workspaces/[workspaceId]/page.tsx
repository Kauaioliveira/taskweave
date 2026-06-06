import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { roleMeetsMinimum, minimumRoleForBoardEdit, minimumRoleForInvite } from "@/lib/rbac";
import { deleteWorkspace, createBoard } from "@/app/actions/workspace";
import { createWorkspaceInvite } from "@/app/actions/invite";

export default async function WorkspaceDetailPage({ params }: { params: Promise<{ workspaceId: string }> }) {
  const { workspaceId } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  const workspace = await prisma.workspace.findFirst({
    where: {
      id: workspaceId,
      memberships: { some: { userId: session.user.id } },
    },
    include: {
      boards: { orderBy: { updatedAt: "desc" } },
      memberships: { where: { userId: session.user.id }, take: 1 },
      invites: {
        where: { usedAt: null },
        orderBy: { expiresAt: "asc" },
        take: 10,
      },
    },
  });

  if (!workspace) {
    notFound();
  }

  const role = workspace.memberships[0]?.role ?? "VIEWER";
  const canEditBoards = roleMeetsMinimum(role, minimumRoleForBoardEdit());
  const canInvite = roleMeetsMinimum(role, minimumRoleForInvite());

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-6 text-sm text-slate-400">
        <Link href="/workspaces" className="text-sky-300 hover:underline">
          Workspaces
        </Link>{" "}
        / <span className="text-slate-200">{workspace.name}</span>
      </div>

      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">{workspace.name}</h1>
          <p className="mt-1 text-sm text-slate-400">
            Your role: <span className="text-slate-200">{role}</span>
          </p>
        </div>
        {role === "OWNER" ? (
          <form action={deleteWorkspace}>
            <input type="hidden" name="workspaceId" value={workspace.id} readOnly />
            <button
              type="submit"
              className="rounded-lg border border-rose-900/60 px-3 py-2 text-xs font-semibold text-rose-200 hover:bg-rose-950/40"
            >
              Delete workspace
            </button>
          </form>
        ) : null}
      </header>

      {canInvite ? (
        <section className="mb-10 rounded-xl border border-slate-800 bg-slate-950/40 p-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Invite member</h2>
          <form action={createWorkspaceInvite} className="grid gap-2 md:grid-cols-[1fr_160px_auto] md:items-end">
            <input type="hidden" name="workspaceId" value={workspace.id} readOnly />
            <div>
              <label className="mb-1 block text-xs text-slate-500">Email</label>
              <input
                name="email"
                type="email"
                required
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
                placeholder="teammate@company.com"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-500">Role</label>
              <select
                name="role"
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
                defaultValue="MEMBER"
              >
                <option value="VIEWER">VIEWER</option>
                <option value="MEMBER">MEMBER</option>
                <option value="OWNER">OWNER</option>
              </select>
            </div>
            <button
              type="submit"
              className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-white"
            >
              Create invite
            </button>
          </form>
          <p className="mt-3 text-xs text-slate-500">
            Share the generated link from pending invites (copy URL manually for MVP):{" "}
            <span className="text-slate-300">/invite/&lt;token&gt;</span>
          </p>
          {workspace.invites.length > 0 ? (
            <ul className="mt-4 space-y-2 text-sm text-slate-300">
              {workspace.invites.map((inv) => (
                <li key={inv.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-slate-800 bg-slate-950/60 px-3 py-2">
                  <span>
                    {inv.email} · {inv.role}
                  </span>
                  <Link className="text-sky-300 hover:underline" href={`/invite/${inv.token}`}>
                    Open invite
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      ) : null}

      <section className="mb-8 rounded-xl border border-slate-800 bg-slate-950/40 p-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Boards</h2>
        {canEditBoards ? (
          <form action={createBoard} className="mb-6 flex flex-wrap gap-2">
            <input type="hidden" name="workspaceId" value={workspace.id} readOnly />
            <input
              name="name"
              placeholder="New board name"
              className="min-w-[220px] flex-1 rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
              required
            />
            <button
              type="submit"
              className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-sky-400"
            >
              Create board
            </button>
          </form>
        ) : (
          <p className="mb-4 text-sm text-slate-500">You have read-only access in this workspace.</p>
        )}

        {workspace.boards.length === 0 ? (
          <p className="text-sm text-slate-500">No boards yet.</p>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {workspace.boards.map((b) => (
              <li key={b.id} className="rounded-lg border border-slate-800 bg-slate-950/60 p-4">
                <Link href={`/workspaces/${workspace.id}/boards/${b.id}`} className="text-lg font-medium text-sky-300 hover:underline">
                  {b.name}
                </Link>
                <p className="mt-1 text-xs text-slate-500">Updated {b.updatedAt.toISOString().slice(0, 10)}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
