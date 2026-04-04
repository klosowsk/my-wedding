// --- Image Processing ---

/** Max dimensions for processed images (fit inside) */
export const IMAGE_VARIANTS = {
  /** Full size for detail views / lightbox */
  FULL: { width: 1600, height: 1600, quality: 82, suffix: "full" },
  /** Thumbnail for grids and cards */
  THUMB: { width: 400, height: 400, quality: 75, suffix: "thumb" },
} as const;

/** Blurhash encoding dimensions (small for fast encoding) */
export const BLURHASH_COMPONENTS = { x: 4, y: 3 } as const;

/** Allowed upload MIME types */
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
] as const;

/** Max upload size: 20MB (iPhone HEIC photos can be large) */
export const MAX_UPLOAD_SIZE = 20 * 1024 * 1024;

// Guest status labels
export const GUEST_STATUS_LABELS = {
  pending: { pt: "Pendente", en: "Pending", es: "Pendiente" },
  confirmed: { pt: "Confirmado", en: "Confirmed", es: "Confirmado" },
  declined: { pt: "Recusado", en: "Declined", es: "Rechazado" },
  partial: { pt: "Parcial", en: "Partial", es: "Parcial" },
} as const;

export const AGE_GROUP_LABELS = {
  adult: { pt: "Adulto", en: "Adult", es: "Adulto" },
  child: { pt: "Crianca", en: "Child", es: "Nino" },
  infant: { pt: "Bebe", en: "Infant", es: "Bebe" },
} as const;

export const INVITE_STATUS_LABELS = {
  not_sent: { pt: "Nao enviado", en: "Not sent", es: "No enviado" },
  sent: { pt: "Enviado", en: "Sent", es: "Enviado" },
  delivered: { pt: "Entregue", en: "Delivered", es: "Entregado" },
  read: { pt: "Lido", en: "Read", es: "Leido" },
  failed: { pt: "Falhou", en: "Failed", es: "Fallido" },
} as const;

export const INVITE_METHOD_LABELS = {
  manual: { pt: "Manual", en: "Manual", es: "Manual" },
  sms: { pt: "SMS", en: "SMS", es: "SMS" },
  whatsapp: { pt: "WhatsApp", en: "WhatsApp", es: "WhatsApp" },
  email: { pt: "Email", en: "Email", es: "Email" },
} as const;

export const GIFT_CATEGORIES = {
  kitchen: { pt: "Cozinha", en: "Kitchen", es: "Cocina" },
  bedroom: { pt: "Quarto", en: "Bedroom", es: "Dormitorio" },
  travel: { pt: "Viagem", en: "Travel", es: "Viaje" },
  experience: { pt: "Experiencia", en: "Experience", es: "Experiencia" },
} as const;

export const GIFT_STATUS_LABELS = {
  available: { pt: "Disponivel", en: "Available", es: "Disponible" },
  fully_funded: { pt: "Financiado", en: "Fully Funded", es: "Financiado" },
  hidden: { pt: "Oculto", en: "Hidden", es: "Oculto" },
} as const;

export const PAYMENT_STATUS_LABELS = {
  pending: { pt: "Pendente", en: "Pending", es: "Pendiente" },
  confirmed: { pt: "Confirmado", en: "Confirmed", es: "Confirmado" },
  failed: { pt: "Falhou", en: "Failed", es: "Fallido" },
  refunded: { pt: "Reembolsado", en: "Refunded", es: "Reembolsado" },
} as const;

export const EXPENSE_CATEGORIES = {
  venue: { pt: "Local", en: "Venue", es: "Local", icon: "🏠" },
  catering: { pt: "Comida & Bebida", en: "Catering", es: "Catering", icon: "🍽️" },
  decoration: { pt: "Decoração", en: "Decoration", es: "Decoración", icon: "🌸" },
  music: { pt: "Música", en: "Music", es: "Música", icon: "🎵" },
  photography: { pt: "Foto & Vídeo", en: "Photography", es: "Fotografía", icon: "📸" },
  attire: { pt: "Vestido & Traje", en: "Attire", es: "Vestimenta", icon: "👗" },
  invitations: { pt: "Convites", en: "Invitations", es: "Invitaciones", icon: "💌" },
  honeymoon: { pt: "Lua de Mel", en: "Honeymoon", es: "Luna de Miel", icon: "✈️" },
  beauty: { pt: "Cabelo & Maquiagem", en: "Beauty", es: "Belleza", icon: "💄" },
  transportation: { pt: "Transporte", en: "Transportation", es: "Transporte", icon: "🚌" },
  other: { pt: "Outros", en: "Other", es: "Otros", icon: "📦" },
} as const;

export const ADMIN_INVITATION_STATUS_LABELS = {
  pending: { pt: "Pendente", en: "Pending", es: "Pendiente" },
  accepted: { pt: "Aceito", en: "Accepted", es: "Aceptado" },
  expired: { pt: "Expirado", en: "Expired", es: "Expirado" },
  revoked: { pt: "Revogado", en: "Revoked", es: "Revocado" },
} as const;

export type ExpenseCategory = keyof typeof EXPENSE_CATEGORIES;
export type AdminInvitationStatus = keyof typeof ADMIN_INVITATION_STATUS_LABELS;

export type GuestStatus = keyof typeof GUEST_STATUS_LABELS;
export type AgeGroup = keyof typeof AGE_GROUP_LABELS;
export type InviteStatus = keyof typeof INVITE_STATUS_LABELS;
export type InviteMethod = keyof typeof INVITE_METHOD_LABELS;
export type GiftCategory = keyof typeof GIFT_CATEGORIES;
export type GiftStatus = keyof typeof GIFT_STATUS_LABELS;
export type PaymentStatus = keyof typeof PAYMENT_STATUS_LABELS;
