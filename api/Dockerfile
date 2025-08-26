# Dockerfile (NestJS • Node 20 bookworm-slim • multi-stage)

# Stage 1: Builder — install deps (incl. dev), compile TypeScript to dist/
FROM node:20-bookworm-slim AS builder

# Create working folder inside the container
WORKDIR /app

# 1) Copy only lockfiles first → best layer caching
#    If package.json or package-lock.json didn't change, Docker reuses the cached npm ci layer.
COPY package*.json ./

# 2) Install EXACT dependencies (including dev) for a reproducible build
#    npm ci uses package-lock.json and fails if it doesn't match → stable builds.
#    ✅ Ensure package-lock.json is committed to your repo, otherwise build will fail here.
RUN npm ci

# 3) Copy the minimal files needed to build the app
#    (Adjust if you use additional configs)
COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY src ./src

# 4) Build the app
#    We can set NODE_ENV=production here, but since devDependencies
#    are already installed, TypeScript/Nest build still works.
ENV NODE_ENV=production
RUN npm run build


# Stage 2: Runner — small, secure, non-root container with production deps only
FROM node:20-bookworm-slim AS runner

# 5) Runtime environment is production
ENV NODE_ENV=production
ENV PORT=3000

# 6) Install curl for the HEALTHCHECK
#    Keep image small: no recommends + clean apt cache
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

# 7) Create work directory and give it to the non-root "node" user
WORKDIR /app
RUN mkdir -p /app && chown -R node:node /app

# 8) Switch to the safer non-root user that ships with the official Node image
USER node

# 9) Install ONLY production dependencies in the final image
#    Copy lockfiles first to leverage cache; install as non-root inside /app.
#    ⚠️ This assumes your package.json is structured correctly (build output doesn’t need devDeps).
#    If you see runtime errors (missing modules), remove --omit=dev to keep all deps.
COPY --chown=node:node package*.json ./
RUN npm ci --omit=dev

# 10) Bring the built JS (dist/) from the builder stage
COPY --from=builder --chown=node:node /app/dist ./dist

# 11) (Optional) If you have runtime assets (public/, views/, migrations/), copy them here:
# COPY --chown=node:node public ./public
# COPY --from=builder --chown=node:node /app/src/migrations ./src/migrations

# 12) Document the port the app listens on (helps tools; doesn’t publish)
EXPOSE 3000

# 13) Add a container healthcheck that pings your readiness endpoint
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD curl -fsS http://localhost:3000/ready || exit 1

# 14) Start the compiled NestJS app
CMD ["node", "dist/main.js"]
