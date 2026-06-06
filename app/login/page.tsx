import Link from "next/link";
import { auth } from "@/auth";
import { signInWithGithub, signInE2E } from "@/app/actions/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const params = await searchParams;
  const callbackUrl = params.callbackUrl ?? "/workspaces";
  const session = await auth();

  if (session) {
    return (
      <main className="mx-auto max-w-md px-6 py-16 text-slate-100">
        <p className="mb-4">You are already signed in.</p>
        <Link href="/workspaces" className="text-sky-300 hover:underline">
          Continue to workspaces
        </Link>
      </main>
    );
  }

  const showE2E = process.env.E2E_TEST === "1";

  return (
    <main className="mx-auto flex max-w-md flex-col gap-8 px-6 py-16">
      <div>
        <h1 className="text-2xl font-semibold text-white">Sign in</h1>
        <p className="mt-2 text-sm text-slate-400">Use GitHub OAuth in development/production.</p>
      </div>

      <form action={signInWithGithub} className="space-y-3">
        <input type="hidden" name="callbackUrl" value={callbackUrl} readOnly />
        <button
          type="submit"
          className="w-full rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-white"
        >
          Continue with GitHub
        </button>
      </form>

      {showE2E ? (
        <div className="rounded-lg border border-amber-900/60 bg-amber-950/30 p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-amber-200">
            E2E mode enabled (CI only)
          </p>
          <form action={signInE2E} className="space-y-2">
            <input type="hidden" name="callbackUrl" value={callbackUrl} readOnly />
            <input
              name="email"
              type="email"
              placeholder="e2e@test.com"
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
              defaultValue="e2e@test.com"
              required
            />
            <input
              name="password"
              type="password"
              placeholder="E2E password from env"
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
              required
            />
            <button
              type="submit"
              className="w-full rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-400"
            >
              Sign in (E2E credentials)
            </button>
          </form>
        </div>
      ) : null}
    </main>
  );
}
