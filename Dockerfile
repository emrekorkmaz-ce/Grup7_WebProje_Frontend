# Multi-stage production image for React app

# 1) Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Build static assets (API URL is injected via env at build time)
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=${REACT_APP_API_URL}
RUN npm run build

# 2) Runtime stage - lightweight static file server
FROM nginx:1.27-alpine
# Copy built assets
COPY --from=builder /app/build /usr/share/nginx/html
# Basic nginx config (serve index.html for SPA routes)
RUN printf 'server { \
  listen 3000; \
  server_name _; \
  root /usr/share/nginx/html; \
  index index.html; \
  location / { try_files $uri /index.html; } \
  location /static/ { try_files $uri =404; } \
  location /api/ { \
    proxy_pass http://campus_backend:5000; \
    proxy_http_version 1.1; \
    proxy_set_header Upgrade $http_upgrade; \
    proxy_set_header Connection 'upgrade'; \
    proxy_set_header Host $host; \
    proxy_cache_bypass $http_upgrade; \
  } \
}\n' > /etc/nginx/conf.d/default.conf
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
