import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import { prisma } from "@/lib/prisma";

const providers: NextAuthConfig["providers"] = [
  GitHub({
    allowDangerousEmailAccountLinking: true,
  }),
];

if (process.env.E2E_TEST === "1") {
  providers.push(
    Credentials({
      id: "credentials",
      name: "E2E",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        const expected = process.env.E2E_PASSWORD;
        if (!email || !password || !expected || password !== expected) {
          return null;
        }
        const user = await prisma.user.findUnique({ where: { email } });
        return user;
      },
    }),
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "database" },
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  providers,
  callbacks: {
    session({ session, user }) {
      if (session.user && user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
});
