FROM node:22-alpine

# Install build dependencies for native modules (better-sqlite3, sharp, etc.)
RUN apk add --no-cache build-base gcc autoconf automake zlib-dev libpng-dev bash vips-dev git curl su-exec

ENV NODE_ENV=production

WORKDIR /opt/app
COPY package.json package-lock.json ./
RUN npm install -g node-gyp && \
    npm config set fetch-retry-maxtimeout 600000 -g && \
    npm ci

COPY . .
RUN npm run build

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 strapi
RUN chown -R strapi:nodejs /opt/app

# Keep container root so the entrypoint can fix volume permissions, then it
# drops to the strapi user before running Strapi.
USER root
COPY docker/production/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["npm", "run", "start"]

EXPOSE 1337
