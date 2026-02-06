# syntax=docker/dockerfile:1.7
FROM node:20-alpine AS build

ARG NPM_REGISTRY=""
ARG NPM_FETCH_RETRIES=5

WORKDIR /app
COPY package*.json ./

RUN --mount=type=cache,target=/root/.npm \
    set -eux; \
    if [ -n "$NPM_REGISTRY" ]; then npm config set registry "$NPM_REGISTRY"; fi; \
    npm config set fetch-retries "$NPM_FETCH_RETRIES"; \
    npm config set fetch-retry-mintimeout 20000; \
    npm config set fetch-retry-maxtimeout 120000; \
    npm ci --prefer-offline --no-audit

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
# nginx 설정은 compose에서 마운트
