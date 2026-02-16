#!/usr/bin/env bash

echo "Cleaning up pnpm artifacts..."

# Remove pnpm files if they exist
if [ -f "pnpm-lock.yaml" ]; then
  echo "Removing pnpm-lock.yaml..."
  rm pnpm-lock.yaml
fi

if [ -d "node_modules/.pnpm" ]; then
  echo "Removing pnpm node_modules cache..."
  rm -rf node_modules/.pnpm
fi

# Check backend directory too
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

echo "PNPM cleanup completed!"