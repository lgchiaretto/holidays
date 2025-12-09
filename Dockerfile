# Build stage - using Red Hat UBI with Node.js
FROM registry.access.redhat.com/ubi9/nodejs-22:latest AS builder

# Set working directory
WORKDIR /opt/app-root/src

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Production stage
FROM registry.access.redhat.com/ubi9/nodejs-22-minimal:latest

# Set working directory
WORKDIR /opt/app-root/src

# Copy dependencies from builder
COPY --from=builder /opt/app-root/src/node_modules ./node_modules

# Copy application files
COPY package*.json ./
COPY src ./src

# Create data directory for SQLite
USER 0
RUN mkdir -p /opt/app-root/src/data && \
    chown -R 1001:0 /opt/app-root/src && \
    chmod -R g=u /opt/app-root/src
USER 1001

# Set environment variables
ENV NODE_ENV=production \
    PORT=3000 \
    DATABASE_PATH=/opt/app-root/src/data/holidays.db

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "const http = require('http'); http.get('http://localhost:3000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1); }).on('error', () => process.exit(1));"

# Start the application
CMD ["node", "src/index.js"]
