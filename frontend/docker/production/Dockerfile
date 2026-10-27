# syntax=docker/dockerfile:1

####################
# Builder stage
####################
FROM node:22-alpine AS builder

RUN apk add --no-cache libc6-compat

WORKDIR /app

# Install dependencies first so layer caching works
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci

# Copy source code
COPY . .
RUN mkdir -p /app/public

# Values baked into the production build. SITE_URL is the public site origin.
ARG STRAPI_API_URL
ARG NEXT_PUBLIC_STRAPI_URL
ARG SITE_URL

ENV STRAPI_API_URL=${STRAPI_API_URL}
ENV NEXT_PUBLIC_STRAPI_URL=${NEXT_PUBLIC_STRAPI_URL}
ENV SITE_URL=${SITE_URL}
ENV NODE_ENV=production

# The build cache is not needed at runtime and is the bulk of .next.
RUN npm run build && rm -rf .next/cache

####################
# Runtime stage
####################
FROM node:22-alpine

RUN apk add --no-cache libc6-compat

WORKDIR /app

ENV NODE_ENV=production
ENV HOME=/tmp

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Install only production dependencies. These stay root-owned and readable;
# chowning them would copy the whole tree into a new layer on every build.
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev

# The server writes the image and fetch caches under .next.
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/next.config.ts ./next.config.ts

USER nextjs

EXPOSE 3000

ENV PORT=3000

CMD ["node_modules/.bin/next", "start", "-H", "0.0.0.0"]
