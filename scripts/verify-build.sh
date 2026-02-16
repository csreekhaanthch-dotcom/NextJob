#!/bin/bash

echo "Verifying builds..."

# Verify frontend build
echo "Verifying frontend build..."
if pnpm run build; then
  echo "Frontend build succeeded!"
else
  echo "Frontend build failed!"
  exit 1
fi

# Verify backend build
echo "Verifying backend build..."
cd backend
if npm run build; then
  echo "Backend build succeeded!"
else
  echo "Backend build failed!"
  exit 1
fi

# Check if dist files exist
if [ -d "../dist" ] && [ -d "dist" ]; then
  echo "Build verification successful!"
else
  echo "Build verification failed - dist directories missing!"
  exit 1
fi