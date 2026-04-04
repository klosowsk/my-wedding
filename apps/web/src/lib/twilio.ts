// Twilio client for SMS and WhatsApp
// Noop if not configured — gracefully returns without error
// Uses Twilio REST API directly via fetch (no SDK dependency)

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_FROM_PHONE = process.env.TWILIO_FROM_PHONE;
const TWILIO_WHATSAPP_FROM = process.env.TWILIO_WHATSAPP_FROM;

interface TwilioResult {
  success: boolean;
  sid?: string;
  error?: string;
}

/**
 * Check if Twilio SMS is configured.
 */
export function isConfigured(): boolean {
  return Boolean(TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_FROM_PHONE);
}

/**
 * Check if Twilio WhatsApp is configured.
 */
export function isWhatsAppConfigured(): boolean {
  return Boolean(TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_WHATSAPP_FROM);
}

/**
 * Send an SMS via Twilio REST API.
 * Returns { success: false } if Twilio is not configured.
 */
export async function sendSMS(to: string, body: string): Promise<TwilioResult> {
  if (!isConfigured()) {
    return { success: false, error: "Twilio SMS is not configured" };
  }

  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
    const auth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString("base64");

    const params = new URLSearchParams({
      From: TWILIO_FROM_PHONE!,
      To: to,
      Body: body,
    });

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        error: data.message ?? `Twilio error: ${res.status}`,
      };
    }

    return { success: true, sid: data.sid };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown Twilio error",
    };
  }
}

/**
 * Send a WhatsApp message via Twilio REST API.
 * Uses the "whatsapp:" prefix on From and To numbers.
 * Returns { success: false } if WhatsApp is not configured.
 */
export async function sendWhatsApp(to: string, body: string): Promise<TwilioResult> {
  if (!isWhatsAppConfigured()) {
    return { success: false, error: "Twilio WhatsApp is not configured" };
  }

  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
    const auth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString("base64");

    const params = new URLSearchParams({
      From: `whatsapp:${TWILIO_WHATSAPP_FROM}`,
      To: `whatsapp:${to}`,
      Body: body,
    });

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        error: data.message ?? `Twilio WhatsApp error: ${res.status}`,
      };
    }

    return { success: true, sid: data.sid };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown Twilio error",
    };
  }
}
