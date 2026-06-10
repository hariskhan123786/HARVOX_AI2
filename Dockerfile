# ── BUILD STAGE: CLIENT ───────────────────────────────────────────────
FROM node:20-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci --silent
COPY client/ ./
# Configure production API url during build if needed (Vite uses VITE_API_URL)
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# ── BUILD STAGE: SERVER ───────────────────────────────────────────────
FROM node:20-alpine AS server-builder
WORKDIR /app/server
RUN apk add --no-cache python3 make g++ linux-headers
COPY server/package*.json ./
RUN npm ci --only=production --silent

# ── RUN STAGE: FINAL CONTAINER ────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000

# Install runtime dependencies for node-pty (bash shell is required)
RUN apk add --no-cache bash

# Copy server production dependencies
COPY --from=server-builder /app/server/node_modules ./server/node_modules
COPY server/ ./server

# Copy built client bundle into server distribution folder
COPY --from=client-builder /app/client/dist ./server/client/dist

# Expose port and configure non-root user for security
EXPOSE 5000
RUN chown -R node:node /app
USER node

WORKDIR /app/server
CMD ["node", "server.js"]
