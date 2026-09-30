import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createWorkspace } from "@/app/actions/workspace";
import { RoleBadge } from "@/components/RoleBadge";
import { SubmitButton } from "@/components/SubmitButton";
import { ui } from "@/components/ui";
import { formatRelativeTime } from "@/lib/relative-time";

export const metadata: Metadata = { title: "Workspaces" };

function plural(n: number, word: string) {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

export default async function WorkspacesPage({
  searchParams,
}: {
  searchParams: Promise<{ invite?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  const sp = await searchParams;

  const workspaces = await prisma.workspace.findMany({
    where: { memberships: { some: { userId: session.user.id } } },
    orderBy: { updatedAt: "desc" },
    include: {
      memberships: { where: { userId: session.user.id }, take: 1 },
      _count: { select: { boards: true, memberships: true } },
    },
  });

  return (
    <main id="main" className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Workspaces</h1>
          <p className="mt-1 text-sm text-slate-400">Signed in as {session.user.email ?? session.user.name}</p>
        </div>
      </div>

      {sp.invite === "invalid" ? (
        <div role="alert" className="mb-6 rounded-md border border-rose-900/60 bg-rose-950/40 p-3 text-sm text-rose-100">
          This invite link is invalid or already used.
        </div>
      ) : null}
      {sp.invite === "expired" ? (
        <div role="alert" className="mb-6 rounded-md border border-amber-900/60 bg-amber-950/40 p-3 text-sm text-amber-100">
          This invite link expired. Ask the workspace owner for a new one.
        </div>
      ) : null}

      <section className={`mb-10 ${ui.panel}`}>
        <h2 className={`mb-3 ${ui.sectionTitle}`}>New workspace</h2>
        <form action={createWorkspace} className="flex flex-wrap gap-2">
          <input
            name="name"
            aria-label="Workspace name"
            placeholder="Workspace name"
            maxLength={80}
            className={`${ui.input} min-w-[220px] flex-1`}
            required
          />
          <SubmitButton className={ui.btnPrimary} pendingLabel="Creating…">
            Create workspace
          </SubmitButton>
        </form>
      </section>

      <section className="space-y-3">
        <h2 className={ui.sectionTitle}>Your workspaces</h2>
        {workspaces.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-700 p-10 text-center">
            <p className="font-medium text-slate-200">No workspaces yet</p>
            <p className="mt-1 text-sm text-slate-400">
              Create one above, or open an invite link a teammate sent you.
            </p>
          </div>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {workspaces.map((ws) => {
              const role = ws.memberships[0]?.role;
              return (
                <li key={ws.id}>
                  <Link
                    href={`/workspaces/${ws.id}`}
                    className="group block h-full rounded-xl border border-slate-800 bg-slate-950/40 p-5 transition hover:border-sky-800 hover:bg-slate-900/50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-lg font-medium text-white group-hover:text-sky-200">{ws.name}</span>
                      {role ? <RoleBadge role={role} /> : null}
                    </div>
                    <p className="mt-3 text-sm text-slate-400">
                      {plural(ws._count.boards, "board")} · {plural(ws._count.memberships, "member")}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">Updated {formatRelativeTime(ws.updatedAt)}</p>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
