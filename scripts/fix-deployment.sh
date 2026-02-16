#!/bin/bash

echo "Fixing deployment issues..."

# Fix backend dependencies
echo "Fixing backend dependencies..."
cd backend
npm install @types/node @types/express @types/cors typescript @supabase/supabase-js
npm run build
cd ..

# Fix frontend dependencies
echo "Fixing frontend dependencies..."
pnpm add @supabase/supabase-js tsx
pnpm install --no-frozen-lockfile

echo "Deployment issues fixed!"