# server/Dockerfile
# Multi-stage Dockerfile for Node/Express (production-ready)

# --- STAGE 1: install all dependencies (needed if there's a build step) ---
FROM node:20-alpine AS deps
WORKDIR /usr/src/app

# small extras useful during builds
RUN apk add --no-cache bash git openssh-client ca-certificates

# copy package manifests first to leverage cache
COPY package*.json ./

# install all dependencies (dev + prod) to allow build steps that need dev deps
RUN npm ci

# --- STAGE 2: build (optional) ---
FROM node:20-alpine AS builder
WORKDIR /usr/src/app

# copy node_modules to builder
COPY --from=deps /usr/src/app/node_modules ./node_modules
# copy source
COPY . .

# If a build script exists in package.json, run it (creates dist/build)
RUN if [ -f package.json ] && grep -q '"build"' package.json; then npm run build; fi

# --- STAGE 3: runtime (small image) ---
FROM node:20-alpine AS runtime
WORKDIR /usr/src/app

# create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# copy only necessary files from builder
COPY --from=builder /usr/src/app ./

# prune dev dependencies (best-effort)
RUN npm prune --production || true

# optionally expose port (Render provides PORT via env)
EXPOSE 3000

# use tini (already in base image) as init -- helps signal handling
ENTRYPOINT ["/sbin/tini", "--"]

# command: rely on package.json "start" script (ensure it exists)
CMD ["npm", "start"]
