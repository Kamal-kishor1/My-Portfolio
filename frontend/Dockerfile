FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_API_URL=http://localhost:8002
ARG VITE_APP_NAME=Portfolio
ARG VITE_ENVIRONMENT=production
ENV VITE_API_URL=$VITE_API_URL VITE_APP_NAME=$VITE_APP_NAME VITE_ENVIRONMENT=$VITE_ENVIRONMENT
RUN npm run build

FROM nginxinc/nginx-unprivileged:1.27-alpine AS runner
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 CMD wget -q -O /dev/null http://127.0.0.1:3001/healthz || exit 1
