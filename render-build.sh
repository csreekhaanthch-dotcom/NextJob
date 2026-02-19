#!/bin/bash
# Build script for Render deployment

echo "Starting build process..."

# Install frontend dependencies
echo "Installing frontend dependencies..."
npm install

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend
npm install
cd ..

# Build frontend
echo "Building frontend..."
npm run build

echo "Build completed successfully!"