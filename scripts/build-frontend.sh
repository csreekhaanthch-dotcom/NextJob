#!/bin/bash
# Frontend build script with cleanup

echo "Starting frontend build process..."

# Cleanup pnpm artifacts
echo "Cleaning up pnpm artifacts..."
if [ -f "pnpm-lock.yaml" ]; then
  rm pnpm-lock.yaml
  echo "Removed pnpm-lock.yaml"
fi

# Install dependencies with npm
echo "Installing dependencies with npm..."
npm install

# Build the frontend
echo "Building frontend..."
npm run build

echo "Frontend build completed successfully!"