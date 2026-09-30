export type DueStatus = "overdue" | "soon" | "later";

const SOON_WINDOW_MS = 48 * 60 * 60 * 1000;

/** Classifies a card due date relative to `now`: past due, due within 48h, or later. */
export function getDueStatus(dueAt: Date | string | null | undefined, now: Date = new Date()): DueStatus | null {
  if (dueAt == null) return null;
  const due = dueAt instanceof Date ? dueAt : new Date(dueAt);
  const time = due.getTime();
  if (Number.isNaN(time)) return null;
  const diff = time - now.getTime();
  if (diff < 0) return "overdue";
  if (diff <= SOON_WINDOW_MS) return "soon";
  return "later";
}
