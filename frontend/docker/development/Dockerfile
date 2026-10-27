FROM node:24-alpine AS base

RUN apk add --no-cache libc6-compat

WORKDIR /app
ENV NODE_ENV=development
COPY package.json package-lock.json ./
RUN npm ci

EXPOSE 3000

CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0"]
