#!/bin/bash
# Backend build script with cleanup

echo "Starting backend build process..."

# Navigate to backend directory
cd backend

# Cleanup pnpm artifacts
echo "Cleaning up pnpm artifacts..."
if [ -f "pnpm-lock.yaml" ]; then
  rm pnpm-lock.yaml
  echo "Removed pnpm-lock.yaml"
fi

# Install dependencies with npm
echo "Installing dependencies with npm..."
npm install

# Build the backend
echo "Building backend..."
npm run build

echo "Backend build completed successfully!"