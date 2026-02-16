# Frontend-Backend API Integration

This document outlines the changes made to connect the frontend with the backend API.

## Changes Made

### 1. Created API Service Layer (`src/services/api.ts`)

- Implemented a comprehensive API service with TypeScript interfaces
- Handles job searching, fetching individual jobs, resume upload, and health checks
- Includes proper error handling and HTTP status code management
- Supports pagination and filtering parameters

**Key Features:**
- Environment-based API URL configuration
- Type-safe API responses
- Error handling with detailed messages
- Support for search parameters (keyword, location, remote, pagination)

### 2. Updated JobCard Component (`src/components/JobCard.tsx`)

- Updated to work with the backend Job interface
- Removed mock data dependencies
- Added dynamic logo generation with fallback
- Implemented date formatting for posted_date timestamp
- Added job type detection from tags/description
- Improved styling with hover effects
- Added "View Details" button that opens job_url

**Job Interface Changes:**
```typescript
// Old mock interface
interface Job {
  id: number;
  logo: string;
  posted: string;
  type: string;
  // ...
}

// New backend-compatible interface
interface Job {
  id: string;
  company_domain: string;
  posted_date: number; // unix timestamp
  remote: boolean;
  job_url: string;
  // ...
}
```

### 3. Updated JobsPage (`src/pages/JobsPage.tsx`)

- Replaced mock data with real API calls
- Added loading states with spinner
- Implemented error handling with retry functionality
- Added pagination support
- Integrated search functionality with debouncing
- Maintains state for search parameters

**Key Features:**
- Async data fetching with useCallback for optimization
- Error boundary with retry button
- Loading states (initial load and pagination)
- Search form with keyboard support (Enter key)
- Remote filter toggle
- Pagination controls

### 4. Added ErrorBoundary Component (`src/components/ErrorBoundary.tsx`)

- Catches and displays React errors gracefully
- Provides reload functionality
- Clean error UI with icons

### 5. Updated App.tsx

- Wrapped the entire application with ErrorBoundary
- Maintains existing routing structure

### 6. Updated Vite Configuration (`vite.config.ts`)

- Added proxy configuration for development
- Routes `/api/*` requests to `http://localhost:3001`
- Enables seamless development without CORS issues

### 7. Added Environment Configuration (`.env.example`)

- Provides template for environment variables
- Documents API URL configuration

## API Endpoints Used

### GET `/jobs`
Query Parameters:
- `keyword` (string): Search term for job title, company, or skills
- `location` (string): Filter by location
- `remote` (boolean): Filter for remote jobs
- `page` (number): Page number (default: 1)
- `limit` (number): Jobs per page (default: 20, max: 100)

Response:
```typescript
{
  jobs: Job[];
  total: number;
  page: number;
  totalPages: number;
  performance?: {
    duration_ms: number;
    cached: boolean;
  };
}
```

### GET `/jobs/:id`
Retrieves a single job by ID.

### POST `/match`
Upload a resume for job matching.

### GET `/health`
Health check endpoint.

## Setup Instructions

### 1. Environment Configuration

Create a `.env` file in the project root:
```bash
cp .env.example .env
```

Edit `.env`:
```
VITE_API_URL=http://localhost:3001
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Backend Server

```bash
cd backend
npm install
npm run dev
```

The backend should start on http://localhost:3001

### 4. Start Frontend Development Server

```bash
npm run dev
```

The frontend will start on http://localhost:3000

The Vite dev server is configured with a proxy, so API calls to `/jobs` will be automatically forwarded to `http://localhost:3001/jobs`.

### 5. Production Build

```bash
npm run build
```

For production, set the `VITE_API_URL` environment variable to your production API URL.

## Testing the Integration

### Test 1: Load Jobs Page
1. Start both frontend and backend
2. Navigate to http://localhost:3000/jobs
3. Verify jobs load from API (not mock data)
4. Check browser network tab - should see requests to `/jobs` endpoint

### Test 2: Search Functionality
1. Enter a search term (e.g., "developer")
2. Enter a location (e.g., "San Francisco")
3. Click search or press Enter
4. Verify the URL updates with query parameters
5. Verify jobs are filtered based on search criteria

### Test 3: Pagination
1. Navigate through pages using pagination controls
2. Verify the page parameter updates in the URL
3. Verify different jobs load on each page

### Test 4: Remote Filter
1. Click the "Remote" button in filters
2. Verify only remote jobs are shown
3. Toggle it off to show all jobs

### Test 5: Error Handling
1. Stop the backend server
2. Refresh the frontend
3. Verify error message displays with retry button
4. Restart the backend
5. Click retry to reload jobs

### Test 6: JobCard Details
1. Click "View Details" button on a job card
2. Verify it opens the job_url in a new tab

## Troubleshooting

### CORS Errors
- Ensure the backend has CORS properly configured
- Check that the proxy configuration in vite.config.ts is correct
- Verify VITE_API_URL in .env is correct

### API Not Loading
- Check backend server is running on port 3001
- Verify backend has job data in the database
- Check browser console for errors
- Try the health endpoint: http://localhost:3001/health

### Type Errors
- Ensure all TypeScript interfaces match between frontend and backend
- Check that the Job interface in JobCard matches the backend API response

## Future Enhancements

1. **Add Caching**: Implement client-side caching for API responses
2. **Add Debouncing**: Debounce search inputs to reduce API calls
3. **Add Loading Skeletons**: Show skeleton placeholders while loading
4. **Add Infinite Scroll**: Replace pagination with infinite scroll
5. **Add Favorites**: Allow users to save favorite jobs
6. **Add Application Tracking**: Track which jobs user has applied to

## Architecture Notes

The integration follows these principles:

1. **Separation of Concerns**: API logic separated into service layer
2. **Type Safety**: Full TypeScript support with proper interfaces
3. **Error Handling**: Comprehensive error handling at all levels
4. **User Experience**: Loading states, error messages, and retries
5. **Performance**: Optimized with useCallback and efficient re-renders
6. **Maintainability**: Clean, well-documented code with clear structure

## Files Modified/Created

### Created:
- `src/services/api.ts` - API service layer
- `src/components/ErrorBoundary.tsx` - Error boundary component
- `.env.example` - Environment variable template

### Modified:
- `src/components/JobCard.tsx` - Updated for backend API
- `src/pages/JobsPage.tsx` - Replaced mock with API calls
- `src/App.tsx` - Added ErrorBoundary
- `vite.config.ts` - Added proxy configuration

## Backend API Compatibility

The frontend is designed to work with the following backend API structure:

- Express.js server running on port 3001
- SQLite database with jobs table
- RESTful API endpoints
- CORS enabled
- Rate limiting configured
- Helmet security middleware

For more details on the backend API, see `/backend/src/api/server.ts`.