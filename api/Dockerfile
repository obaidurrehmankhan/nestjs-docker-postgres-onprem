# =====================================================================
# Dockerfile for NestJS (Node 20, Debian Bookworm Slim) • Multi-stage build
# =====================================================================

# ======================
# Stage 1: Builder
# ======================
FROM node:20-bookworm-slim AS builder

WORKDIR /app

# ---------------------------------------------------------------------
# Step 1: Copy package manifests first (better caching).
# ---------------------------------------------------------------------
COPY package*.json ./

# ---------------------------------------------------------------------
# Step 2: Install ALL dependencies (incl. dev) with retry fallback.
# ---------------------------------------------------------------------
RUN npm ci --prefer-online --no-audit --no-fund \
    || (npm cache clean --force && npm ci --no-audit --no-fund)

# ---------------------------------------------------------------------
# Step 3: Copy build-related configs and source code.
# ---------------------------------------------------------------------
COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY src ./src   # 👈 includes data-source.ts now (since we moved it)

# ---------------------------------------------------------------------
# Step 4: Build the app (NestJS → dist/* including data-source.js).
# ---------------------------------------------------------------------
ENV NODE_ENV=production
RUN npm run build


# ======================
# Stage 2: Runner
# ======================
FROM node:20-bookworm-slim AS runner

WORKDIR /app

# ---------------------------------------------------------------------
# Step 5: Runtime environment.
# ---------------------------------------------------------------------
ENV NODE_ENV=production
ENV PORT=3000

# ---------------------------------------------------------------------
# Step 6: Install curl for healthcheck, keep image slim.
# ---------------------------------------------------------------------
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

# ---------------------------------------------------------------------
# Step 7: Non-root user for security.
# ---------------------------------------------------------------------
RUN mkdir -p /app && chown -R node:node /app
USER node

# ---------------------------------------------------------------------
# Step 8: Install ONLY production dependencies.
# ---------------------------------------------------------------------
COPY --chown=node:node package*.json ./
RUN npm ci --omit=dev --prefer-online --no-audit --no-fund \
    || (npm cache clean --force && npm ci --omit=dev --no-audit --no-fund)

# ---------------------------------------------------------------------
# Step 9: Copy compiled dist from builder.
# ---------------------------------------------------------------------
COPY --from=builder --chown=node:node /app/dist ./dist

# ---------------------------------------------------------------------
# Step 10: Expose port (informational).
# ---------------------------------------------------------------------
EXPOSE 3000

# ---------------------------------------------------------------------
# Step 11: Healthcheck.
# ---------------------------------------------------------------------
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD curl -fsS http://localhost:3000/ready || exit 1

# ---------------------------------------------------------------------
# Step 12: Start the app.
# ---------------------------------------------------------------------
CMD ["node", "dist/main.js"]
