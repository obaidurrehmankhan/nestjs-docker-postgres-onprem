# ======================
# Stage 1: Builder
# ======================
FROM node:20-bookworm-slim AS builder

WORKDIR /app

# ---------------------------------------------------------------------
# Step 1: Copy package manifests first for layer caching
# ---------------------------------------------------------------------
COPY package*.json ./

# ---------------------------------------------------------------------
# Step 2: Install ALL dependencies (incl. dev) with retry fallback
# - First try a clean reproducible install with npm ci
# - If it fails (stale cache/network issue), clean npm cache & retry
# ---------------------------------------------------------------------
RUN npm ci --prefer-online --no-audit --no-fund \
    || (npm cache clean --force && npm ci --no-audit --no-fund)

# ---------------------------------------------------------------------
# Step 3: Copy configs + source (including data-source.ts so it compiles)
# ---------------------------------------------------------------------
COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY src ./src
COPY data-source.ts ./

# ---------------------------------------------------------------------
# Step 4: Build the app (NestJS TS → JS into /dist + data-source.js)
# ---------------------------------------------------------------------
ENV NODE_ENV=production
RUN npm run build
