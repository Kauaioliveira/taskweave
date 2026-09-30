import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { signInWithGithub, signInE2E } from "@/app/actions/auth";
import { GitHubIcon } from "@/components/GitHubIcon";
import { Logo } from "@/components/Logo";
import { SubmitButton } from "@/components/SubmitButton";
import { ui } from "@/components/ui";

export const metadata: Metadata = { title: "Sign in" };

/** Only same-origin relative paths are accepted as a post-login destination. */
function safeCallbackUrl(raw: string | undefined): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/workspaces";
  return raw;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const params = await searchParams;
  const callbackUrl = safeCallbackUrl(params.callbackUrl);
  const session = await auth();
  const showE2E = process.env.E2E_TEST === "1";

  return (
    <div className="flex min-h-screen flex-col items-center px-6 py-10">
      <Logo />
      <main id="main" className="mt-12 w-full max-w-sm">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-8 shadow-xl shadow-black/20">
          {session ? (
            <>
              <h1 className="text-xl font-semibold text-white">You are already signed in</h1>
              <p className="mt-2 text-sm text-slate-400">Signed in as {session.user?.email ?? session.user?.name}.</p>
              <Link href={callbackUrl} className={`${ui.btnPrimary} mt-6 w-full`}>
                Continue
              </Link>
            </>
          ) : (
            <>
              <h1 className="text-xl font-semibold text-white">Sign in</h1>
              <p className="mt-2 text-sm text-slate-400">Use your GitHub account to access your workspaces.</p>

              <form action={signInWithGithub} className="mt-6">
                <input type="hidden" name="callbackUrl" value={callbackUrl} readOnly />
                <SubmitButton className={`${ui.btnLight} w-full`} pendingLabel="Redirecting to GitHub…">
                  <GitHubIcon />
                  Continue with GitHub
                </SubmitButton>
              </form>
            </>
          )}
        </div>

        {showE2E && !session ? (
          <div className="mt-6 rounded-lg border border-amber-900/60 bg-amber-950/30 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-amber-200">E2E mode enabled (CI only)</p>
            <form action={signInE2E} className="space-y-2">
              <input type="hidden" name="callbackUrl" value={callbackUrl} readOnly />
              <input
                name="email"
                type="email"
                aria-label="E2E email"
                placeholder="e2e@test.com"
                className={ui.input}
                defaultValue="e2e@test.com"
                required
              />
              <input
                name="password"
                type="password"
                aria-label="E2E password"
                placeholder="E2E password from env"
                className={ui.input}
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

        <p className="mt-6 text-center text-sm">
          <Link href="/" className="text-slate-400 hover:text-white">
            ← Back to home
          </Link>
        </p>
      </main>
    </div>
  );
}
