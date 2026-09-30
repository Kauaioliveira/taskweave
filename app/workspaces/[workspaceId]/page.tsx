import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { roleMeetsMinimum, minimumRoleForBoardEdit, minimumRoleForInvite } from "@/lib/rbac";
import { ROLE_DESCRIPTION, ROLE_LABEL } from "@/lib/roles";
import { formatRelativeTime } from "@/lib/relative-time";
import { deleteWorkspace, createBoard } from "@/app/actions/workspace";
import { createWorkspaceInvite, revokeWorkspaceInvite } from "@/app/actions/invite";
import { CopyLinkButton } from "@/components/CopyButton";
import { RoleBadge } from "@/components/RoleBadge";
import { SubmitButton } from "@/components/SubmitButton";
import { ui } from "@/components/ui";

export const metadata: Metadata = { title: "Workspace" };

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
      boards: {
        orderBy: { updatedAt: "desc" },
        include: { lists: { select: { _count: { select: { cards: true } } } } },
      },
      memberships: {
        orderBy: { createdAt: "asc" },
        include: { user: { select: { id: true, name: true, email: true, image: true } } },
      },
      invites: {
        where: { usedAt: null },
        orderBy: { expiresAt: "asc" },
        take: 20,
      },
    },
  });

  if (!workspace) {
    notFound();
  }

  const role = workspace.memberships.find((m) => m.userId === session.user.id)?.role ?? "VIEWER";
  const canEditBoards = roleMeetsMinimum(role, minimumRoleForBoardEdit());
  const canInvite = roleMeetsMinimum(role, minimumRoleForInvite());
  const now = new Date();

  return (
    <main id="main" className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-slate-400">
        <Link href="/workspaces" className="text-sky-300 hover:underline">
          Workspaces
        </Link>{" "}
        / <span className="text-slate-200">{workspace.name}</span>
      </nav>

      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-white">{workspace.name}</h1>
        <p className="mt-2 text-sm text-slate-400">
          Your role: <span className="text-slate-200">{ROLE_LABEL[role]}</span>{" "}
          <span className="text-slate-500">· {ROLE_DESCRIPTION[role]}</span>
        </p>
      </header>

      <div className="grid items-start gap-8 lg:grid-cols-[1fr_320px]">
        <section className={ui.panel} aria-labelledby="boards-heading">
          <h2 id="boards-heading" className={`mb-4 ${ui.sectionTitle}`}>
            Boards
          </h2>
          {canEditBoards ? (
            <form action={createBoard} className="mb-6 flex flex-wrap gap-2">
              <input type="hidden" name="workspaceId" value={workspace.id} readOnly />
              <input
                name="name"
                aria-label="New board name"
                placeholder="New board name"
                maxLength={80}
                className={`${ui.input} min-w-[200px] flex-1`}
                required
              />
              <SubmitButton className={ui.btnPrimary} pendingLabel="Creating…">
                Create board
              </SubmitButton>
            </form>
          ) : (
            <p className="mb-4 text-sm text-slate-500">You have read-only access in this workspace.</p>
          )}

          {workspace.boards.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-700 p-8 text-center text-sm text-slate-400">
              {canEditBoards
                ? "No boards yet. New boards start with To do, Doing, and Done columns."
                : "No boards yet."}
            </div>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {workspace.boards.map((b) => {
                const cardCount = b.lists.reduce((sum, l) => sum + l._count.cards, 0);
                return (
                  <li key={b.id}>
                    <Link
                      href={`/workspaces/${workspace.id}/boards/${b.id}`}
                      className="group block h-full rounded-lg border border-slate-800 bg-slate-950/60 p-4 transition hover:border-sky-800 hover:bg-slate-900/50"
                    >
                      <span className="text-base font-medium text-white group-hover:text-sky-200">{b.name}</span>
                      <p className="mt-2 text-xs text-slate-400">
                        {b.lists.length} {b.lists.length === 1 ? "list" : "lists"} · {cardCount}{" "}
                        {cardCount === 1 ? "card" : "cards"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">Updated {formatRelativeTime(b.updatedAt, now)}</p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <aside className="space-y-8">
          <section className={ui.panel} aria-labelledby="members-heading">
            <h2 id="members-heading" className={`mb-4 ${ui.sectionTitle}`}>
              Members ({workspace.memberships.length})
            </h2>
            <ul className="space-y-3">
              {workspace.memberships.map((m) => {
                const label = m.user.name ?? m.user.email ?? "Unknown user";
                return (
                  <li key={m.id} className="flex items-center justify-between gap-3">
                    <span className="flex min-w-0 items-center gap-2">
                      {m.user.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={m.user.image} alt="" className="h-7 w-7 shrink-0 rounded-full border border-slate-700" />
                      ) : (
                        <span
                          aria-hidden
                          className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-slate-800 text-xs font-semibold uppercase text-slate-200"
                        >
                          {label.slice(0, 1)}
                        </span>
                      )}
                      <span className="min-w-0">
                        <span className="block truncate text-sm text-slate-200">
                          {label}
                          {m.userId === session.user.id ? <span className="text-slate-500"> (you)</span> : null}
                        </span>
                        {m.user.name && m.user.email ? (
                          <span className="block truncate text-xs text-slate-500">{m.user.email}</span>
                        ) : null}
                      </span>
                    </span>
                    <RoleBadge role={m.role} />
                  </li>
                );
              })}
            </ul>
          </section>

          {canInvite ? (
            <section className={ui.panel} aria-labelledby="invite-heading">
              <h2 id="invite-heading" className={`mb-4 ${ui.sectionTitle}`}>
                Invite member
              </h2>
              <form action={createWorkspaceInvite} className="space-y-3">
                <input type="hidden" name="workspaceId" value={workspace.id} readOnly />
                <div>
                  <label htmlFor="invite-email" className={ui.label}>
                    Email
                  </label>
                  <input
                    id="invite-email"
                    name="email"
                    type="email"
                    required
                    className={ui.input}
                    placeholder="teammate@company.com"
                  />
                </div>
                <div>
                  <label htmlFor="invite-role" className={ui.label}>
                    Role
                  </label>
                  <select id="invite-role" name="role" className={ui.input} defaultValue="MEMBER">
                    <option value="VIEWER">Viewer (read-only)</option>
                    <option value="MEMBER">Member (edit boards)</option>
                    <option value="OWNER">Owner (full control)</option>
                  </select>
                </div>
                <SubmitButton className={`${ui.btnLight} w-full`} pendingLabel="Creating invite…">
                  Create invite
                </SubmitButton>
              </form>
              <p className="mt-3 text-xs text-slate-500">
                Only the invited email can accept. Links expire after 7 days. When email delivery is configured, the
                link is also sent by email.
              </p>

              <h3 className="mb-2 mt-6 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Pending invites
              </h3>
              {workspace.invites.length === 0 ? (
                <p className="text-sm text-slate-500">No pending invites.</p>
              ) : (
                <ul className="space-y-2 text-sm text-slate-300">
                  {workspace.invites.map((inv) => {
                    const expired = inv.expiresAt.getTime() < now.getTime();
                    return (
                      <li key={inv.id} className="rounded-md border border-slate-800 bg-slate-950/60 px-3 py-2">
                        <div className="flex items-start justify-between gap-2">
                          <span className="min-w-0 truncate" title={inv.email}>
                            {inv.email}
                          </span>
                          <RoleBadge role={inv.role} />
                        </div>
                        <p className={`mt-1 text-xs ${expired ? "text-amber-300" : "text-slate-500"}`}>
                          {expired ? "Expired" : "Expires"} {formatRelativeTime(inv.expiresAt, now)}
                        </p>
                        <div className="mt-2 flex items-center gap-3 text-xs">
                          {!expired ? (
                            <CopyLinkButton
                              path={`/invite/${inv.token}`}
                              className="font-semibold text-sky-300 hover:text-sky-200"
                            />
                          ) : null}
                          <form action={revokeWorkspaceInvite}>
                            <input type="hidden" name="inviteId" value={inv.id} readOnly />
                            <SubmitButton
                              className="font-semibold text-rose-300 hover:text-rose-200"
                              pendingLabel="Revoking…"
                              confirmMessage={`Revoke the invite for ${inv.email}?`}
                            >
                              {expired ? "Remove" : "Revoke"}
                            </SubmitButton>
                          </form>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          ) : null}

          {role === "OWNER" ? (
            <section className="rounded-xl border border-rose-950 bg-rose-950/10 p-6" aria-labelledby="danger-heading">
              <h2 id="danger-heading" className="mb-2 text-sm font-semibold uppercase tracking-wide text-rose-300">
                Danger zone
              </h2>
              <p className="mb-4 text-xs text-slate-400">
                Deleting the workspace removes all of its boards, cards, members, and invites. This cannot be undone.
              </p>
              <form action={deleteWorkspace}>
                <input type="hidden" name="workspaceId" value={workspace.id} readOnly />
                <SubmitButton
                  className={`${ui.btnDanger} w-full`}
                  pendingLabel="Deleting…"
                  confirmMessage={`Delete "${workspace.name}" and everything in it? This cannot be undone.`}
                >
                  Delete workspace
                </SubmitButton>
              </form>
            </section>
          ) : null}
        </aside>
      </div>
    </main>
  );
}
