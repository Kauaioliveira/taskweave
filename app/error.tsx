"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ui } from "@/components/ui";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const forbidden = error.message === "Forbidden";

  return (
    <main className="mx-auto max-w-lg px-6 py-20 text-center text-slate-100">
      <h1 className="text-2xl font-semibold text-white">
        {forbidden ? "You don't have permission to do that" : "Something went wrong"}
      </h1>
      <p className="mt-3 text-sm text-slate-400">
        {forbidden
          ? "Your role in this workspace does not allow this action. Ask a workspace owner for access."
          : "An unexpected error happened. You can try again or go back to your workspaces."}
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <button type="button" onClick={reset} className={ui.btnLight}>
          Try again
        </button>
        <Link href="/workspaces" className={ui.btnGhost}>
          Your workspaces
        </Link>
      </div>
    </main>
  );
}
