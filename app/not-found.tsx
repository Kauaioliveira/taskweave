import Link from "next/link";
import { ui } from "@/components/ui";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-lg px-6 py-20 text-center text-slate-100">
      <p className="text-sm font-semibold text-sky-300">404</p>
      <h1 className="mt-2 text-2xl font-semibold text-white">Not found</h1>
      <p className="mt-3 text-sm text-slate-400">
        The page you are looking for does not exist, or you are not a member of this workspace.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Link href="/workspaces" className={ui.btnLight}>
          Your workspaces
        </Link>
        <Link href="/" className={ui.btnGhost}>
          Home
        </Link>
      </div>
    </main>
  );
}
