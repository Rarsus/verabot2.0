# Stage 1: Build React frontend
FROM node:18-alpine AS frontend-build
WORKDIR /app/dashboard
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Setup Node.js backend
FROM node:18-alpine AS backend
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci --only=production
COPY server/ .

# Stage 3: Final production image
FROM node:18-alpine
WORKDIR /app

# Install dependencies for serving
RUN apk add --no-cache dumb-init

# Copy backend
COPY --from=backend /app/server /app/server

# Copy frontend build to the location server.js expects
COPY --from=frontend-build /app/dashboard/dist /app/dist

# Set environment
ENV NODE_ENV=production
ENV PORT=5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Expose port
EXPOSE 5000

# Run with dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server/server.js"]
