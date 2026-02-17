#!/usr/bin/env bash

echo "=== Fixing deployment issues ==="

# Remove any pnpm-related files that might confuse Render
echo "Removing pnpm artifacts..."
rm -f pnpm-lock.yaml 2>/dev/null || true
rm -f pnpm-workspace.yaml 2>/dev/null || true
rm -f .pnpmfile.cjs 2>/dev/null || true

# Remove any existing node_modules to start fresh
echo "Removing node_modules..."
rm -rf node_modules 2>/dev/null || true

# If we're in the backend directory, do the same there
if [ -d "backend" ]; then
  echo "Cleaning backend directory..."
  cd backend
  rm -f pnpm-lock.yaml 2>/dev/null || true
  rm -rf node_modules 2>/dev/null || true
  cd ..
fi

echo "Deployment fix completed!"