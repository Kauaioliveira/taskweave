import Link from "next/link";
import { auth } from "@/auth";
import { signOutAction } from "@/app/actions/auth";
import { Logo } from "@/components/Logo";
import { ui } from "@/components/ui";

export async function AppHeader() {
  const session = await auth();
  const user = session?.user;
  const displayName = user?.name ?? user?.email ?? "";

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Logo href="/workspaces" />
          <nav className="hidden text-sm sm:block">
            <Link href="/workspaces" className="text-slate-300 hover:text-white">
              Workspaces
            </Link>
          </nav>
        </div>
        {user ? (
          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-2 text-sm text-slate-300 sm:inline-flex" title={user.email ?? undefined}>
              {user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.image} alt="" className="h-7 w-7 rounded-full border border-slate-700" />
              ) : (
                <span aria-hidden className="grid h-7 w-7 place-items-center rounded-full bg-slate-800 text-xs font-semibold uppercase">
                  {displayName.slice(0, 1)}
                </span>
              )}
              <span className="max-w-[180px] truncate">{displayName}</span>
            </span>
            <form action={signOutAction}>
              <button type="submit" className={`${ui.btnGhost} py-1.5`}>
                Sign out
              </button>
            </form>
          </div>
        ) : null}
      </div>
    </header>
  );
}
