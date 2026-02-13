# Render Deployment Guide

## Overview

This guide covers deploying the JobDone backend to Render.com. The application was originally designed for Fly.io, but can be deployed to Render with the configuration provided.

## Prerequisites

- Render account
- GitHub repository connected to Render
- Supabase project configured (for database and storage)

## Configuration

### 1. Using render.yaml (Recommended)

The repository includes a `render.yaml` file that defines the backend service configuration:

```yaml
services:
  - type: web
    name: jobdone-backend
    env: node
    region: oregon
    plan: free
    buildCommand: cd backend && npm install && npm run build
    startCommand: cd backend && npm start
    envVars:
      - key: NODE_VERSION
        value: 18
      - key: SUPABASE_URL
        sync: false
      - key: SUPABASE_SERVICE_KEY
        sync: false
      - key: PORT
        value: 3001
    healthCheckPath: /health
```

**To deploy:**
1. In Render Dashboard, select "New" → "Blueprint"
2. Connect your GitHub repository
3. Render will automatically detect the `render.yaml` file
4. Add environment variables in the Render dashboard
5. Deploy!

### 2. Manual Configuration

If not using the Blueprint:

**Service Settings:**
- **Type:** Web Service
- **Environment:** Node
- **Region:** Oregon (or closest to your users)
- **Branch:** main (or your default branch)
- **Build Command:** `cd backend && npm install && npm run build`
- **Start Command:** `cd backend && npm start`

**Environment Variables:**
- `NODE_VERSION`: `18`
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_KEY`: Your Supabase service role key
- `PORT`: `3001` (or Render's default)

**Health Check:**
- Path: `/health`

## Build Fix

### Issue
Previous versions had TypeScript type definition packages (`@types/*`) in `devDependencies`, which weren't installed during production builds, causing errors like:

```
error TS7016: Could not find a declaration file for module 'express'
error TS7016: Could not find a declaration file for module 'multer'
error TS7016: Could not find a declaration file for module 'cors'
```

### Solution
All TypeScript type definitions and TypeScript itself have been moved to `dependencies` in `backend/package.json`. This ensures they're always available during the build process, regardless of the environment or build settings.

**Changes made:**
- Moved all `@types/*` packages from `devDependencies` to `dependencies`
- Moved `typescript` from `devDependencies` to `dependencies`
- Kept only `ts-node` in `devDependencies` (only needed for local development)

## Troubleshooting

### Build Fails with TypeScript Errors

If you see TypeScript compilation errors during build:
1. Ensure all `@types/*` packages are in `dependencies` (not `devDependencies`)
2. Check that `typescript` is in `dependencies`
3. Run `npm install` to ensure all packages are installed
4. Try building locally: `cd backend && npm run build`

### Type Definition Errors

If you still see "Could not find a declaration file" errors:
- Verify the package.json changes were committed and pushed
- Clear Render's build cache (Settings → Build & Deploy → Clear Build Cache)
- Trigger a new deployment

### Alternative Build Commands

If the standard build command doesn't work:

**Option 1 - Explicit dev dependencies:**
```bash
cd backend && npm install --include=dev && npm run build
```

**Option 2 - Using npm ci:**
```bash
cd backend && npm ci && npm run build
```

**Option 3 - Disable production mode:**
```bash
cd backend && NODE_ENV=development npm install && npm run build
```

## Database & Storage

The backend requires:
- **Supabase Postgres**: For user data, analytics, and personalization
- **Supabase Storage**: For resume uploads
- **SQLite**: For local job search index (included)

Ensure your Supabase environment variables are configured in Render.

## Post-Deployment

After successful deployment:
1. Test the health endpoint: `https://your-app.onrender.com/health`
2. Verify database connectivity
3. Test resume upload functionality
4. Check logs for any runtime errors

## Performance Notes

- **Cold Starts**: Free tier services on Render may experience cold starts
- **Caching**: The app includes LRU cache for job searches
- **Scaling**: For production, consider upgrading to a paid plan for better performance

## Support

For issues specific to:
- **Render deployment**: Check Render documentation at https://render.com/docs
- **Application code**: See main README.md and API_INTEGRATION.md
- **Database/Storage**: Refer to Supabase documentation

## Additional Resources

- [Render Node.js Documentation](https://render.com/docs/deploy-node-express-app)
- [Blueprint Spec](https://render.com/docs/blueprint-spec)
- [Environment Variables](https://render.com/docs/environment-variables)
