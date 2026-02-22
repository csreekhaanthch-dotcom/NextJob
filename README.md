# NextJob - Job Board Aggregator

A modern job board aggregator that fetches job listings from 100+ companies using custom scrapers and job board APIs.

## Features

- 🔍 Real-time job search across 100+ companies and job boards
- 🏢 Direct company job listings (Stripe, Airbnb, Netflix, Shopify, and 60+ more)
- 🌐 Beautiful, responsive interface that works on all devices
- ⚡ Fast performance with intelligent caching and rate limiting
- 📱 Modern UI with Tailwind CSS and React
- 🚀 Zero-config deployment to Render
- ⚖️ Ethical scraping with legal compliance

## Job Sources

### ATS (Applicant Tracking System) Scrapers
- **Greenhouse ATS**: 50+ companies including Stripe, Airbnb, Uber, Dropbox, Coinbase, Figma, Notion, Discord, Reddit, Pinterest, Instacart, DoorDash, Plaid, Snowflake, Databricks, and more
- **Lever ATS**: 10+ companies including Netflix, Shopify, Udemy, Coursera, Wix, WeWork, and more

### Job Board APIs
- **Remotive**: Remote job listings
- **Arbeitnow**: Remote and on-site jobs
- **RemoteOK**: Remote job board
- **USAJOBS**: US Government jobs
- **Adzuna**: Extensive job database (requires API key)
- **JSearch**: Job search via RapidAPI (requires API key)

## Prerequisites

1. Node.js (version 18 or higher)
2. Optional: Adzuna API key for additional job sources (https://developer.adzuna.com)

**Note**: The application works out-of-the-box with free job sources (Greenhouse, Lever, Remotive, Arbeitnow, RemoteOK, USAJOBS). API keys are only needed for Adzuna and JSearch.

## Quick Start

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd nextjob
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Install backend dependencies:
   ```bash
   cd backend
   npm install
   cd ..
   ```

4. Get Adzuna API credentials:
   - Visit https://developer.adzuna.com
   - Sign up for a free account
   - Create an application to get your App ID and API Key

5. Configure environment variables (optional):
   - Copy `.env.example` to `.env` in the backend directory
   - Add optional API credentials:
     ```
     # Optional: Adzuna API for additional job sources
     ADZUNA_APP_ID=your_adzuna_app_id_here
     ADZUNA_API_KEY=your_adzuna_api_key_here

     # Optional: USAJOBS API key
     USAJOBS_API_KEY=your_usajobs_api_key_here

     # Optional: JSearch API key
     JSEARCH_API_KEY=your_jsearch_api_key_here

     # Scraper configuration
     ENABLE_GREENHOUSE_SCRAPER=true
     ENABLE_LEVER_SCRAPER=true
     SCRAPER_PRIORITY=2
     SCRAPER_CACHE_TTL=3600000
     LOG_LEVEL=info
     ```

**Note**: The app works without any API keys using free sources (Greenhouse, Lever, Remotive, etc.).

6. Run the development server:
   ```bash
   npm run start:dev
   ```
   
   This will start:
   - Frontend on http://localhost:3000
   - Backend on http://localhost:3001

## Deployment to Render

This application is configured for deployment to Render.com with both frontend and backend services.

### Deployment Steps

1. Fork this repository to your GitHub account
2. Sign in to Render and connect your GitHub account
3. Create a new Blueprint deployment:
   - Click "New+" → "Blueprint"
   - Select your forked repository
   - Render will automatically detect the `render.yaml` file

4. Configure environment variables (optional):
   - Go to the newly created web service for the backend
   - In the "Environment" section, you can optionally add:
     - `ADZUNA_APP_ID` and `ADZUNA_API_KEY` for Adzuna integration
     - `USAJOBS_API_KEY` for USAJOBS integration
     - `JSEARCH_API_KEY` for JSearch integration
   - The app works out-of-the-box with free sources (Greenhouse, Lever, Remotive, etc.)

### Environment Variables

**Backend (Optional):**
- `ADZUNA_APP_ID` / `ADZUNA_API_KEY`: Adzuna API credentials (optional)
- `USAJOBS_API_KEY`: USAJOBS API key (optional)
- `JSEARCH_API_KEY`: JSearch API key (optional)
- `ENABLE_GREENHOUSE_SCRAPER`: Enable/disable Greenhouse scraper (default: true)
- `ENABLE_LEVER_SCRAPER`: Enable/disable Lever scraper (default: true)
- `SCRAPER_PRIORITY`: Priority level 1-5 (default: 2)
- `SCRAPER_CACHE_TTL`: Cache TTL in milliseconds (default: 3600000)
- `LOG_LEVEL`: Log level (default: info)
- `PORT`: Port to run the server on (defaults to 10000)

### Support

For issues with:
- Deployment: Check Render documentation at https://render.com/docs
- Adzuna API: Visit https://developer.adzuna.com
- Application code: Open an issue on this repository

## Development

To run locally:

1. Backend:
   ```bash
   cd backend
   npm install
   # Create .env file with your ADZUNA_APP_ID and ADZUNA_API_KEY
   npm run dev
   ```

2. Frontend (in a separate terminal):
   ```bash
   npm install
   npm run dev
   ```

3. Or run both simultaneously:
   ```bash
   npm run start:dev
   ```

## Notes

- **Free Sources Work Out-of-the-Box**: Greenhouse (60+ companies), Lever (10+ companies), Remotive, Arbeitnow, RemoteOK, and USAJOBS all work without any API keys
- **API Keys are Optional**: Adzuna and JSearch require API keys, but the app is fully functional without them
- **Authentication and bookmarking features** are disabled in the deployed version to simplify deployment
- These features can be enabled by adding MongoDB support locally
- All job search functionality works perfectly without API keys

## API Documentation

### Main Endpoints

- `GET /api/jobs` - Search jobs across all sources
  - Query params: `search`, `location`, `page`, `limit`, `sources`, `useATS`, `priority`
- `GET /api/sources` - List available job sources
- `GET /api/ats-sources` - Get detailed ATS company information
- `GET /health` - Health check

### Example API Calls

```bash
# Search jobs from all sources
curl "http://localhost:3001/api/jobs?search=software%20engineer&location=Remote"

# Search only Greenhouse companies
curl "http://localhost:3001/api/jobs?sources=greenhouse"

# Get available sources
curl "http://localhost:3001/api/sources"

# Get ATS company list
curl "http://localhost:3001/api/ats-sources"
```

## Scraper Documentation

For detailed information about the scrapers, legal compliance, and architecture, see:

- [Scraper Documentation](backend/docs/SCRAPERS_README.md)
- [Legal & Ethical Compliance](backend/docs/scraping-compliance.md)
- [Implementation Summary](backend/docs/IMPLEMENTATION_SUMMARY.md)

## Testing

Run the scraper test suite:

```bash
cd backend
node test-scrapers.js
```

This will test all scrapers and verify API functionality.

## Legal & Ethical Scraping

This project follows ethical scraping guidelines:

- Uses official public APIs where available (Greenhouse, Lever)
- Implements rate limiting to respect server resources
- Checks and respects robots.txt
- Provides attribution to original sources
- Allows companies to opt-out

For detailed legal information, see [scraping-compliance.md](backend/docs/scraping-compliance.md).