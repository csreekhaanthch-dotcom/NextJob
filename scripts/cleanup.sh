#!/bin/bash
# Cleanup script to remove pnpm artifacts and ensure npm usage

echo "Starting cleanup process..."

# Remove pnpm lockfile if it exists
if [ -f "pnpm-lock.yaml" ]; then
  echo "Removing pnpm-lock.yaml..."
  rm pnpm-lock.yaml
  echo "pnpm-lock.yaml removed"
fi

# Remove any pnpm-related files
if [ -d "node_modules/.pnpm" ]; then
  echo "Removing pnpm node_modules cache..."
  rm -rf node_modules/.pnpm
fi

# For backend directory
if [ -d "backend" ]; then
  if [ -f "backend/pnpm-lock.yaml" ]; then
    echo "Removing backend/pnpm-lock.yaml..."
    rm backend/pnpm-lock.yaml
  fi
  
  if [ -d "backend/node_modules/.pnpm" ]; then
    echo "Removing backend pnpm node_modules cache..."
    rm -rf backend/node_modules/.pnpm
  fi
fi

echo "Cleanup completed successfully!"