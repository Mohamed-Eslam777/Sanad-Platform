# Stage 1: Build the Vite React App
FROM node:18-alpine AS build

WORKDIR /app

# Copy package definitions first for layer caching
COPY package.json package-lock.json* ./

# Install all dependencies required for the build process
RUN npm ci

# Copy the rest of the source code
COPY . .

# --- Strict Refinement 1: Vite Build Args ---
# Declare ARG to accept build-time variable
ARG VITE_API_URL
# Set ENV to expose it to the Vite build process
ENV VITE_API_URL=$VITE_API_URL

# Build the application for production
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Remove default nginx config to avoid conflicts
RUN rm /etc/nginx/conf.d/default.conf

# Copy our custom SPA routing config
COPY nginx.conf /etc/nginx/conf.d/

# Copy the built Vite output from the Stage 1 'build' process
COPY --from=build /app/dist /usr/share/nginx/html

# Expose HTTP port
EXPOSE 80

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
