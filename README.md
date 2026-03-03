# NextJob - Job Board Aggregator

A modern job board aggregator that fetches job listings from 100+ companies using custom scrapers and job board APIs. Features a React frontend, Express backend, SQLite database for caching, and automated background scraping.

## ✨ Features

- 🔍 **Real-time job search** across 100+ companies and job boards
- 🏢 **Direct company job listings** from Stripe, Airbnb, Netflix, Shopify, and 100+ more
- 💾 **SQLite database** for fast, cached job retrieval
- ⏰ **Automated background scraping** with configurable schedule
- 🌐 **Beautiful, responsive interface** that works on all devices
- ⚡ **Fast performance** with intelligent caching and rate limiting
- 📱 **Modern UI** with Tailwind CSS and React
- 🚀 **Zero-config deployment** to Render
- ⚖️ **Ethical scraping** with legal compliance

## 📊 Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   React Frontend │────▶│  Express Backend │────▶│   SQLite DB     │
│    (Port 3000)   │     │   (Port 3001)    │     │   (jobs.db)     │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                               │
           ┌───────────────────┼───────────────────┐
           ▼                   ▼                   ▼
    ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
    │  Greenhouse  │   │    Lever     │   │  Job Boards  │
    │  80+ companies│   │  20+ companies│   │  (5 sources) │
    └──────────────┘   └──────────────┘   └──────────────┘
```

## 🌐 Job Sources

### ATS (Applicant Tracking System) Scrapers

#### Greenhouse ATS (80+ companies)
- **Priority 1**: Stripe, Airbnb, Dropbox, Lyft, Twilio, Coinbase, Robinhood, Figma, Discord, Reddit, Pinterest, Instacart, Databricks, CrowdStrike, MongoDB, Datadog, Cloudflare, Vercel, and more
- **Priority 2**: Canva, Asana, Slack, Zoom, Webflow, Airtable, Grammarly, and 40+ more
- **API**: Official public API at `boards-api.greenhouse.io`
- **Rate Limit**: 100 requests/minute

#### Lever ATS (20+ companies)
- **Priority 1**: Netflix, Shopify, Flexport
- **Priority 2**: Udemy, Coursera, Wix, WeWork, Automattic, Gusto, HubSpot, and more
- **API**: Official public API at `api.lever.co`
- **Rate Limit**: 60 requests/minute

### Job Board APIs
- **Remotive**: Remote jobs
- **Arbeitnow**: Remote and on-site jobs  
- **RemoteOK**: Remote job board
- **USAJOBS**: US Government jobs
- **Adzuna**: Job database (requires API key)
- **JSearch**: Job search via RapidAPI (requires API key)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm

### Installation

1. Clone and install:
```bash
git clone <repository-url>
cd nextjob
npm install
cd backend && npm install && cd ..
```

2. Configure environment (optional):
```bash
cp .env.example backend/.env
# Edit backend/.env with your API keys (optional)
```

3. Initialize database and run initial scrape:
```bash
cd backend
npm run setup
```

4. Start development servers:
```bash
# From project root
npm run start:dev
```

This starts:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## 📁 Project Structure

```
nextjob/
├── src/                      # React frontend
│   ├── app/                  # Next.js app
│   ├── components/           # UI components
│   └── ...
├── backend/                  # Express backend
│   ├── src/
│   │   ├── database/         # SQLite schema & connection
│   │   │   ├── schema.sql
│   │   │   └── connection.js
│   │   └── scrapers/         # ATS scrapers
│   │       ├── base.js       # Base scraper class
│   │       ├── greenhouse.js # Greenhouse ATS
│   │       ├── lever.js      # Lever ATS
│   │       └── custom/       # Custom company scrapers
│   ├── scripts/
│   │   ├── init-db.js        # Database init
│   │   ├── setup.js          # Complete setup
│   │   └── scheduler.js      # Background scraper
│   ├── config/
│   │   └── companies.js      # 100+ company configs
│   ├── server.js             # Express server
│   └── scraper.js            # Main scraper module
├── package.json
└── .env.example
```

## 🛠️ Backend Scripts

```bash
cd backend

# Initialize database
npm run db:init

# Run complete setup (db + initial scrape)
npm run setup

# Run one-time scrape
npm run scrape

# Start background scheduler
npm run scheduler

# Start development server
npm run dev

# Start production server
npm start
```

## 📡 API Endpoints

### Jobs
- `GET /api/jobs` - Search jobs (cached + live)
  - Query: `search`, `location`, `page`, `limit`, `sources`, `useCache`
- `POST /api/jobs` - Search with large payloads (profile matching)

### Stats & Sources
- `GET /api/stats` - Database stats (job counts, companies, sources)
- `GET /api/sources` - Available job sources
- `GET /api/ats-sources` - ATS company listings

### Admin
- `POST /api/admin/scrape` - Trigger manual scrape
  - Body: `{ secret: "ADMIN_SECRET", sources: ["greenhouse", "lever"] }`

### Health
- `GET /health` - Health check
- `GET /` - API info

### Example API Calls

```bash
# Search jobs
curl "http://localhost:3001/api/jobs?search=software%20engineer&location=Remote"

# Get database stats
curl "http://localhost:3001/api/stats"

# Get available sources
curl "http://localhost:3001/api/sources"

# Trigger manual scrape (requires ADMIN_SECRET)
curl -X POST "http://localhost:3001/api/admin/scrape" \
  -H "Content-Type: application/json" \
  -d '{"secret": "your_admin_secret", "sources": ["greenhouse"]}'
```

## ⚙️ Configuration

### Environment Variables

Create `backend/.env` from `.env.example`:

```bash
# Database
DB_PATH=./data/jobs.db

# Optional: API Keys for additional sources
ADZUNA_APP_ID=your_app_id
ADZUNA_API_KEY=your_api_key
USAJOBS_API_KEY=your_key
JSEARCH_API_KEY=your_key

# Scraper Settings
SCRAPER_PRIORITY=2              # 1=highest, 5=all companies
ENABLE_GREENHOUSE_SCRAPER=true
ENABLE_LEVER_SCRAPER=true

# Scheduler
ENABLE_SCHEDULER=true
SCRAPER_SCHEDULE=0 */6 * * *   # Every 6 hours

# Server
PORT=3001
ADMIN_SECRET=your_secret_key

# Logging
LOG_LEVEL=info
```

### Priority Levels
- **1**: Top companies (Stripe, Airbnb, Netflix, etc.)
- **2**: Priority 1 + major SaaS (40+ companies)
- **3**: Priority 1-2 + more companies
- **4-5**: All 100+ configured companies

## 🗄️ Database Schema

### Tables
- `jobs` - Cached job listings with full-text search
- `scraping_stats` - Scraping run history
- `saved_jobs` - User saved jobs
- `job_applications` - Application tracking
- `job_alerts` - Job alert configurations

### Features
- Full-text search via SQLite FTS5
- Automatic job expiration (24h default)
- Deduplication by job ID
- JSON tag storage

## 🚀 Deployment

### Render (Recommended)

1. Fork this repository
2. Connect to Render
3. Create Blueprint deployment
4. Render auto-detects `render.yaml`

The app works without any API keys using free sources.

### Environment Variables for Production

```bash
# Required
ADMIN_SECRET=<generate-strong-secret>

# Optional - for additional job sources
ADZUNA_APP_ID=<your-id>
ADZUNA_API_KEY=<your-key>

# Optional - scheduler config
ENABLE_SCHEDULER=true
SCRAPER_SCHEDULE=0 */6 * * *
```

## 🧪 Testing

```bash
cd backend

# Test all scrapers
node test-scrapers.js

# Test database
npm run db:init
```

## 📚 Documentation

- [Scraper Documentation](backend/docs/SCRAPERS_README.md) - Technical scraper details
- [Legal & Ethical Compliance](backend/docs/scraping-compliance.md) - Scraping guidelines
- [Implementation Summary](backend/docs/IMPLEMENTATION_SUMMARY.md) - Architecture details

## ⚖️ Legal & Ethical Scraping

This project follows ethical scraping practices:

- ✅ Uses official public APIs (Greenhouse, Lever)
- ✅ Implements rate limiting per source
- ✅ Respects robots.txt
- ✅ Provides source attribution
- ✅ Allows company opt-out

See [scraping-compliance.md](backend/docs/scraping-compliance.md) for details.

## 📝 Notes

- **Works Without API Keys**: All core functionality works using free sources
- **Database Persistence**: Jobs are cached in SQLite for fast retrieval
- **Background Updates**: Scheduler keeps jobs fresh automatically
- **Graceful Degradation**: Failed scrapers don't break the app
- **Configurable**: Priority levels let you control scraping scope

## 🤝 Support

- **Deployment**: https://render.com/docs
- **Adzuna API**: https://developer.adzuna.com
- **Issues**: Open an issue on this repository

---

**NextJob** - Find your next opportunity across 100+ top companies! 🚀