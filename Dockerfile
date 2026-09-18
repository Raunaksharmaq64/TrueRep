# ==========================================
# Stage 1: Build Frontend Production Bundle
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Cache package installation layer
COPY package*.json ./
RUN npm ci

# Vite build arguments for environment variables
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY

ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

# Copy project files
COPY . .

# Build production distribution into /app/dist
RUN npm run build

# ==========================================
# Stage 2: Serve with High-Performance Nginx
# ==========================================
FROM nginx:alpine

# Remove default nginx configurations
RUN rm -rf /etc/nginx/conf.d/*

# Copy custom nginx configuration with SPA fallback
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy production artifacts from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose HTTP port
EXPOSE 80

# Run nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
