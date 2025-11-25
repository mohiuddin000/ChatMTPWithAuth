# ---------- STAGE 1: install deps ----------
FROM node:20-alpine AS deps
WORKDIR /usr/src/app

# Optional: install tini for proper PID 1 handling
RUN apk add --no-cache tini

# Copy only package manifests to leverage Docker cache
COPY package*.json ./
# Install production dependencies
# Use npm ci if package-lock.json present, otherwise npm install
RUN if [ -f package-lock.json ]; then npm ci --only=production; else npm install --only=production; fi

# ---------- STAGE 2: build (if needed) ----------
FROM node:20-alpine AS builder
WORKDIR /usr/src/app

# Copy node_modules from deps stage
COPY --from=deps /usr/src/app/node_modules ./node_modules

# Copy application source
COPY . .

# If you have a build step (TypeScript / bundler), run it here.
# Uncomment if needed:
# RUN npm run build

# ---------- STAGE 3: runtime ----------
FROM node:20-alpine AS runtime
WORKDIR /usr/src/app

# Create a non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy app files and node_modules from builder
COPY --from=builder /usr/src/app ./

# Ensure .env is not baked into the image; use env vars at runtime (Render will provide them)
# Expose is optional; Render sets PORT via env var
EXPOSE 3000

# Use tini as init (installed in deps stage)
ENTRYPOINT ["/sbin/tini", "--"]

# Use npm start (ensure package.json has a start script that runs your entrypoint)
CMD ["npm", "start"]
