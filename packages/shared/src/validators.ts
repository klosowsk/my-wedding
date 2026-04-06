import { z } from "zod";

// --- RSVP ---

export const rsvpMemberSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["confirmed", "declined"]),
  dietaryNotes: z.string().max(500).optional().nullable(),
});

export const rsvpConfirmSchema = z.object({
  members: z.array(rsvpMemberSchema).min(1),
  message: z.string().max(1000).optional().nullable(),
});

// --- Guest ---

export const createGuestSchema = z.object({
  familyName: z.string().min(1).max(200),
  phone: z.string().max(20).optional().nullable(),
  email: z.string().email().optional().nullable(),
  language: z.enum(["pt-BR", "en", "es"]).default("pt-BR"),
  notes: z.string().max(1000).optional().nullable(),
});

export const updateGuestSchema = createGuestSchema.partial();

// --- Guest Member ---

export const createMemberSchema = z.object({
  name: z.string().min(1).max(200),
  isPrimary: z.boolean().default(false),
  ageGroup: z.enum(["adult", "child", "infant"]).default("adult"),
  sortOrder: z.number().int().min(0).default(0),
});

export const updateMemberSchema = createMemberSchema.partial();

// --- Gift ---

export const createGiftSchema = z.object({
  namePt: z.string().min(1).max(200),
  nameEn: z.string().max(200).optional().nullable(),
  nameEs: z.string().max(200).optional().nullable(),
  descriptionPt: z.string().max(1000).optional().nullable(),
  descriptionEn: z.string().max(1000).optional().nullable(),
  descriptionEs: z.string().max(1000).optional().nullable(),
  priceCents: z.number().int().min(100),
  imageUrl: z.string().url().optional().nullable(),
  mediaId: z.string().uuid().optional().nullable(),
  category: z.string().max(50).optional().nullable(),
  contributionMode: z.enum(["open", "fixed", "quotes"]).default("open"),
  fixedContributionOptions: z.array(z.number().int().min(100)).optional().nullable(),
  quoteUnitCents: z.number().int().min(100).optional().nullable(),
  showCollectedAmount: z.boolean().default(true),
  showGoalAmount: z.boolean().default(true),
  showFundedBadge: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0),
});

export const updateGiftSchema = createGiftSchema.partial();

// --- Contribution ---

export const createContributionSchema = z.object({
  giftId: z.string().uuid(),
  contributorName: z.string().min(1).max(200).optional(),
  amountCents: z.number().int().min(100),
  quoteQuantity: z.number().int().min(1).max(100).optional(),
  paymentMethod: z.enum(["pix", "stripe"]),
});

// --- Page ---

export const createPageSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/),
  titlePt: z.string().min(1).max(200),
  titleEn: z.string().max(200).optional().nullable(),
  titleEs: z.string().max(200).optional().nullable(),
  contentPt: z.string().optional().nullable(),
  contentEn: z.string().optional().nullable(),
  contentEs: z.string().optional().nullable(),
  icon: z.string().max(50).optional().nullable(),
  published: z.boolean().default(false),
  sortOrder: z.number().int().min(0).default(0),
});

export const updatePageSchema = createPageSchema.partial().omit({ slug: true });

// --- Site Config ---

export const updateSiteConfigSchema = z.record(z.string(), z.string().nullable());

export const updateAdminSettingsSchema = z
  .object({
    coupleName1: z.string().trim().min(1).max(100),
    coupleName2: z.string().trim().min(1).max(100),
    eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    eventTime: z.string().regex(/^\d{2}:\d{2}$/),
    venueName: z.string().trim().min(1).max(200),
    venueAddress: z.string().trim().min(1).max(300),
    venueGoogleMapsUrl: z.string().url().nullable(),
    venueGoogleMapsEmbedUrl: z.string().url().nullable(),
    venueWazeUrl: z.string().url().nullable(),
    contactPhone: z.string().max(30).nullable(),
    contactEmail: z.string().email().nullable(),
    pixKey: z.string().max(255).nullable(),
    pixName: z.string().max(255).nullable(),
    pixCity: z.string().max(120).nullable(),
    stripeEnabled: z.boolean(),
    pixEnabled: z.boolean(),
    rsvpEnabled: z.boolean(),
    giftsEnabled: z.boolean(),
    galleryEnabled: z.boolean(),
    maxPlusOnes: z.number().int().min(0).max(20),
    currencyCode: z.string().trim().toUpperCase().length(3),
    currencyLocale: z.string().trim().min(2).max(20),
    rsvpDeadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
    inviteImageUrl: z.string().url().nullable(),
    globalInviteMessagePt: z.string().max(2000).nullable(),
    globalInviteMessageEn: z.string().max(2000).nullable(),
    globalInviteMessageEs: z.string().max(2000).nullable(),
    heroSubtitlePt: z.string().max(300).nullable(),
    heroSubtitleEn: z.string().max(300).nullable(),
    heroSubtitleEs: z.string().max(300).nullable(),
  })
  .partial();

// --- Admin Invitations ---

export const inviteAdminSchema = z.object({
  email: z.string().email(),
});

// --- Expenses ---

export const expenseCategoryValues = [
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
] as const;

export const createExpenseSchema = z.object({
  title: z.string().min(1).max(200),
  vendor: z.string().max(200).optional().nullable(),
  budgetCents: z.number().int().positive(),
  amountCents: z.number().int().positive().optional().nullable(),
  category: z.enum(expenseCategoryValues),
  expenseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  paymentMethod: z.string().max(50).optional().nullable(),
  paid: z.boolean().default(false),
  notes: z.string().max(1000).optional().nullable(),
});

export const updateExpenseSchema = createExpenseSchema.partial();

// --- Gallery ---

export const updateGallerySchema = z.object({
  id: z.string().uuid(),
  captionPt: z.string().max(500).optional().nullable(),
  captionEn: z.string().max(500).optional().nullable(),
  captionEs: z.string().max(500).optional().nullable(),
  section: z.string().max(50).optional().nullable(),
  sortOrder: z.number().int().min(0).optional(),
  visible: z.boolean().optional(),
});
