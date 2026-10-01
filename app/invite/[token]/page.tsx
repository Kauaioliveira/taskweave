import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ROLE_DESCRIPTION } from "@/lib/roles";
import { acceptWorkspaceInvite } from "@/app/actions/invite";
import { signOutAction } from "@/app/actions/auth";
import { Logo } from "@/components/Logo";
import { RoleBadge } from "@/components/RoleBadge";
import { SubmitButton } from "@/components/SubmitButton";
import { ui } from "@/components/ui";

export const metadata: Metadata = { title: "Workspace invite" };

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

  const used = invite.usedAt != null;
  const expired = !used && invite.expiresAt.getTime() < Date.now();

  return (
    <div className="flex min-h-screen flex-col items-center px-6 py-10">
      <Logo />
      <main id="main" className="mt-12 w-full max-w-md">
        <div className="space-y-6 rounded-2xl border border-slate-800 bg-slate-950/60 p-8 text-slate-100 shadow-xl shadow-black/20">
          <div>
            <h1 className="text-2xl font-semibold text-white">Workspace invite</h1>
            <p className="mt-3 text-sm text-slate-300">
              You were invited to <span className="font-semibold text-white">{invite.workspace.name}</span> as{" "}
              <RoleBadge role={invite.role} />
            </p>
            <p className="mt-1 text-xs text-slate-500">{ROLE_DESCRIPTION[invite.role]}</p>
            <p className="mt-3 text-sm text-slate-400">
              Invited email: <span className="text-slate-200">{invite.email}</span>
            </p>
          </div>

          {sp.invite === "wrong-email" ? (
            <div role="alert" className="rounded-md border border-rose-900/60 bg-rose-950/40 p-3 text-sm text-rose-100">
              Your signed-in account email does not match this invite. Sign in with the invited email.
            </div>
          ) : null}

          {used ? (
            <div className="rounded-md border border-slate-700 bg-slate-900/60 p-3 text-sm text-slate-300">
              This invite was already used.
            </div>
          ) : expired ? (
            <div className="rounded-md border border-amber-900/60 bg-amber-950/40 p-3 text-sm text-amber-100">
              This invite expired. Ask a workspace owner for a new link.
            </div>
          ) : !session ? (
            <Link
              href={`/login?callbackUrl=${encodeURIComponent(`/invite/${token}`)}`}
              className={`${ui.btnPrimary} w-full`}
            >
              Sign in to accept
            </Link>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                Signed in as <span className="text-slate-300">{session.user?.email ?? session.user?.name}</span>
              </p>
              <form action={acceptWorkspaceInvite}>
                <input type="hidden" name="token" value={token} readOnly />
                <SubmitButton
                  className="inline-flex w-full items-center justify-center rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
                  pendingLabel="Joining…"
                >
                  Accept invite
                </SubmitButton>
              </form>
              {sp.invite === "wrong-email" ? (
                <form action={signOutAction}>
                  <button type="submit" className={`${ui.btnGhost} w-full`}>
                    Sign out and use another account
                  </button>
                </form>
              ) : null}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
