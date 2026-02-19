# NextJob Backend Dockerfile
# Multi-stage build for production deployment

FROM node:25-alpine AS builder
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci
COPY backend/ .

FROM node:25-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/src ./src
RUN mkdir -p data
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1
CMD ["node", "src/server.js"]
