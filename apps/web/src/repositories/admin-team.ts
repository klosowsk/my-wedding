import { db, adminInvitations, user } from "@marriage/db";
import { eq, and, gt, desc } from "drizzle-orm";
import crypto from "crypto";

/**
 * List all users (admins).
 */
export async function listAdmins() {
  return db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    })
    .from(user)
    .orderBy(user.createdAt);
}

/**
 * List pending invitations that haven't expired.
 */
export async function listPendingInvitations() {
  return db
    .select({
      id: adminInvitations.id,
      email: adminInvitations.email,
      token: adminInvitations.token,
      status: adminInvitations.status,
      expiresAt: adminInvitations.expiresAt,
      createdAt: adminInvitations.createdAt,
      invitedById: adminInvitations.invitedBy,
    })
    .from(adminInvitations)
    .where(
      and(
        eq(adminInvitations.status, "pending"),
        gt(adminInvitations.expiresAt, new Date())
      )
    )
    .orderBy(desc(adminInvitations.createdAt));
}

/**
 * Create a new admin invitation.
 */
export async function createInvitation(
  email: string,
  invitedById: string
) {
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const [invitation] = await db
    .insert(adminInvitations)
    .values({
      email,
      token,
      invitedBy: invitedById,
      expiresAt,
    })
    .returning();

  return invitation;
}

/**
 * Find a pending invitation by token.
 */
export async function findInvitationByToken(token: string) {
  return db.query.adminInvitations.findFirst({
    where: and(
      eq(adminInvitations.token, token),
      eq(adminInvitations.status, "pending"),
      gt(adminInvitations.expiresAt, new Date())
    ),
  });
}

/**
 * Revoke an invitation by ID (set status to 'revoked').
 */
export async function revokeInvitation(id: string) {
  const [updated] = await db
    .update(adminInvitations)
    .set({ status: "revoked" })
    .where(
      and(eq(adminInvitations.id, id), eq(adminInvitations.status, "pending"))
    )
    .returning();
  return updated;
}

/**
 * Mark invitation as accepted (called from auth hook).
 */
export async function acceptInvitationByEmail(email: string) {
  await db
    .update(adminInvitations)
    .set({ status: "accepted", acceptedAt: new Date() })
    .where(
      and(
        eq(adminInvitations.email, email),
        eq(adminInvitations.status, "pending")
      )
    );
}

/**
 * Check if a pending (non-expired) invitation exists for an email.
 */
export async function hasPendingInvitation(email: string) {
  const invitation = await db.query.adminInvitations.findFirst({
    where: and(
      eq(adminInvitations.email, email),
      eq(adminInvitations.status, "pending"),
      gt(adminInvitations.expiresAt, new Date())
    ),
  });
  return !!invitation;
}

/**
 * Find a user by email.
 */
export async function findUserByEmail(email: string) {
  return db.query.user.findFirst({
    where: eq(user.email, email),
  });
}

/**
 * Delete a user by ID (remove admin).
 */
export async function deleteUser(id: string) {
  const [deleted] = await db.delete(user).where(eq(user.id, id)).returning();
  return deleted;
}

/**
 * Find a user by ID.
 */
export async function findUserById(id: string) {
  return db.query.user.findFirst({
    where: eq(user.id, id),
  });
}
