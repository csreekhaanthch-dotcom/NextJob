#!/bin/bash

echo "=== Verifying Build Process ==="

# Check Node version
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"

# Test frontend installation
echo "Testing frontend installation..."
npm install
if [ $? -ne 0 ]; then
  echo "ERROR: Frontend installation failed"
  exit 1
fi

# Test frontend build
echo "Testing frontend build..."
npm run build
if [ $? -ne 0 ]; then
  echo "ERROR: Frontend build failed"
  exit 1
fi

echo "Frontend build successful!"

# Test backend installation
echo "Testing backend installation..."
cd backend
npm install
if [ $? -ne 0 ]; then
  echo "ERROR: Backend installation failed"
  exit 1
fi

# Test backend build
echo "Testing backend build..."
npm run build
if [ $? -ne 0 ]; then
  echo "ERROR: Backend build failed"
  exit 1
fi

echo "Backend build successful!"

echo "=== All validations passed ==="