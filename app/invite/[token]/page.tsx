import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { acceptWorkspaceInvite } from "@/app/actions/invite";

export default async function InvitePage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ invite?: string }>;
}) {
  const { token } = await params;
  const sp = await searchParams;
  const session = await auth();

  const invite = await prisma.workspaceInvite.findUnique({
    where: { token },
    include: { workspace: true },
  });

  if (!invite) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-lg space-y-6 px-6 py-16 text-slate-100">
      <div>
        <h1 className="text-2xl font-semibold text-white">Workspace invite</h1>
        <p className="mt-2 text-sm text-slate-400">
          You were invited to <span className="font-semibold text-slate-200">{invite.workspace.name}</span>{" "}
          as <span className="font-semibold text-slate-200">{invite.role}</span>.
        </p>
        <p className="mt-2 text-sm text-slate-400">
          Invited email: <span className="text-slate-200">{invite.email}</span>
        </p>
      </div>

      {sp.invite === "wrong-email" ? (
        <div className="rounded-md border border-rose-900/60 bg-rose-950/40 p-3 text-sm text-rose-100">
          Your signed-in account email does not match this invite. Sign in with the invited email.
        </div>
      ) : null}

      {!session ? (
        <Link
          href={`/login?callbackUrl=${encodeURIComponent(`/invite/${token}`)}`}
          className="inline-flex rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-sky-400"
        >
          Sign in to accept
        </Link>
      ) : (
        <form action={acceptWorkspaceInvite} className="space-y-3">
          <input type="hidden" name="token" value={token} readOnly />
          <button
            type="submit"
            className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
          >
            Accept invite
          </button>
        </form>
      )}
    </main>
  );
}
