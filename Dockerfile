# 1) build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 2) serve
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
# nginx 설정은 compose에서 마운트할 거라 여기선 안 넣어도 됨