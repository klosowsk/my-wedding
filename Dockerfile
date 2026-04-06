# My Wedding — Multi-stage Docker build for Next.js monorepo (Bun + PostgreSQL)
#
# Build from repo root:
#   docker build -t my-wedding .
#
# Push to cluster registry:
#   docker tag my-wedding registry.registry.svc.cluster.local:5000/my-wedding:<sha>
#   docker push registry.registry.svc.cluster.local:5000/my-wedding:<sha>

FROM node:20 AS base
RUN apt-get update && apt-get install -y curl unzip python3 make g++ && rm -rf /var/lib/apt/lists/*

# Install Bun
ARG BUN_VERSION=1.3.11
RUN curl --retry 5 --retry-delay 10 --retry-all-errors -fSL \
    "https://github.com/oven-sh/bun/releases/download/bun-v${BUN_VERSION}/bun-linux-x64.zip" \
    -o /tmp/bun.zip && \
    unzip /tmp/bun.zip -d /tmp && \
    mv /tmp/bun-linux-x64/bun /usr/local/bin/bun && \
    chmod +x /usr/local/bin/bun && \
    rm -rf /tmp/bun.zip /tmp/bun-linux-x64

# ── Dependencies ──────────────────────────────────────────────
FROM base AS deps
WORKDIR /app

COPY package.json bun.lock ./
COPY apps/web/package.json ./apps/web/
COPY packages/db/package.json ./packages/db/
COPY packages/shared/package.json ./packages/shared/

RUN bun install --frozen-lockfile

# ── Builder ───────────────────────────────────────────────────
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps ./apps
COPY --from=deps /app/packages ./packages

COPY apps/web ./apps/web
COPY packages/db ./packages/db
COPY packages/shared ./packages/shared
COPY tsconfig.base.json ./tsconfig.base.json
COPY marriage.config.ts ./marriage.config.ts
COPY migrate.mjs ./migrate.mjs

ENV NEXT_TELEMETRY_DISABLED=1

# Dummy env vars for build-time (Next.js evaluates server code during build)
ENV BETTER_AUTH_SECRET=build-placeholder
ENV DATABASE_URL=postgres://placeholder:placeholder@localhost:5432/placeholder
ENV NEXT_PUBLIC_APP_URL=https://julianaerodrigo.com

WORKDIR /app/apps/web
RUN bun run build

# ── Runner ────────────────────────────────────────────────────
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN groupadd --system --gid 1001 nodejs
RUN useradd --system --uid 1001 --create-home nextjs

# Copy standalone output
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./

# Copy static files
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

# Copy public directory needed for standalone
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

# Copy runtime dependencies (excluded via serverExternalPackages: postgres, sharp)
COPY --from=builder /app/node_modules/.bun/postgres@*/node_modules/postgres /app/node_modules/postgres
COPY --from=builder /app/node_modules/.bun/sharp@*/node_modules/sharp /app/node_modules/sharp
COPY --from=builder /app/node_modules/.bun/drizzle-orm@*/node_modules/drizzle-orm /app/node_modules/drizzle-orm

# Copy migration script (repo root, not in standalone output)
COPY --from=builder --chown=nextjs:nodejs /app/migrate.mjs ./migrate.mjs
COPY --from=builder --chown=nextjs:nodejs /app/packages/db ./packages/db

USER nextjs

EXPOSE 3333

ENV PORT=3333
ENV HOSTNAME="0.0.0.0"

WORKDIR /app/apps/web
CMD ["node", "server.js"]
