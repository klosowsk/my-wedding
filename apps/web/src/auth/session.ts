import { headers } from "next/headers";
import { auth } from "./index";
import { isSuperAdminEmail } from "./super-admin";

export async function getSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
}

/**
 * Require an authenticated admin session.
 * Any registered user is an admin — the registration hook already
 * guarantees only config-allowlisted or invited emails can sign up.
 */
export async function requireAdmin() {
  const session = await getSession();

  if (!session) {
    throw new Error("Unauthorized");
  }

  return session;
}

/**
 * Check if an email is a superadmin.
 * Source: SUPERADMIN_EMAILS env var (fallback: marriage.config.ts).
 */
export function isSuperAdmin(email: string): boolean {
  return isSuperAdminEmail(email);
}
