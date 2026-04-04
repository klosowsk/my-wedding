import * as repo from "@/src/repositories/admin-team";
import { sendInviteEmail, isConfigured as isResendConfigured } from "@/src/lib/resend";
import { siteConfigService } from "@/src/services/site-config";
import { isSuperAdmin } from "@/src/auth/session";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3333";

/**
 * List all admins with superadmin flag + pending invitations.
 */
export async function getTeam() {
  const [admins, invitations] = await Promise.all([
    repo.listAdmins(),
    repo.listPendingInvitations(),
  ]);

  // For each invitation, resolve the inviter name
  const inviterIds = [
    ...new Set(invitations.map((i) => i.invitedById).filter(Boolean)),
  ];
  const inviters: Record<string, { name: string; email: string }> = {};
  for (const id of inviterIds) {
    if (id) {
      const u = await repo.findUserById(id);
      if (u) inviters[id] = { name: u.name, email: u.email };
    }
  }

  return {
    admins: admins.map((a) => ({
      ...a,
      isSuperAdmin: isSuperAdmin(a.email),
    })),
    invitations: invitations.map((i) => ({
      id: i.id,
      email: i.email,
      status: i.status,
      expiresAt: i.expiresAt,
      createdAt: i.createdAt,
      invitedBy: i.invitedById ? inviters[i.invitedById] ?? null : null,
    })),
  };
}

/**
 * Invite a new admin by email.
 */
export async function inviteAdmin(email: string, invitedBy: { id: string }) {
  // Check not already a superadmin
  if (isSuperAdmin(email)) {
    throw new Error("This email is already a superadmin.");
  }

  // Check not already registered
  const existing = await repo.findUserByEmail(email);
  if (existing) {
    throw new Error("This email is already registered as an admin.");
  }

  // Check no pending invitation
  const hasPending = await repo.hasPendingInvitation(email);
  if (hasPending) {
    throw new Error("A pending invitation already exists for this email.");
  }

  const invitation = await repo.createInvitation(email, invitedBy.id);
  if (!invitation) throw new Error("Failed to create invitation.");
  const inviteUrl = `${APP_URL}/admin/invite/${invitation.token}`;

  // Try sending email if Resend is configured
  let emailSent = false;
  if (isResendConfigured()) {
    const wedding = await siteConfigService.getWeddingConfig();
    const coupleName = wedding.event.couple.join(" & ");
    const result = await sendInviteEmail(
      email,
      `You're invited to manage ${coupleName}'s wedding`,
      buildInviteEmailHtml(inviteUrl, coupleName)
    );
    emailSent = result.success;
  }

  return { invitation, inviteUrl, emailSent };
}

/**
 * Revoke a pending invitation.
 */
export async function revokeInvitation(id: string) {
  const revoked = await repo.revokeInvitation(id);
  if (!revoked) {
    throw new Error("Invitation not found or already processed.");
  }
  return revoked;
}

/**
 * Remove an admin user. Only superadmins can remove others.
 */
export async function removeAdmin(
  targetId: string,
  requestingUser: { id: string; email: string }
) {
  if (targetId === requestingUser.id) {
    throw new Error("You cannot remove yourself.");
  }

  if (!isSuperAdmin(requestingUser.email)) {
    throw new Error("Only superadmins can remove other admins.");
  }

  const target = await repo.findUserById(targetId);
  if (!target) {
    throw new Error("Admin not found.");
  }

  return repo.deleteUser(targetId);
}

/**
 * Validate an invite token (public endpoint).
 */
export async function validateInviteToken(token: string) {
  const invitation = await repo.findInvitationByToken(token);
  if (!invitation) {
    throw new Error("This invitation is invalid or has expired.");
  }
  return {
    email: invitation.email,
    expiresAt: invitation.expiresAt,
  };
}

function buildInviteEmailHtml(inviteUrl: string, coupleName: string): string {
  return `
    <div style="font-family: 'Raleway', Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 40px 20px;">
      <h1 style="color: #B46942; font-size: 24px; margin-bottom: 16px;">
        You're Invited! 🎉
      </h1>
      <p style="color: #3C3530; font-size: 16px; line-height: 1.6;">
        You've been invited to co-manage the admin panel for
        <strong>${coupleName}</strong>'s wedding.
      </p>
      <p style="color: #3C3530; font-size: 16px; line-height: 1.6;">
        Click the link below to create your account:
      </p>
      <a href="${inviteUrl}" style="display: inline-block; background-color: #B46942; color: #FFFDF9; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 16px; font-weight: 600; margin: 16px 0;">
        Accept Invitation
      </a>
      <p style="color: #9A9287; font-size: 14px; margin-top: 24px;">
        This link expires in 7 days. If you didn't expect this invitation, you can safely ignore this email.
      </p>
    </div>
  `;
}
