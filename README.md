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

5. Update the frontend API URL:
   - In the `render.yaml` file, replace `<REPLACE_WITH_YOUR_RENDER_USERNAME>` with your Render username
   - Or update the `VITE_API_URL` environment variable in the Render dashboard after deployment

### Manual Deployment (Alternative)

If you prefer to deploy services individually:

#### Backend Deployment
1. In Render, click "New+" → "Web Service"
2. Connect to your repository
3. Set:
   - Name: `jobboard-backend`
   - Root Directory: `server`
   - Runtime: Node
   - Build Command: `npm install`
   - Start Command: `node server.js`
4. Add environment variables:
   - `RAPIDAPI_KEY` = your RapidAPI key
   - `PORT` = 10000 (or let Render use default)

#### Frontend Deployment
1. In Render, click "New+" → "Static Site"
2. Connect to your repository
3. Set:
   - Name: `jobboard-frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
4. Add environment variables:
   - `VITE_API_URL` = URL of your backend service (e.g., `https://jobboard-backend-<random>.onrender.com`)

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
   cd server
   npm install
   # Create .env file with your RAPIDAPI_KEY
   npm run dev
   ```

2. Frontend:
   ```bash
   npm install
   npm run dev
   ```

### How It Works

The application uses the JSearch RapidAPI to fetch job listings from multiple job boards including:
- LinkedIn
- Indeed
- Glassdoor
- ZipRecruiter
- And many more

The backend acts as a proxy to the JSearch API, normalizing the data and providing a consistent interface for the frontend.

### Support

For issues with:
- Deployment: Check Render documentation at https://render.com/docs
- JSearch API: Visit https://rapidapi.com/justin-WWMXsD28xVZ/api/jsearch
- Application code: Open an issue on this repository