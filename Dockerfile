FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY backend/package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY backend/ .

# Build the application
RUN npm run build

# Expose port
EXPOSE 8080

# Start the application
CMD ["node", "dist/index.js"]