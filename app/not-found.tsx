import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-lg px-6 py-20 text-center text-slate-100">
      <h1 className="text-2xl font-semibold text-white">Not found</h1>
      <p className="mt-3 text-sm text-slate-400">The page you are looking for does not exist.</p>
      <Link href="/" className="mt-6 inline-block text-sky-300 hover:underline">
        Go home
      </Link>
    </main>
  );
}
