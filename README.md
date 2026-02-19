# NextJob - Job Board Aggregator

A modern job board aggregator that fetches job listings from multiple sources using the Adzuna API.

## Features

- 🔍 Real-time job search across thousands of listings
- 🌐 Beautiful, responsive interface that works on all devices
- ⚡ Fast performance with intelligent caching
- 📱 Modern UI with Tailwind CSS and React
- 🚀 Zero-config deployment to Render

## Prerequisites

1. Node.js (version 18 or higher)
2. An Adzuna account with API access (https://developer.adzuna.com)

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

5. Configure environment variables:
   - Copy `.env.example` to `.env` in the root directory
   - Add your Adzuna credentials:
     ```
     ADZUNA_APP_ID=your_app_id_here
     ADZUNA_API_KEY=your_api_key_here
     ```

6. Run the development server:
   ```bash
   npm run dev
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

4. Configure environment variables:
   - Go to the newly created web service for the backend
   - In the "Environment" section, add your `ADZUNA_APP_ID` and `ADZUNA_API_KEY`
   - The frontend will automatically use the backend URL

### Environment Variables

Backend:
- `ADZUNA_APP_ID` (required): Your Adzuna app ID for API access
- `ADZUNA_API_KEY` (required): Your Adzuna app key for API access
- `PORT` (optional): Port to run the server on (defaults to 10000)

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

## Notes

- Authentication and bookmarking features are disabled in the deployed version to simplify deployment
- These features can be enabled by adding MongoDB support locally
- All job search functionality works perfectly with just the Adzuna API