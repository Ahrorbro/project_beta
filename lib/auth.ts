import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prismaQuery as prisma } from "./prisma";

// Super Admin hardcoded credentials
const SUPER_ADMIN_EMAIL = "ahrorbek@rentify.com";
const SUPER_ADMIN_PASSWORD = "ahrorbek";

// Validate required environment variables
if (!process.env.NEXTAUTH_SECRET) {
  console.error('NEXTAUTH_SECRET is not set!');
  throw new Error('NEXTAUTH_SECRET environment variable is missing. Please set it in Vercel Settings → Environment Variables');
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        try {
          // Check for Super Admin
          if (
            credentials.email === SUPER_ADMIN_EMAIL &&
            credentials.password === SUPER_ADMIN_PASSWORD
          ) {
            // Check if Super Admin exists in database, create if not
            let superAdmin = await prisma.user.findUnique({
              where: { email: SUPER_ADMIN_EMAIL },
            });

            if (!superAdmin) {
              superAdmin = await prisma.user.create({
                data: {
                  email: SUPER_ADMIN_EMAIL,
                  password: await bcrypt.hash(SUPER_ADMIN_PASSWORD, 10),
                  role: "SUPER_ADMIN",
                  name: "Super Admin",
                },
              });
            }

            return {
              id: superAdmin.id,
              email: superAdmin.email,
              name: superAdmin.name,
              role: superAdmin.role,
            };
          }

          // Check for regular users (Landlords and Tenants)
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user) {
            throw new Error("Invalid email or password");
          }

          // Verify password
          const isValidPassword = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isValidPassword) {
            throw new Error("Invalid email or password");
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.error("Auth error:", error);
          // Provide more specific error messages
          const errorObj = error as { code?: string; message?: string };
          const errorMessage = error instanceof Error ? error.message : String(error);
          
          if (errorObj?.code === "P1001" || errorMessage.includes("connect") || errorMessage.includes("timeout")) {
            console.error("Database connection error details:", {
              code: errorObj?.code,
              message: errorMessage,
              DATABASE_URL: process.env.DATABASE_URL ? "Set" : "Missing"
            });
            throw new Error("Database connection failed. Please check your database configuration.");
          }
          if (errorObj?.code === "P2025") {
            throw new Error("Invalid email or password");
          }
          throw new Error(errorMessage || "Authentication failed. Please try again.");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// Helper function for API routes (NextAuth v4)
export async function getServerSession() {
  const { getServerSession: getSession } = await import("next-auth/next");
  return await getSession(authOptions);
}

// Export auth function for compatibility
export async function auth() {
  return await getServerSession();
}

