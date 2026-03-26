import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { db } from "./db";
import bcrypt from "bcryptjs";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await db.user.findUnique({
          where: { email: parsed.data.email },
        });

        if (!user || !user.passwordHash) return null;

        const isValid = await bcrypt.compare(
          parsed.data.password,
          user.passwordHash
        );

        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
});

export async function getCurrentOrg(userId: string, orgSlug?: string) {
  if (orgSlug) {
    return db.organizationUser.findFirst({
      where: {
        userId,
        organization: { slug: orgSlug },
        isActive: true,
      },
      include: { organization: true },
    });
  }
  return db.organizationUser.findFirst({
    where: { userId, isActive: true },
    include: { organization: true },
    orderBy: { joinedAt: "desc" },
  });
}

export async function checkOrgPermission(
  userId: string,
  orgId: string,
  requiredRole?: string[]
) {
  const membership = await db.organizationUser.findFirst({
    where: { userId, organizationId: orgId, isActive: true },
  });

  if (!membership) return false;
  if (!requiredRole) return true;

  const roleHierarchy = ["VIEWER", "AGENT", "ACCOUNTANT", "MANAGER", "ADMIN", "OWNER"];
  const userRoleIndex = roleHierarchy.indexOf(membership.role);
  return requiredRole.some(
    (r) => roleHierarchy.indexOf(r) <= userRoleIndex
  );
}
