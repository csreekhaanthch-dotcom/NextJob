#!/bin/bash
# Build script for Render deployment

echo "Starting build process..."

# Remove any pnpm files that might confuse the build
echo "Cleaning up pnpm files..."
rm -f pnpm-lock.yaml

# Install frontend dependencies
echo "Installing frontend dependencies with npm..."
npm install

# Install backend dependencies
echo "Installing backend dependencies with npm..."
cd backend
npm install
cd ..

# Build frontend
echo "Building frontend..."
npm run build

echo "Build completed successfully!"