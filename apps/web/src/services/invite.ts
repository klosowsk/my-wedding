// Invite service — progressive automation
// Tier 0: Manual (always available) — formatted message + link to clipboard
// Tier 1: SMS (when TWILIO_ACCOUNT_SID + TWILIO_FROM_PHONE configured)
// Tier 2: WhatsApp (when TWILIO_WHATSAPP_FROM configured)
// Tier 3: Email (when RESEND_API_KEY configured)

import { guestRepository } from "../repositories/guest";
import * as twilio from "../lib/twilio";
import * as resend from "../lib/resend";
import { config } from "@/lib/config";
import { getPublicAppUrl, normalizeBaseUrl } from "@/lib/public-url";
import { siteConfigService } from "./site-config";

type InviteChannel = "manual" | "sms" | "whatsapp" | "email";

interface InviteResult {
  success: boolean;
  message?: string;
  error?: string;
}

interface BulkResult {
  sent: number;
  failed: number;
  errors: string[];
}

interface InviteContext {
  couple: readonly [string, string];
  venueName: string;
  eventDate: string;
  globalInviteMessagePt: string | null;
  globalInviteMessageEn: string | null;
  globalInviteMessageEs: string | null;
}

function getDefaultInviteContext(): InviteContext {
  return {
    couple: config.event.couple,
    venueName: config.event.venue.name,
    eventDate: config.event.date,
    globalInviteMessagePt: null,
    globalInviteMessageEn: null,
    globalInviteMessageEs: null,
  };
}

async function getInviteContext(): Promise<InviteContext> {
  try {
    const settings = await siteConfigService.getSettings();

    return {
      couple: [settings.coupleName1, settings.coupleName2],
      venueName: settings.venueName,
      eventDate: settings.eventDate,
      globalInviteMessagePt: settings.globalInviteMessagePt,
      globalInviteMessageEn: settings.globalInviteMessageEn,
      globalInviteMessageEs: settings.globalInviteMessageEs,
    };
  } catch {
    return getDefaultInviteContext();
  }
}

function formatEventDateForInvite(
  dateIso: string,
  language: string
): string {
  const locale = language === "en" ? "en-US" : language === "es" ? "es-ES" : "pt-BR";
  const date = new Date(`${dateIso}T12:00:00`);

  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

/**
 * Detect which invite channels are available based on environment configuration.
 * Manual is always available.
 */
export function getAvailableChannels(): InviteChannel[] {
  const channels: InviteChannel[] = ["manual"];

  if (twilio.isConfigured()) {
    channels.push("sms");
  }
  if (twilio.isWhatsAppConfigured()) {
    channels.push("whatsapp");
  }
  if (resend.isConfigured()) {
    channels.push("email");
  }

  return channels;
}

/**
 * Build the RSVP link for a guest.
 */
export function getInviteLink(
  guest: { token: string; language: string },
  baseUrl: string
): string {
  return `${normalizeBaseUrl(baseUrl)}/${guest.language}/i/${guest.token}`;
}

function applyTemplateVars(template: string, vars: Record<string, string>): string {
  return Object.entries(vars).reduce(
    (message, [key, value]) => message.replaceAll(`{${key}}`, value),
    template
  );
}

/**
 * Format a personalized invite message for a guest.
 * Translates based on the guest's language preference.
 */
export function formatInviteMessage(
  guest: { familyName: string; token: string; language: string },
  baseUrl: string,
  context: InviteContext = getDefaultInviteContext()
): string {
  const link = getInviteLink(guest, baseUrl);
  const [person1, person2] = context.couple;
  const { venueName, eventDate } = context;
  const dateLabel = formatEventDateForInvite(eventDate, guest.language);

  const globalTemplate =
    guest.language === "en"
      ? context.globalInviteMessageEn
      : guest.language === "es"
        ? context.globalInviteMessageEs
        : context.globalInviteMessagePt;

  if (globalTemplate) {
    return applyTemplateVars(globalTemplate, {
      familyName: guest.familyName,
      couple: `${person1} & ${person2}`,
      person1,
      person2,
      date: dateLabel,
      venue: venueName,
      link,
    });
  }

  switch (guest.language) {
    case "en":
      return [
        `Hello, ${guest.familyName}! ${person1} and ${person2} would like to invite you to our wedding!`,
        `\u{1F4C5} ${dateLabel} | \u{1F4CD} ${venueName}`,
        `Confirm here: ${link}`,
      ].join("\n");

    case "es":
      return [
        `\u{00A1}Hola, ${guest.familyName}! ${person1} y ${person2} nos encantaria invitarles a nuestra boda!`,
        `\u{1F4C5} ${dateLabel} | \u{1F4CD} ${venueName}`,
        `Confirma aqui: ${link}`,
      ].join("\n");

    // pt-BR (default)
    default:
      return [
        `Ola, ${guest.familyName}! ${person1} e ${person2} gostariam de convida-los para o casamento!`,
        `\u{1F4C5} ${dateLabel} | \u{1F4CD} ${venueName}`,
        `Confirme aqui: ${link}`,
      ].join("\n");
  }
}

/**
 * Build a simple HTML email body for the invite.
 */
function buildInviteEmailHtml(
  guest: { familyName: string; token: string; language: string },
  baseUrl: string,
  context: InviteContext = getDefaultInviteContext()
): string {
  const link = getInviteLink(guest, baseUrl);
  const [person1, person2] = context.couple;
  const { venueName, eventDate } = context;

  const isEn = guest.language === "en";
  const isEs = guest.language === "es";

  const greeting = isEn
    ? `Hello, ${guest.familyName}!`
    : isEs
      ? `\u{00A1}Hola, ${guest.familyName}!`
      : `Ola, ${guest.familyName}!`;

  const inviteLine = isEn
    ? `${person1} and ${person2} would like to invite you to our wedding!`
    : isEs
      ? `${person1} y ${person2} nos encantaria invitarles a nuestra boda!`
      : `${person1} e ${person2} gostariam de convida-los para o casamento!`;

  const dateLine = formatEventDateForInvite(eventDate, guest.language);

  const buttonText = isEn
    ? "Confirm Attendance"
    : isEs
      ? "Confirmar Asistencia"
      : "Confirmar Presenca";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin:0;padding:0;background-color:#F7F4EE;font-family:'Raleway',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F7F4EE;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background-color:#FFFDF9;border-radius:12px;border:1px solid #D3BFA6;padding:40px 32px;">
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <h1 style="margin:0;font-size:28px;color:#B46942;font-weight:normal;">${person1} & ${person2}</h1>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom:16px;">
              <p style="margin:0;font-size:18px;color:#3C3530;">${greeting}</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <p style="margin:0;font-size:16px;color:#3C3530;line-height:1.6;">${inviteLine}</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom:8px;">
              <p style="margin:0;font-size:16px;color:#9A9287;">\u{1F4C5} ${dateLine}</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <p style="margin:0;font-size:16px;color:#9A9287;">\u{1F4CD} ${venueName}</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom:16px;">
              <a href="${link}" style="display:inline-block;background-color:#B46942;color:#FFFDF9;text-decoration:none;padding:14px 32px;border-radius:999px;font-size:16px;font-weight:600;">${buttonText}</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}

/**
 * Send an invite to a single guest via the specified channel.
 *
 * - manual: updates invite status, returns the formatted message for the admin to copy
 * - sms: sends via Twilio SMS
 * - whatsapp: sends via Twilio WhatsApp
 * - email: sends via Resend
 */
export async function sendInvite(
  guestId: string,
  channel: InviteChannel,
  customMessage?: string
): Promise<InviteResult> {
  const guest = await guestRepository.findById(guestId);
  if (!guest) {
    return { success: false, error: "Guest not found" };
  }

  const baseUrl = getPublicAppUrl();
  const inviteContext = await getInviteContext();
  const message =
    customMessage || formatInviteMessage(guest, baseUrl, inviteContext);

  let result: InviteResult;

  switch (channel) {
    case "manual": {
      // For manual, we just mark as sent and return the message for the admin
      result = { success: true, message };
      break;
    }

    case "sms": {
      if (!guest.phone) {
        return { success: false, error: "Guest has no phone number" };
      }
      const smsResult = await twilio.sendSMS(guest.phone, message);
      if (!smsResult.success) {
        return { success: false, error: smsResult.error ?? "SMS send failed" };
      }
      result = { success: true, message: `SMS sent (SID: ${smsResult.sid})` };
      break;
    }

    case "whatsapp": {
      if (!guest.phone) {
        return { success: false, error: "Guest has no phone number" };
      }
      const waResult = await twilio.sendWhatsApp(guest.phone, message);
      if (!waResult.success) {
        return { success: false, error: waResult.error ?? "WhatsApp send failed" };
      }
      result = { success: true, message: `WhatsApp sent (SID: ${waResult.sid})` };
      break;
    }

    case "email": {
      if (!guest.email) {
        return { success: false, error: "Guest has no email address" };
      }

      const isEn = guest.language === "en";
      const isEs = guest.language === "es";
      const subject = isEn
        ? "You're invited to our wedding!"
        : isEs
          ? "Estan invitados a nuestra boda!"
          : "Voces estao convidados para o nosso casamento!";

      const html = buildInviteEmailHtml(guest, baseUrl, inviteContext);
      const emailResult = await resend.sendInviteEmail(guest.email, subject, html);
      if (!emailResult.success) {
        return { success: false, error: emailResult.error ?? "Email send failed" };
      }
      result = { success: true, message: "Email sent successfully" };
      break;
    }

    default:
      return { success: false, error: `Unknown channel: ${channel}` };
  }

  // Update guest invite status in DB
  if (result.success) {
    await guestRepository.update(guestId, {
      inviteStatus: "sent",
      inviteMethod: channel,
      inviteSentAt: new Date(),
    });
  }

  return result;
}

/**
 * Send invites to multiple guests.
 * Processes sequentially to avoid rate-limiting issues with external APIs.
 */
export async function sendBulk(
  guestIds: string[],
  channel: InviteChannel
): Promise<BulkResult> {
  let sent = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const guestId of guestIds) {
    const result = await sendInvite(guestId, channel);
    if (result.success) {
      sent++;
    } else {
      failed++;
      errors.push(`Guest ${guestId}: ${result.error ?? "Unknown error"}`);
    }
  }

  return { sent, failed, errors };
}

export const inviteService = {
  getAvailableChannels,
  getInviteLink,
  formatInviteMessage,
  sendInvite,
  sendBulk,
};
