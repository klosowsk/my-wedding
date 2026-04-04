import type { z } from "zod";
import type {
  rsvpConfirmSchema,
  createGuestSchema,
  updateGuestSchema,
  createMemberSchema,
  createGiftSchema,
  updateGiftSchema,
  createContributionSchema,
  createPageSchema,
  updatePageSchema,
  updateGallerySchema,
  inviteAdminSchema,
  createExpenseSchema,
  updateExpenseSchema,
} from "./validators";

// Inferred types from Zod schemas
export type RSVPConfirmInput = z.infer<typeof rsvpConfirmSchema>;
export type CreateGuestInput = z.infer<typeof createGuestSchema>;
export type UpdateGuestInput = z.infer<typeof updateGuestSchema>;
export type CreateMemberInput = z.infer<typeof createMemberSchema>;
export type CreateGiftInput = z.infer<typeof createGiftSchema>;
export type UpdateGiftInput = z.infer<typeof updateGiftSchema>;
export type CreateContributionInput = z.infer<typeof createContributionSchema>;
export type CreatePageInput = z.infer<typeof createPageSchema>;
export type UpdatePageInput = z.infer<typeof updatePageSchema>;
export type UpdateGalleryInput = z.infer<typeof updateGallerySchema>;

// API response types
export interface Guest {
  id: string;
  token: string;
  familyName: string;
  phone: string | null;
  email: string | null;
  language: string;
  status: "pending" | "confirmed" | "declined" | "partial";
  message: string | null;
  inviteStatus: "not_sent" | "sent" | "delivered" | "read" | "failed";
  inviteMethod: "manual" | "sms" | "whatsapp" | "email" | null;
  inviteSentAt: string | null;
  confirmedAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  members: GuestMember[];
}

export interface GuestMember {
  id: string;
  guestId: string;
  name: string;
  isPrimary: boolean;
  ageGroup: "adult" | "child" | "infant";
  status: "pending" | "confirmed" | "declined";
  dietaryNotes: string | null;
  sortOrder: number;
}

export interface Gift {
  id: string;
  namePt: string;
  nameEn: string | null;
  nameEs: string | null;
  descriptionPt: string | null;
  descriptionEn: string | null;
  descriptionEs: string | null;
  priceCents: number;
  collectedCents: number;
  imageUrl: string | null;
  category: string | null;
  status: "available" | "fully_funded" | "hidden";
  sortOrder: number;
}

export interface GiftContribution {
  id: string;
  giftId: string;
  guestId: string | null;
  contributorName: string | null;
  amountCents: number;
  paymentMethod: "pix" | "stripe";
  paymentStatus: "pending" | "confirmed" | "failed" | "refunded";
  stripeSessionId: string | null;
  confirmedAt: string | null;
  createdAt: string;
}

export interface Photo {
  id: string;
  filename: string;
  captionPt: string | null;
  captionEn: string | null;
  captionEs: string | null;
  section: string | null;
  sortOrder: number;
  visible: boolean;
}

export interface Page {
  id: string;
  slug: string;
  titlePt: string;
  titleEn: string | null;
  titleEs: string | null;
  contentPt: string | null;
  contentEn: string | null;
  contentEs: string | null;
  icon: string | null;
  published: boolean;
  sortOrder: number;
}

// Admin invitations
export type InviteAdminInput = z.infer<typeof inviteAdminSchema>;
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;

export interface AdminInvitation {
  id: string;
  email: string;
  token: string;
  invitedBy: { id: string; name: string; email: string } | null;
  status: "pending" | "accepted" | "expired" | "revoked";
  expiresAt: string;
  acceptedAt: string | null;
  createdAt: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  isSuperAdmin: boolean;
  createdAt: string;
}

export interface Expense {
  id: string;
  title: string;
  vendor: string | null;
  budgetCents: number;
  amountCents: number | null;
  category: string;
  expenseDate: string;
  paymentMethod: string | null;
  paid: boolean;
  notes: string | null;
  createdBy: { id: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseSummary {
  grandTotal: { paid: number; budgeted: number; overUnder: number };
  byCategory: {
    category: string;
    paid: number;
    budgeted: number;
  }[];
  costPerGuest: {
    confirmedGuests: number;
    paidCostPerGuest: number;
    budgetedCostPerGuest: number;
  };
}

export interface DashboardStats {
  totalGuests: number;
  totalMembers: number;
  confirmedAdults: number;
  confirmedChildren: number;
  confirmedInfants: number;
  pendingGuests: number;
  declinedGuests: number;
  totalGifts: number;
  totalCollectedCents: number;
  totalContributions: number;
}
