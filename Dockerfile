# syntax=docker/dockerfile:1.7
FROM node:20-alpine AS build

ARG NPM_REGISTRY=""
ARG NPM_FETCH_RETRIES=5
ARG VITE_GOOGLE_CLIENT_ID=""
ARG VITE_API_BASE_URL=""
ARG VITE_APP_ENV="PROD"

ENV VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID}
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_APP_ENV=${VITE_APP_ENV}

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
