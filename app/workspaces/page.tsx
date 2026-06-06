import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { signOutAction } from "@/app/actions/auth";
import { createWorkspace } from "@/app/actions/workspace";

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
    },
  });

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Workspaces</h1>
          <p className="text-sm text-slate-400">Signed in as {session.user.email ?? session.user.name}</p>
        </div>
        <form action={signOutAction}>
          <button
            type="submit"
            className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:border-slate-500"
          >
            Sign out
          </button>
        </form>
      </header>

      {sp.invite === "invalid" ? (
        <div className="mb-6 rounded-md border border-rose-900/60 bg-rose-950/40 p-3 text-sm text-rose-100">
          This invite link is invalid or already used.
        </div>
      ) : null}
      {sp.invite === "expired" ? (
        <div className="mb-6 rounded-md border border-amber-900/60 bg-amber-950/40 p-3 text-sm text-amber-100">
          This invite link expired.
        </div>
      ) : null}

      <section className="mb-10 rounded-xl border border-slate-800 bg-slate-950/40 p-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Create workspace</h2>
        <form action={createWorkspace} className="flex flex-wrap gap-2">
          <input
            name="name"
            placeholder="Workspace name"
            className="min-w-[220px] flex-1 rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
            required
          />
          <button
            type="submit"
            className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-sky-400"
          >
            Create
          </button>
        </form>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Your workspaces</h2>
        {workspaces.length === 0 ? (
          <p className="text-sm text-slate-400">No workspaces yet. Create one above.</p>
        ) : (
          <ul className="divide-y divide-slate-800 rounded-xl border border-slate-800 bg-slate-950/40">
            {workspaces.map((ws) => (
              <li key={ws.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div>
                  <Link href={`/workspaces/${ws.id}`} className="font-medium text-sky-300 hover:underline">
                    {ws.name}
                  </Link>
                  <p className="text-xs text-slate-500">
                    Role: {ws.memberships[0]?.role ?? "UNKNOWN"} · slug: {ws.slug}
                  </p>
                </div>
                <Link
                  href={`/workspaces/${ws.id}`}
                  className="rounded-md border border-slate-700 px-3 py-1 text-xs text-slate-200 hover:border-slate-500"
                >
                  Open
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
