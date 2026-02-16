#!/usr/bin/env bash

# Exit on error
set -e

echo "Starting Render build process..."

# Check if we're in the right directory
if [ -f "package.json" ]; then
  echo "Building frontend..."
  npm install
  npm run build
elif [ -f "backend/package.json" ]; then
  echo "Building backend..."
  cd backend
  npm install
  npm run build
  cd ..
else
  echo "Error: No package.json found"
  exit 1
fi

echo "Build process completed successfully!"