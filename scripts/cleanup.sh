#!/usr/bin/env bash

echo "=== Aggressive Cleanup Script ==="

# Remove all pnpm-related files and directories
echo "Removing pnpm files..."
find . -name "*pnpm*" -type f -delete 2>/dev/null || true
find . -name "*pnpm*" -type d -exec rm -rf {} + 2>/dev/null || true

# Remove node_modules and let npm rebuild
echo "Removing node_modules..."
rm -rf node_modules 2>/dev/null || true

# Check backend directory too
if [ -d "backend" ]; then
  echo "Cleaning backend directory..."
  cd backend
  find . -name "*pnpm*" -type f -delete 2>/dev/null || true
  find . -name "*pnpm*" -type d -exec rm -rf {} + 2>/dev/null || true
  rm -rf node_modules 2>/dev/null || true
  cd ..
fi

# Uninstall pnpm if it's installed globally
echo "Checking for global pnpm..."
if command -v pnpm >/dev/null 2>&1; then
  echo "Uninstalling global pnpm..."
  npm uninstall -g pnpm 2>/dev/null || true
fi

echo "Cleanup completed!"