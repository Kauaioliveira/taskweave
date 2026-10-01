import Link from "next/link";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2 font-semibold text-white">
      <span
        aria-hidden
        className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-sky-400 to-indigo-500 text-sm font-bold text-slate-950"
      >
        T
      </span>
      TaskWeave
    </Link>
  );
}
