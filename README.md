# Job Board Aggregator

A modern job board aggregator that fetches job listings from multiple sources using the Adzuna API.

## Deployment to Render

This application is configured for deployment to Render.com with both frontend and backend services.

### Prerequisites

1. A Render account (https://render.com)
2. An Adzuna account with API access (https://developer.adzuna.com)

### Deployment Steps

1. Fork this repository to your GitHub account
2. Sign in to Render and connect your GitHub account
3. Create a new Blueprint deployment:
   - Click "New+" → "Blueprint"
   - Select your forked repository
   - Render will automatically detect the `render.yaml` file

4. Configure environment variables:
   - Go to the newly created web service for the backend
   - In the "Environment" section, add your `ADZUNA_APP_ID` and `ADZUNA_APP_KEY`
   - The frontend will automatically use the backend URL

### Environment Variables

Backend:
- `ADZUNA_APP_ID` (required): Your Adzuna app ID for API access
- `ADZUNA_APP_KEY` (required): Your Adzuna app key for API access
- `PORT` (optional): Port to run the server on (defaults to 10000)

Frontend:
- `VITE_API_URL` (required): URL of your backend API

### Development

To run locally:

1. Backend:
   ```bash
   cd backend
   npm install
   # Create .env file with your ADZUNA_APP_ID and ADZUNA_APP_KEY
   npm run dev
   ```

2. Frontend:
   ```bash
   pnpm install
   pnpm run dev
   ```

### Support

For issues with:
- Deployment: Check Render documentation at https://render.com/docs
- Adzuna API: Visit https://developer.adzuna.com
- Application code: Open an issue on this repository