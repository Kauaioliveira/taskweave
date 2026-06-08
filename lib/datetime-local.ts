/** `datetime-local` value in the user's local timezone (for `defaultValue` / `value`). */
export function isoToDatetimeLocalValue(value: string | Date | null | undefined): string {
  if (value == null || value === "") return "";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "";

  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
