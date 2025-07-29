# syntax=docker/dockerfile:1
FROM oven/bun:1.1-alpine AS base
WORKDIR /app

# Development stage
FROM base AS dev
# Install development dependencies
RUN apk add --no-cache git
# Copy package files
COPY services/plane-event-dispatcher/package.json services/plane-event-dispatcher/bun.lockb* ./
# Copy shared packages
COPY packages /packages
# Install dependencies
RUN bun install --frozen-lockfile
# Copy source
COPY services/plane-event-dispatcher/src ./src
COPY services/plane-event-dispatcher/tsconfig.json ./
# Start with hot reload
CMD ["bun", "run", "--watch", "src/index.ts"]

# Dependencies stage
FROM base AS deps
COPY services/plane-event-dispatcher/package.json services/plane-event-dispatcher/bun.lockb* ./
COPY packages /packages
RUN bun install --frozen-lockfile --production

# Build stage
FROM base AS build
COPY services/plane-event-dispatcher/package.json services/plane-event-dispatcher/bun.lockb* ./
COPY packages /packages
RUN bun install --frozen-lockfile
COPY services/plane-event-dispatcher/src ./src
COPY services/plane-event-dispatcher/tsconfig.json ./
RUN bun build src/index.ts --target bun --outdir dist

# Production stage
FROM base AS production
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /packages /packages
EXPOSE 3000
CMD ["bun", "run", "dist/index.js"]