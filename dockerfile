# Stage 1: Build
# Uses full Node.js image to compile TypeScript
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first (Docker caches this layer)
# If package.json hasn't changed, npm install is skipped on rebuild
COPY package*.json ./
RUN npm ci --only=production

# Copy source code and compile TypeScript to JavaScript
COPY tsconfig.json ./
COPY src/ ./src/
RUN npm install -g typescript && tsc

# Stage 2: Production
# Uses minimal Node.js image - no build tools, smaller size
FROM node:20-alpine AS production

# Run as non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

WORKDIR /app

# Copy only what's needed to run the app
COPY package*.json ./
RUN npm ci --only=production

# Copy compiled JavaScript from builder stage
COPY --from=builder /app/dist ./dist

# Copy template files needed at runtime
COPY --from=builder /app/src/templates ./src/templates

# Switch to non-root user
USER nodejs

EXPOSE 3000

CMD ["node", "dist/index.js"]