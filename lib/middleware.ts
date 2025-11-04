import { auth } from "./auth";
import { redirect } from "next/navigation";
import type { UserRole } from "./types";

export async function requireAuth() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/auth/login");
  }
  
  return session;
}

export async function requireRole(role: UserRole | UserRole[]) {
  const session = await requireAuth();
  const allowedRoles = Array.isArray(role) ? role : [role];
  
  if (!session.user || !allowedRoles.includes(session.user.role as UserRole)) {
    redirect("/unauthorized");
  }
  
  return session;
}

export async function getSession() {
  return await auth();
}

