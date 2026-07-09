# ==============================================================================
# Dockerfile — Red Social Backend
# Multi-stage build: deps → build → prod-deps → runner
# Base: node:22-slim (glibc, native modules sin drama)
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1 — Install ALL dependencies (dev + prod)
# Necesitamos TypeScript, Prisma CLI, tsc-alias y Vitest para buildear y testear.
# ------------------------------------------------------------------------------
FROM node:22-slim AS deps
WORKDIR /app

COPY package*.json ./
RUN npm ci

# ------------------------------------------------------------------------------
# Stage 2 — Build the application
# Solo tenemos los source files, generamos el Prisma Client y compilamos.
# ------------------------------------------------------------------------------
FROM node:22-slim AS build
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# prisma.config.ts necesita DATABASE_URL para validar, pero acá no importa el valor
ENV DATABASE_URL=postgresql://dummy:dummy@localhost:5432/dummy

RUN npx prisma generate
RUN npm run build

# ------------------------------------------------------------------------------
# Stage 3 — Install ONLY production dependencies
# Imagen más chica = menos superficie de ataque + menor tiempo de pull.
# ------------------------------------------------------------------------------
FROM node:22-slim AS prod-deps
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

# ------------------------------------------------------------------------------
# Stage 4 — Runtime image
# Solo lo mínimo indispensable para correr la app.
# ------------------------------------------------------------------------------
FROM node:22-slim AS runner
WORKDIR /app

# --- Seguridad: no corremos como root ---
RUN addgroup --system --gid 1001 appgroup && \
    adduser --system --uid 1001 appuser

# --- Producción dependencies ---
COPY --from=prod-deps /app/node_modules ./node_modules

# --- Prisma generated client + engine (generados en build) ---
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/node_modules/@prisma/client ./node_modules/@prisma/client

# --- Schema de Prisma (por si queremos correr migrate en runtime) ---
COPY --from=build /app/prisma ./prisma

# --- Código compilado ---
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json

# --- Metadata ---
ENV NODE_ENV=production
EXPOSE 3000

USER appuser

CMD ["node", "dist/server.js"]
