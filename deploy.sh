#!/bin/bash

echo "🚀 Deploying Job Board Aggregator to Render"

echo "📦 Building frontend..."
npm install
npm run build

echo "📦 Installing backend dependencies..."
cd server
npm install

echo "✅ Ready for Render deployment!"
echo ""
echo "To deploy to Render:"
echo "1. Push this code to your GitHub repository"
echo "2. Go to https://dashboard.render.com/"
echo "3. Create a new Blueprint deployment"
echo "4. Select your repository"
echo "5. Add your RAPIDAPI_KEY as an environment variable"
echo ""
echo "Alternatively, deploy services individually:"
echo "- Backend: Deploy as Web Service with root directory 'server'"
echo "- Frontend: Deploy as Static Site with build command 'npm install && npm run build'"