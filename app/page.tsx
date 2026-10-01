import Link from "next/link";
import { auth } from "@/auth";
import { signInWithGithub } from "@/app/actions/auth";
import { GitHubIcon } from "@/components/GitHubIcon";
import { Logo } from "@/components/Logo";
import { ui } from "@/components/ui";

const REPO_URL = "https://github.com/Kauaioliveira/taskweave";

const features = [
  {
    title: "Workspaces for every team",
    body: "Keep projects apart. Each workspace has its own boards, members, and invites.",
  },
  {
    title: "Kanban that stays out of the way",
    body: "Drag cards between columns with the mouse or the keyboard, reorder within a list, and set due dates.",
  },
  {
    title: "Roles that are enforced on the server",
    body: "Owners manage the workspace, Members edit boards, Viewers read. Every mutation checks the role.",
  },
  {
    title: "Invites scoped to an email",
    body: "Share a link that only the invited email can accept. Links expire after 7 days and can be revoked.",
  },
];

export default async function HomePage() {
  const session = await auth();

  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <Logo />
        {session ? (
          <Link href="/workspaces" className="text-sm text-slate-300 hover:text-white">
            Your workspaces →
          </Link>
        ) : (
          <Link href="/login" className="text-sm text-slate-300 hover:text-white">
            Sign in
          </Link>
        )}
      </header>

      <main id="main" className="mx-auto flex max-w-5xl flex-col gap-16 px-6 pb-20 pt-10">
        <section className="max-w-3xl space-y-6">
          <p className="inline-flex rounded-full border border-sky-900/70 bg-sky-950/40 px-3 py-1 text-xs font-medium text-sky-200">
            Open source · Next.js · Auth.js · Prisma · PostgreSQL
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Organize team work in Kanban boards, with the right access for each person.
          </h1>
          <p className="max-w-2xl text-lg text-slate-300">
            TaskWeave gives every team a workspace with boards, role-based access (Owner, Member, Viewer), and
            email-scoped invite links.
          </p>
          <div className="flex flex-wrap gap-3">
            {session ? (
              <Link href="/workspaces" className={ui.btnPrimary}>
                Go to workspaces
              </Link>
            ) : (
              <form action={signInWithGithub}>
                <button type="submit" className={ui.btnLight}>
                  <GitHubIcon />
                  Continue with GitHub
                </button>
              </form>
            )}
            <a href={REPO_URL} target="_blank" rel="noreferrer" className={ui.btnGhost}>
              View on GitHub
            </a>
          </div>
        </section>

        <section aria-labelledby="features" className="space-y-6">
          <h2 id="features" className={ui.sectionTitle}>
            What you get
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2">
            {features.map((f) => (
              <li key={f.title} className="rounded-xl border border-slate-800 bg-slate-950/40 p-5">
                <h3 className="font-semibold text-white">{f.title}</h3>
                <p className="mt-2 text-sm text-slate-400">{f.body}</p>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        TaskWeave is a portfolio project, MIT licensed.{" "}
        <a href={REPO_URL} className="text-slate-300 hover:underline">
          Source on GitHub
        </a>
      </footer>
    </div>
  );
}
