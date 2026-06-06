import Link from "next/link";
import { auth } from "@/auth";
import { signInWithGithub } from "@/app/actions/auth";

export default async function HomePage() {
  const session = await auth();

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-10 px-6 py-16">
      <header className="space-y-4">
        <p className="text-sm font-medium text-sky-300">Portfolio / learning project</p>
        <h1 className="text-4xl font-semibold tracking-tight text-white">TaskWeave</h1>
        <p className="max-w-2xl text-lg text-slate-300">
          Multi-workspace Kanban boards with role-based access control (Owner / Member / Viewer) and
          invite links. Built with Next.js, Auth.js, Prisma, and PostgreSQL.
        </p>
      </header>

      <div className="flex flex-wrap gap-3">
        {session ? (
          <Link
            href="/workspaces"
            className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-sky-400"
          >
            Go to workspaces
          </Link>
        ) : (
          <form action={signInWithGithub}>
            <button
              type="submit"
              className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-white"
            >
              Continue with GitHub
            </button>
          </form>
        )}
        <Link
          href="https://github.com/your-username/taskweave"
          className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:border-slate-500"
        >
          View on GitHub
        </Link>
      </div>

      <section className="grid gap-4 rounded-xl border border-slate-800 bg-slate-950/40 p-6 text-slate-200">
        <h2 className="text-lg font-semibold text-white">What recruiters can verify here</h2>
        <ul className="list-disc space-y-2 pl-5 text-slate-300">
          <li>App Router structure, server actions, and typed data access with Prisma</li>
          <li>OAuth (GitHub) with database sessions via Auth.js</li>
          <li>Multi-tenant workspaces with memberships and RBAC checks in mutations</li>
          <li>Docker Compose for local PostgreSQL and CI-friendly workflows</li>
        </ul>
      </section>
    </main>
  );
}
