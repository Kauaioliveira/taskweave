import type { NextAuthConfig } from "next-auth";
import GitHub from "next-auth/providers/github";

/**
 * Edge-safe Auth.js config: only providers/callbacks needed to check a
 * session in `middleware.ts`. No Prisma adapter and no Node-only imports
 * here — that's what keeps the middleware Edge Function under Vercel's
 * size limit. The full config (adapter, Credentials/E2E provider) lives
 * in `auth.ts` and is only used by API routes / server actions (Node
 * runtime, no size limit issue).
 */
export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  providers: [
    GitHub({
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) {
        token.sub = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
};
