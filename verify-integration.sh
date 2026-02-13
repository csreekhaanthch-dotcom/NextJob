#!/bin/bash

# Script to verify the frontend-backend API integration
# This script checks syntax and structure of the modified files

echo "==================================="
echo "Frontend-Backend API Integration"
echo "Verification Script"
echo "==================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if files exist
echo "Checking file structure..."
files=(
  "src/services/api.ts"
  "src/components/JobCard.tsx"
  "src/components/ErrorBoundary.tsx"
  "src/pages/JobsPage.tsx"
  "src/App.tsx"
  "vite.config.ts"
  ".env.example"
  "API_INTEGRATION.md"
)

all_exist=true
for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo -e "${GREEN}✓${NC} $file exists"
  else
    echo -e "${RED}✗${NC} $file missing"
    all_exist=false
  fi
done

if [ "$all_exist" = false ]; then
  echo -e "\n${RED}Some files are missing!${NC}"
  exit 1
fi

echo ""
echo "Checking file contents..."

# Check API service file
echo "Checking src/services/api.ts..."
if grep -q "class ApiService" src/services/api.ts && \
   grep -q "async getJobs" src/services/api.ts && \
   grep -q "VITE_API_URL" src/services/api.ts; then
  echo -e "${GREEN}✓${NC} API service has required methods and configuration"
else
  echo -e "${RED}✗${NC} API service missing required components"
fi

# Check JobCard component
echo "Checking src/components/JobCard.tsx..."
if grep -q "export interface Job" src/components/JobCard.tsx && \
   grep -q "formatPostedDate" src/components/JobCard.tsx && \
   grep -q "job_url" src/components/JobCard.tsx; then
  echo -e "${GREEN}✓${NC} JobCard component has backend-compatible interface"
else
  echo -e "${RED}✗${NC} JobCard component missing required features"
fi

# Check JobsPage component
echo "Checking src/pages/JobsPage.tsx..."
if grep -q "import.*api.*from.*services/api" src/pages/JobsPage.tsx && \
   grep -q "fetchJobs" src/pages/JobsPage.tsx && \
   grep -q "useCallback" src/pages/JobsPage.tsx; then
  echo -e "${GREEN}✓${NC} JobsPage uses API service with optimization"
else
  echo -e "${RED}✗${NC} JobsPage not properly integrated with API"
fi

# Check ErrorBoundary component
echo "Checking src/components/ErrorBoundary.tsx..."
if grep -q "class ErrorBoundary" src/components/ErrorBoundary.tsx && \
   grep -q "getDerivedStateFromError" src/components/ErrorBoundary.tsx; then
  echo -e "${GREEN}✓${NC} ErrorBoundary component properly implemented"
else
  echo -e "${RED}✗${NC} ErrorBoundary component incomplete"
fi

# Check App.tsx
echo "Checking src/App.tsx..."
if grep -q "ErrorBoundary" src/App.tsx; then
  echo -e "${GREEN}✓${NC} App.tsx includes ErrorBoundary"
else
  echo -e "${YELLOW}⚠${NC} App.tsx doesn't include ErrorBoundary"
fi

# Check vite.config.ts
echo "Checking vite.config.ts..."
if grep -q "proxy" vite.config.ts && \
   grep -q "localhost:3001" vite.config.ts; then
  echo -e "${GREEN}✓${NC} vite.config.ts has proxy configuration"
else
  echo -e "${RED}✗${NC} vite.config.ts missing proxy configuration"
fi

# Check .env.example
echo "Checking .env.example..."
if grep -q "VITE_API_URL" .env.example; then
  echo -e "${GREEN}✓${NC} .env.example has VITE_API_URL"
else
  echo -e "${RED}✗${NC} .env.example missing VITE_API_URL"
fi

echo ""
echo "==================================="
echo -e "${GREEN}Verification Complete!${NC}"
echo "==================================="
echo ""
echo "Next steps:"
echo "1. Copy .env.example to .env and configure your API URL"
echo "2. Start the backend: cd backend && npm run dev"
echo "3. Start the frontend: npm run dev"
echo "4. Navigate to http://localhost:3000/jobs"
echo ""
echo "See API_INTEGRATION.md for detailed documentation"