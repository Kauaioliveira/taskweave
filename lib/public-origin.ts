/**
 * Public site origin for absolute URLs (invite links, emails).
 * Prefer AUTH_URL; fall back to Vercel or NEXT_PUBLIC_APP_URL.
 */
export function getPublicOrigin(): string | null {
  const auth = process.env.AUTH_URL?.trim();
  if (auth) return auth.replace(/\/$/, "");

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/^https?:\/\//, "")}`;

  const nextPublic = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (nextPublic) return nextPublic.replace(/\/$/, "");

  return null;
}
