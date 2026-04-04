# UI Rules (Compact Source of Truth)

Last updated: 2026-04-04

Use this file for implementation decisions.
This is the single source of truth for UI guidance.

---

## 1) Core style

- Mood: warm, romantic, earthy, elegant
- Public site: decorative + breathable
- Admin: clean/functional, no decorations
- Light theme only (no dark mode)

---

## 2) Tokens and colors

Use semantic tokens from `apps/web/app/globals.css`.
Do not hardcode hex in components.

Key tokens:

- Primary action: `primary` (`#B46942`)
- Hover action: `primary-hover`
- Accent/success: `accent` (`#6F714A`)
- Surface: `surface` (`#ECE9D8`)
- Backgrounds: `background`, `warm-white`
- Text: `body`, `heading`, `text-muted`
- Decorative script color: `script` (`#1B3A6B`)

Rules:

- Prefer `bg-warm-white` / `bg-background` over raw white
- Prefer `text-body` over pure black
- **Exception:** QR rendering containers can use white for scan reliability

---

## 3) Typography

Current fonts (from code/config):

- Script: **Great Vibes** (`font-script`)
- Body/UI: **Raleway** (`font-body`)

Use script only for decorative headings/names (public pages):

- couple names
- large section titles
- selected decorative phrases

Never use script for:

- body paragraphs
- nav links in admin
- buttons/labels/inputs
- tables/forms/errors
- any admin UI text

---

## 4) Layout + spacing

- Mobile-first
- Generous section spacing (`py-16`+ on desktop)
- Max widths:
  - reading: `~768px`
  - content grids: `~1024px`
  - wide sections: `~1280px`

Preferred patterns:

- `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- `space-y-6/8/12` for vertical rhythm

---

## 5) Components

### Buttons

- Public primary: terracotta, pill-shaped (`rounded-full`)
- Admin buttons may use `rounded-lg`
- Hover states should be subtle, no aggressive transforms

### Cards

- Use `bg-surface` or `bg-warm-white`
- Border: sand/border token
- Soft shadow only

### Inputs

- `bg-surface`, `border-border`, `rounded-lg`
- Focus ring/border in primary tone
- Labels above controls, helper/error text below

### Badges / statuses

- confirmed/success -> accent tokens
- pending -> warning tokens
- failed/declined -> error tokens

---

## 6) Decorative system (public only)

- Assets: `/assets/vectors/*` (served from `apps/web/public/assets/vectors`)
- Keep botanical decorations subtle (`opacity ~0.15–0.35`)
- Use diagonal framing (top-left + bottom-right) when appropriate
- `.corner-frame` is available in `globals.css`
- Hide or reduce heavy decoration on small screens
- Never use decorative botanical elements in admin

---

## 7) Motion

- Subtle only: fade/slide/small scale
- Typical timings:
  - hover: ~150–250ms
  - enter transitions: ~400–700ms
- No flashy effects (bounce/parallax-heavy/3D)

---

## 8) Accessibility

- Preserve visible focus states (`:focus-visible`)
- Keep contrast readable against warm backgrounds
- Decorative images should be `aria-hidden`
- Minimum touch target ~44px

---

## 9) i18n + content

- All user-facing strings must be translatable (`t(...)`)
- Update `pt-BR`, `en`, and `es` files together
- Avoid hardcoded Portuguese/English/Spanish in components

---

## 10) Fast implementation checklist

1. Uses semantic tokens (no random hex)
2. Uses correct fonts (`font-script` only where appropriate)
3. Public page includes warmth + spacing + subtle decoration
4. Admin page is functional and undecorated
5. i18n keys added for all locales
6. Focus/accessibility states preserved
