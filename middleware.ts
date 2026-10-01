import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

// Uses the lightweight, Edge-safe config (no Prisma adapter) so this
// middleware's Edge Function bundle stays well under Vercel's size limit.
const { auth } = NextAuth(authConfig);

const publicPaths = new Set(["/", "/login"]);

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // API routes check the session themselves and answer 401 JSON; a redirect to /login would hide that.
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/invite")) {
    return NextResponse.next();
  }

  if (publicPaths.has(pathname)) {
    return NextResponse.next();
  }

  if (!req.auth) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
