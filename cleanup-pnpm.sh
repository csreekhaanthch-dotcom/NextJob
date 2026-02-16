#!/bin/bash
# Remove pnpm lock file if it exists
if [ -f "pnpm-lock.yaml" ]; then
  rm pnpm-lock.yaml
  echo "Removed pnpm-lock.yaml"
fi

echo "Cleanup complete"