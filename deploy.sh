#!/bin/bash

# JobDone Deployment Script
echo "🚀 Starting JobDone Deployment..."

# Check prerequisites
echo "🔍 Checking prerequisites..."
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed"
    exit 1
fi

# Check environment variables
echo "🔐 Checking environment variables..."
REQUIRED_VARS=("SUPABASE_URL" "SUPABASE_SERVICE_KEY")
for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Environment variable $var is not set"
        exit 1
    fi
done

echo "✅ All prerequisites met"

# Build frontend
echo "🏗️  Building frontend..."
cd frontend
npm install
npm run build
cd ..

# Deploy frontend to Cloudflare Pages would happen via GitHub Actions

# Build backend
echo "🏗️  Building backend..."
cd backend
npm install
npm run build
cd ..

# Deploy backend to Fly.io
echo "✈️  Deploying backend to Fly.io..."
fly deploy

echo "✅ Deployment completed!"
echo ""
echo "Frontend will be deployed via GitHub Actions"
echo "Backend URL: https://jobdone-api.fly.dev"
echo "Health Check: https://jobdone-api.fly.dev/health"