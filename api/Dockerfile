# =====================================================================
# Dockerfile for NestJS (Node 20, Debian Bookworm Slim) • Multi-stage build
# 
# Goals:
# - Small, fast, reproducible builds.
# - Keep dev tools out of the final image.
# - Secure: run as non-root, minimal packages.
# - Ensure TypeORM migrations can run in prod (copy data-source.js).
# =====================================================================

# ======================
# Stage 1: Builder
# ======================
FROM node:20-bookworm-slim AS builder

# Set working directory
WORKDIR /app

# ---------------------------------------------------------------------
# Step 1: Copy package manifests only (enables Docker cache for deps).
# ---------------------------------------------------------------------
COPY package*.json ./

# ---------------------------------------------------------------------
# Step 2: Install ALL dependencies (incl. dev).
# - npm ci → clean, reproducible, uses package-lock.json.
# - --prefer-online → ensures fresh metadata (avoids stale cache issues).
# - --no-audit/--no-fund → faster builds, no noise.
# ---------------------------------------------------------------------
RUN npm ci --prefer-online --no-audit --no-fund

# ---------------------------------------------------------------------
# Step 3: Copy only build-related config + source code.
# ---------------------------------------------------------------------
COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY src ./src
COPY data-source.ts ./          # 👈 ensure data-source.ts is compiled

# ---------------------------------------------------------------------
# Step 4: Compile (NestJS → dist/*, plus data-source.js at root).
# ---------------------------------------------------------------------
ENV NODE_ENV=production
RUN npm run build


# ======================
# Stage 2: Runner
# ======================
FROM node:20-bookworm-slim AS runner

# ---------------------------------------------------------------------
# Step 5: Runtime env vars
# ---------------------------------------------------------------------
ENV NODE_ENV=production
ENV PORT=3000

# ---------------------------------------------------------------------
# Step 6: Install curl for HEALTHCHECK, then clean up.
# ---------------------------------------------------------------------
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

# ---------------------------------------------------------------------
# Step 7: Prepare /app owned by non-root user
# ---------------------------------------------------------------------
WORKDIR /app
RUN mkdir -p /app && chown -R node:node /app

# Switch to safer non-root user
USER node

# ---------------------------------------------------------------------
# Step 8: Install ONLY production dependencies
# ---------------------------------------------------------------------
COPY --chown=node:node package*.json ./
RUN npm ci --omit=dev --prefer-online --no-audit --no-fund

# ---------------------------------------------------------------------
# Step 9: Copy compiled app + data-source.js from builder
# ---------------------------------------------------------------------
COPY --from=builder --chown=node:node /app/dist ./dist
COPY --from=builder --chown=node:node /app/data-source.js ./data-source.js   # 👈 migrations will now work

# ---------------------------------------------------------------------
# Step 10 (optional): Copy runtime assets if needed
# ---------------------------------------------------------------------
# COPY --chown=node:node public ./public
# COPY --from=builder --chown=node:node /app/src/migrations ./src/migrations

# ---------------------------------------------------------------------
# Step 11: Expose port (informational)
# ---------------------------------------------------------------------
EXPOSE 3000

# ---------------------------------------------------------------------
# Step 12: Healthcheck to monitor readiness
# ---------------------------------------------------------------------
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD curl -fsS http://localhost:3000/ready || exit 1

# ---------------------------------------------------------------------
# Step 13: Run the app
# ---------------------------------------------------------------------
CMD ["node", "dist/main.js"]
