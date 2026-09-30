/** Shared Tailwind class strings so buttons and inputs look the same on every page. */
export const ui = {
  btnPrimary:
    "inline-flex items-center justify-center gap-2 rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60",
  btnLight:
    "inline-flex items-center justify-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60",
  btnGhost:
    "inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200 transition hover:border-slate-500 hover:bg-slate-800/40 disabled:cursor-not-allowed disabled:opacity-60",
  btnDanger:
    "inline-flex items-center justify-center gap-2 rounded-lg border border-rose-900/60 px-3 py-2 text-sm font-semibold text-rose-200 transition hover:bg-rose-950/50 disabled:cursor-not-allowed disabled:opacity-60",
  input:
    "w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-slate-500 transition focus:border-sky-600",
  panel: "rounded-xl border border-slate-800 bg-slate-950/40 p-6",
  sectionTitle: "text-sm font-semibold uppercase tracking-wide text-slate-400",
  label: "mb-1 block text-xs font-medium text-slate-400",
} as const;
