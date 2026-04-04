# my-wedding 💍

A beautiful, multilingual wedding website starter — with RSVP, gifts (PIX + Stripe), gallery, and a built-in admin panel.

Built for real weddings, open for everyone.

## Why you might like it

- 🌍 **i18n out of the box** (`pt-BR`, `en`, `es`)
- 🧾 **Guest + RSVP management**
- 🎁 **Gift list with payments** (PIX + Stripe)
- 🖼️ **Gallery + CMS-like pages**
- 🔐 **Admin authentication + roles**

## Quick start

```bash
bun install
cp apps/web/.env.example apps/web/.env
cp packages/db/.env.example packages/db/.env
docker compose -f infrastructure/docker-compose.yml up -d
bun run db:migrate
bun run db:seed
bun dev
```

Open: `http://localhost:3333`

## Stack

Next.js 15 · Turborepo · Drizzle · PostgreSQL · Better Auth · S3-compatible uploads

---

If this helps with your big day, give it a ⭐ and make it yours.
