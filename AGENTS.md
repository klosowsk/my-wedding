# Marriage — Agent Operating Guide 

Last updated: 2026-04-04

This file is optimized for LLM execution context.
Code is the source of truth; this guide only keeps decisions that affect implementation quality.

---

## 1) Project in one paragraph

`my-wedding` is a Turborepo with one Next.js 15 app (`apps/web`) and shared `db` + `shared` packages. It powers a multilingual wedding website for Juliana & Rodrigo, with public pages (landing, RSVP, gifts, gallery, info) and an admin panel (guests, gifts, gallery, pages, settings, team, expenses).

---

## 2) Source-of-truth order (important)

When instructions conflict, use this precedence:

1. **Code in repo** (routes, schema, services, components)
2. `marriage.config.ts` (event/theme/features/admin)
3. `docs/UI_RULES.md` (single UI source of truth for human + AI)

---

## 3) Current architecture (actual)

- Monorepo workspaces:
  - `apps/web` (Next.js 15 App Router)
  - `packages/db` (Drizzle + postgres.js)
  - `packages/shared` (zod validators + shared types/constants)
- i18n: `next-intl` with locales: `pt-BR`, `en`, `es`
- Auth: Better Auth (email/password)
- DB: PostgreSQL 16
- Payments: PIX + Stripe
- Media: S3-compatible upload support (MinIO/R2/AWS)

---

## 4) Must-follow engineering rules

### Layer boundaries

- API routes: parse request + call services + return JSON
- Services: business rules/orchestration
- Repositories: DB queries only
- Keep server logic in `apps/web/src/*`

### Auth rules

- Admin pages/API must require session (`requireAdmin()`)
- Signup rules in auth hooks:
  - superadmin emails from `SUPERADMIN_EMAILS` (fallback: `config.admin.emails`)
  - invited admins via admin invitation flow
- Superadmin checks use `isSuperAdmin(email)`

### i18n rules

- User-facing strings must come from locale files (`t(...)`)
- Never hardcode translated text in pages/components
- Locales live in `apps/web/lib/i18n/locales/*.json`

### UI rules

- Follow `docs/UI_RULES.md` for all UI implementation and review
- Keep UI guidance centralized there

---

## 5) Route map (current)

### Public

- `/{locale}` landing
- `/{locale}/rsvp` token entry page
- `/{locale}/rsvp/{token}` RSVP form page
- `/{locale}/gifts`
- `/{locale}/gallery`
- `/{locale}/info/{slug}`

### Admin (no locale prefix)

- `/admin/signin`
- `/admin` dashboard
- `/admin/guests`, `/admin/guests/[id]`
- `/admin/gifts`
- `/admin/gallery`
- `/admin/pages`
- `/admin/settings`
- `/admin/team`
- `/admin/expenses`
- `/admin/invite/[token]` (admin invitation acceptance flow)

### API

- Public:
  - `/api/v1/rsvp/[token]`
  - `/api/v1/invite/[token]`
  - `/api/v1/gifts`
  - `/api/v1/gallery`
  - `/api/v1/pages/[slug]`
  - `/api/v1/site-config`
  - `/api/v1/payments/pix`
  - `/api/v1/payments/stripe`
  - `/api/v1/payments/webhook`
- Admin:
  - `/api/v1/admin/dashboard`
  - `/api/v1/admin/guests/*`
  - `/api/v1/admin/gifts/*`
  - `/api/v1/admin/gallery/*`
  - `/api/v1/admin/pages/*`
  - `/api/v1/admin/settings`
  - `/api/v1/admin/invites/*`
  - `/api/v1/admin/team/*`
  - `/api/v1/admin/expenses/*`
  - `/api/v1/admin/upload`
  - `/api/v1/admin/media/*`

---

## 6) Data model highlights

Core domains:

- Guests + guest members + RSVP statuses
- Gifts + contributions (PIX/Stripe)
- Pages + gallery/photos
- Site config key-value
- Admin invitations/team management
- Expenses/budget tracking
- Media metadata (processing/ready/failed)

Enum families include:

- guest/member status
- invite status/method
- payment status/method
- media status
- admin invitation status
- expense category

See `packages/db/src/schema/*` and `packages/shared/src/validators.ts`.

---

## 7) Design + theme constraints (current)

- Theme tokens come from `marriage.config.ts` and `apps/web/app/globals.css`
- **Current fonts in code:**
  - Script: **Great Vibes**
  - Body/UI: **Raleway**
- Keep decorative elements only on public pages (never admin)
- Keep visual style warm/romantic/light (no dark mode)

For implementation details: `docs/UI_RULES.md`.

---

## 8) High-value file paths

- Config:
  - `marriage.config.ts`
  - `apps/web/lib/config.ts`
- UI:
  - `apps/web/app/globals.css`
  - `docs/UI_RULES.md`
- i18n:
  - `apps/web/lib/i18n/routing.ts`
  - `apps/web/lib/i18n/locales/*.json`
- Auth:
  - `apps/web/src/auth/index.ts`
  - `apps/web/src/auth/session.ts`
- Business logic:
  - `apps/web/src/services/*`
  - `apps/web/src/repositories/*`
- DB:
  - `packages/db/src/schema/*`
  - `packages/shared/src/validators.ts`

---

## 9) Local dev commands

```bash
# install
bun install

# env files
cp apps/web/.env.example apps/web/.env
cp packages/db/.env.example packages/db/.env

# start postgres
docker compose -f infrastructure/docker-compose.yml up -d

# migrate + seed
bun run db:migrate
bun run db:seed

# run app (Next default here is port 3333)
bun dev
```

---

## 10) Implementation checklist for agents

Before opening PR-sized changes:

1. Confirm route + API shape from current code (not from old docs)
2. Reuse shared validators/types from `packages/shared`
3. Keep i18n keys updated in all 3 locales
4. Keep admin auth guards in place
5. Keep UI tokens/classes aligned with `docs/UI_RULES.md`
6. If documentation conflicts with code, update docs in same change
