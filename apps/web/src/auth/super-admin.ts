import { config } from "@/lib/config";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function parseEnvEmails(raw: string | undefined): string[] {
  if (!raw) return [];

  return raw
    .split(",")
    .map((email) => normalizeEmail(email))
    .filter(Boolean);
}

/**
 * SUPERADMIN_EMAILS takes precedence over marriage.config.ts.
 * Expected format: comma-separated list of emails.
 */
export function getSuperAdminEmails(): string[] {
  const envEmails = parseEnvEmails(process.env.SUPERADMIN_EMAILS);
  if (envEmails.length > 0) return envEmails;

  return (config.admin.emails as readonly string[])
    .map((email) => normalizeEmail(email))
    .filter(Boolean);
}

export function isSuperAdminEmail(email: string): boolean {
  return getSuperAdminEmails().includes(normalizeEmail(email));
}
