# Stage 1: Build & Dependencies
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files for dependency caching
COPY package.json package-lock.json* ./

# Install production dependencies only
RUN npm ci --omit=dev

# Stage 2: Production runtime
FROM node:22-alpine

WORKDIR /app

# Copy only production node_modules from builder stage
COPY --from=builder /app/node_modules ./node_modules

# Copy the application source code
COPY . .

# Set running environment
ENV NODE_ENV=production

# Expose API port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
