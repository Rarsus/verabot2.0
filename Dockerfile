# Stage 1: Build dependencies
FROM node:18-alpine AS dependencies
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Stage 2: Runtime
FROM node:18-alpine
WORKDIR /app

# Set environment
ENV NODE_ENV=production

# Create data directory for SQLite database
RUN mkdir -p /app/data

# Copy node_modules from build stage
COPY --from=dependencies /app/node_modules ./node_modules

# Copy application code
COPY package.json ./
COPY src/ ./src/
COPY scripts/ ./scripts/

# Expose API port for dashboard communication
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Run the bot
CMD ["node", "src/index.js"]
