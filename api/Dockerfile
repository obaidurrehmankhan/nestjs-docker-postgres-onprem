# =====================================================================
# Dockerfile for NestJS (Node 20, Debian Bookworm Slim) • Multi-stage build
# 
# Goal:
# - Keep the final image SMALL, FAST, and SECURE.
# - Use one stage to build (with all dev tools), and another stage
#   to run (with only production dependencies).
# =====================================================================

# ======================
# Stage 1: Builder
# ======================
# This stage has everything needed to:
#   1. Install ALL dependencies (incl. devDeps like TypeScript).
#   2. Compile the NestJS app (TS → JS).
#   3. Output compiled code into /dist.
FROM node:20-bookworm-slim AS builder

# Set working directory inside the container
WORKDIR /app

# ---------------------------------------------------------------------
# Step 1: Copy only package.json + package-lock.json first.
# Why? Docker caches layers. If only code changes (not deps), this layer
# will be reused → faster builds.
# ---------------------------------------------------------------------
COPY package*.json ./

# ---------------------------------------------------------------------
# Step 2: Install ALL dependencies (including dev).
# - npm ci → clean & reproducible install based on package-lock.json.
# - --prefer-online → ensures it fetches fresh metadata (avoids stale versions like old cross-spawn).
# - --no-audit / --no-fund → skips npm audit & funding messages for speed.
# ---------------------------------------------------------------------
RUN npm ci --prefer-online --no-audit --no-fund

# ---------------------------------------------------------------------
# Step 3: Copy only the files needed to build the app (not node_modules).
# Keeps caching efficient → only invalidates build step when configs change.
# ---------------------------------------------------------------------
COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY src ./src

# ---------------------------------------------------------------------
# Step 4: Compile the app (NestJS build → dist/main.js).
# NODE_ENV=production here helps some libs optimize during build.
# ---------------------------------------------------------------------
ENV NODE_ENV=production
RUN npm run build


# ======================
# Stage 2: Runner
# ======================
# This stage is the "real" image that runs in production.
# It is:
#   - much smaller (no TypeScript, no devDeps, no build tools).
#   - secure (runs as non-root).
# ======================
FROM node:20-bookworm-slim AS runner

# ---------------------------------------------------------------------
# Step 5: Set environment variables for runtime.
# - NODE_ENV=production → tells libs (like Express, Nest) to optimize.
# - PORT=3000 → default port your NestJS app listens on.
# ---------------------------------------------------------------------
ENV NODE_ENV=production
ENV PORT=3000

# ---------------------------------------------------------------------
# Step 6: Install curl for HEALTHCHECK (to ping /ready endpoint).
# We install only curl, then clean apt cache → keeps image slim.
# ---------------------------------------------------------------------
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

# ---------------------------------------------------------------------
# Step 7: Set up /app folder and change ownership to the "node" user.
# ---------------------------------------------------------------------
WORKDIR /app
RUN mkdir -p /app && chown -R node:node /app

# ---------------------------------------------------------------------
# Step 8: Drop root privileges → run as safer non-root user "node".
# ---------------------------------------------------------------------
USER node

# ---------------------------------------------------------------------
# Step 9: Install ONLY production dependencies.
# - Copy package.json + lockfile first.
# - npm ci --omit=dev → installs only what's needed at runtime.
# - Same flags (--prefer-online, --no-audit, --no-fund) for freshness & speed.
# ---------------------------------------------------------------------
COPY --chown=node:node package*.json ./
RUN npm ci --omit=dev --prefer-online --no-audit --no-fund

# ---------------------------------------------------------------------
# Step 10: Copy the compiled app (dist/) from builder stage.
# ---------------------------------------------------------------------
COPY --from=builder --chown=node:node /app/dist ./dist

# ---------------------------------------------------------------------
# Step 11 (optional): Copy runtime assets if your app needs them
#   e.g., static files, views, migrations.
# Uncomment if needed.
# ---------------------------------------------------------------------
# COPY --chown=node:node public ./public
# COPY --from=builder --chown=node:node /app/src/migrations ./src/migrations

# ---------------------------------------------------------------------
# Step 12: Document the exposed port (informational only).
# Docker Compose or k8s maps it explicitly; EXPOSE is a hint.
# ---------------------------------------------------------------------
EXPOSE 3000

# ---------------------------------------------------------------------
# Step 13: Add container-level healthcheck.
# Docker will periodically run this command:
#   → curl http://localhost:3000/ready
# If it fails, Docker marks the container unhealthy.
# ---------------------------------------------------------------------
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD curl -fsS http://localhost:3000/ready || exit 1

# ---------------------------------------------------------------------
# Step 14: Start the NestJS app.
# We directly run Node with the compiled entrypoint.
# ---------------------------------------------------------------------
CMD ["node", "dist/main.js"]
