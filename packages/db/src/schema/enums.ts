import { pgEnum } from "drizzle-orm/pg-core";

export const guestStatusEnum = pgEnum("guest_status", [
  "pending",
  "confirmed",
  "declined",
  "partial",
]);

export const guestMemberStatusEnum = pgEnum("guest_member_status", [
  "pending",
  "confirmed",
  "declined",
]);

export const ageGroupEnum = pgEnum("age_group", ["adult", "child", "infant"]);

export const inviteStatusEnum = pgEnum("invite_status", [
  "not_sent",
  "sent",
  "delivered",
  "read",
  "failed",
]);

export const inviteMethodEnum = pgEnum("invite_method", [
  "manual",
  "sms",
  "whatsapp",
  "email",
]);

export const giftStatusEnum = pgEnum("gift_status", [
  "available",
  "fully_funded",
  "hidden",
]);

export const paymentMethodEnum = pgEnum("payment_method", ["pix", "stripe"]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "confirmed",
  "failed",
  "refunded",
]);

export const mediaStatusEnum = pgEnum("media_status", [
  "processing",
  "ready",
  "failed",
]);

export const adminInvitationStatusEnum = pgEnum("admin_invitation_status", [
  "pending",
  "accepted",
  "expired",
  "revoked",
]);

export const expenseCategoryEnum = pgEnum("expense_category", [
  "venue",
  "catering",
  "decoration",
  "music",
  "photography",
  "attire",
  "invitations",
  "honeymoon",
  "beauty",
  "transportation",
  "other",
]);
