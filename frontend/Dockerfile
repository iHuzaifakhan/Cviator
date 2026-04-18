# frontend/Dockerfile
# Multi-stage build:
#   1. "builder" installs deps and runs `next build`
#   2. "runner" copies only the needed files for a lean production image

# ---------- Stage 1: build ----------
FROM node:18-alpine AS builder
WORKDIR /app

# Install deps (cached when package.json doesn't change)
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .

# Next.js picks up NEXT_PUBLIC_* env vars at build time.
ARG NEXT_PUBLIC_API_URL=http://localhost:5000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

# ---------- Stage 2: run ----------
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy only what the runtime needs
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./

EXPOSE 3000
CMD ["npm", "start"]
