// Email client for invite delivery via Resend
// Noop if not configured — gracefully returns without error

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3333";

interface ResendResult {
  success: boolean;
  id?: string;
  error?: string;
}

/**
 * Check if Resend email is configured.
 */
export function isConfigured(): boolean {
  return Boolean(RESEND_API_KEY);
}

/**
 * Derive the sender domain from the app URL.
 * e.g., "https://wedding.example.com" → "wedding.example.com"
 */
function getSenderDomain(): string {
  try {
    const url = new URL(APP_URL);
    return url.hostname;
  } catch {
    return "example.com";
  }
}

/**
 * Send an invite email via Resend API.
 * Returns { success: false } if Resend is not configured.
 */
export async function sendInviteEmail(
  to: string,
  subject: string,
  htmlBody: string
): Promise<ResendResult> {
  if (!isConfigured()) {
    return { success: false, error: "Resend is not configured" };
  }

  try {
    const domain = getSenderDomain();
    const from = `Wedding Team <noreply@${domain}>`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, html: htmlBody }),
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        error: data.message ?? `Resend error: ${res.status}`,
      };
    }

    return { success: true, id: data.id };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown Resend error",
    };
  }
}
