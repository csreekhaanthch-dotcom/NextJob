#!/bin/bash
# Pre-build script to clean up pnpm artifacts and ensure npm usage

echo "Cleaning up pnpm artifacts..."
if [ -f "pnpm-lock.yaml" ]; then
  rm pnpm-lock.yaml
  echo "Removed pnpm-lock.yaml"
fi

echo "Using npm for dependency installation"
npm ci