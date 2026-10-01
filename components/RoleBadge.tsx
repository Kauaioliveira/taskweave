import type { WorkspaceRole } from "@prisma/client";
import { ROLE_DESCRIPTION, ROLE_LABEL } from "@/lib/roles";

const tone: Record<WorkspaceRole, string> = {
  OWNER: "border-sky-800/70 bg-sky-950/50 text-sky-200",
  MEMBER: "border-emerald-800/70 bg-emerald-950/40 text-emerald-200",
  VIEWER: "border-slate-700 bg-slate-900/60 text-slate-300",
};

export function RoleBadge({ role }: { role: WorkspaceRole }) {
  return (
    <span
      title={ROLE_DESCRIPTION[role]}
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${tone[role]}`}
    >
      {ROLE_LABEL[role]}
    </span>
  );
}
