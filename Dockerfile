FROM node:25-alpine

WORKDIR /app

# Copy package files
COPY backend/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY backend/ .

# Create data directory
RUN mkdir -p data

# Expose port
EXPOSE 8080

# Start the application
CMD ["node", "dist/index.js"]