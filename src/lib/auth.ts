import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

const DEMO_MODE = process.env.DEMO_MODE === "true";

// In demo mode we skip the database entirely — used for Vercel previews.
async function buildFullAuth() {
  if (DEMO_MODE) {
    return NextAuth({
      session: { strategy: "jwt" },
      pages: { signIn: "/login", error: "/login" },
      providers: [
        Credentials({
          name: "credentials",
          credentials: {
            email: { label: "Email", type: "email" },
            password: { label: "Password", type: "password" },
          },
          async authorize(credentials) {
            // Accept any login in demo mode
            if (!credentials?.email) return null;
            return {
              id: "demo-user",
              email: String(credentials.email),
              name: "Demo User",
              image: null,
              role: "OWNER",
            };
          },
        }),
      ],
      callbacks: {
        async jwt({ token, user }) {
          if (user) { token.id = user.id; token.role = (user as any).role; }
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
  }

  // Production: full Prisma-backed auth
  const { PrismaAdapter } = await import("@auth/prisma-adapter");
  const { db } = await import("./db");
  const bcrypt = (await import("bcryptjs")).default;
  const { z } = await import("zod");

  const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
  });

  return NextAuth({
    adapter: PrismaAdapter(db),
    session: { strategy: "jwt" },
    pages: { signIn: "/login", error: "/login" },
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

          const isValid = await bcrypt.compare(parsed.data.password, user.passwordHash);
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
        if (user) { token.id = user.id; token.role = (user as any).role; }
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
}

const authInstance = buildFullAuth();

export const handlers = {
  GET: async (req: any) => (await authInstance).handlers.GET(req),
  POST: async (req: any) => (await authInstance).handlers.POST(req),
};

export const auth = async (...args: any[]) => {
  const instance = await authInstance;
  return (instance.auth as any)(...args);
};

export const signIn = async (...args: any[]) => {
  const instance = await authInstance;
  return (instance.signIn as any)(...args);
};

export const signOut = async (...args: any[]) => {
  const instance = await authInstance;
  return (instance.signOut as any)(...args);
};

export async function getCurrentOrg(userId: string, orgSlug?: string) {
  if (DEMO_MODE) {
    return {
      organization: {
        id: "demo-org",
        name: "Kamau Properties",
        slug: "kamau-properties",
        subscriptionStatus: "ACTIVE",
        subscriptionPlan: "PROFESSIONAL",
      },
    } as any;
  }
  const { db } = await import("./db");
  if (orgSlug) {
    return db.organizationUser.findFirst({
      where: { userId, organization: { slug: orgSlug }, isActive: true },
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
  if (DEMO_MODE) return true;
  const { db } = await import("./db");
  const membership = await db.organizationUser.findFirst({
    where: { userId, organizationId: orgId, isActive: true },
  });
  if (!membership) return false;
  if (!requiredRole) return true;
  const roleHierarchy = ["VIEWER", "AGENT", "ACCOUNTANT", "MANAGER", "ADMIN", "OWNER"];
  const userRoleIndex = roleHierarchy.indexOf(membership.role);
  return requiredRole.some((r) => roleHierarchy.indexOf(r) <= userRoleIndex);
}
