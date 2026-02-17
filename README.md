# Job Board Aggregator

A modern job board aggregator that fetches job listings from multiple sources using the JSearch RapidAPI.

## Deployment to Render

This application is configured for deployment to Render.com with both frontend and backend services.

### Prerequisites

1. A Render account (https://render.com)
2. A RapidAPI account with JSearch API access (https://rapidapi.com/justin-WWMXsD28xVZ/api/jsearch)

### Deployment Steps

1. Fork this repository to your GitHub account
2. Sign in to Render and connect your GitHub account
3. Create a new Blueprint deployment:
   - Click "New+" → "Blueprint"
   - Select your forked repository
   - Render will automatically detect the `render.yaml` file

4. Configure environment variables:
   - Go to the newly created web service for the backend
   - In the "Environment" section, add your `RAPIDAPI_KEY`
   - The frontend will automatically use the backend URL

### Environment Variables

Backend:
- `RAPIDAPI_KEY` (required): Your RapidAPI key for JSearch API
- `PORT` (optional): Port to run the server on (defaults to 10000)

Frontend:
- `VITE_API_URL` (required): URL of your backend API

### Development

To run locally:

1. Backend:
   ```bash
   cd backend
   npm install
   # Create .env file with your RAPIDAPI_KEY
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
- JSearch API: Visit https://rapidapi.com/justin-WWMXsD28xVZ/api/jsearch
- Application code: Open an issue on this repository