# Job Scraper Architecture Documentation

## Overview

The NextJob scraper system is a modular, extensible architecture for aggregating job listings from multiple sources including job boards, ATS platforms, and custom company career pages.

## Architecture Components

### 1. Base Scraper (`backend/src/scrapers/base.js`)

The base scraper provides common functionality for all scrapers:

- **Rate Limiting**: Token bucket algorithm to respect API rate limits
- **Caching**: In-memory LRU cache with configurable TTL (default 1 hour)
- **Error Handling**: Graceful error handling with logging
- **HTTP Fetching**: Built-in fetch with timeout and retry logic
- **Job Normalization**: Standard job data format across all sources

#### Features:
```javascript
class BaseScraper {
  constructor(options = {})
  async fetch(url, options = {})           // JSON API requests
  async fetchHTML(url, options = {})        // HTML page requests
  async checkRobotsTxt(domain)              // Respect robots.txt
  normalizeJob(job)                         // Standardize job format
  clearCache()                              // Clear cache
  getCacheStats()                           // Get cache statistics
}
```

### 2. ATS Scrapers

#### Greenhouse Scraper (`backend/src/scrapers/greenhouse.js`)

Scrapes job listings from companies using Greenhouse ATS.

- **API Endpoint**: `https://boards-api.greenhouse.io/v1/boards/{company}/jobs`
- **Rate Limit**: 60 requests per minute (1 request/second)
- **Companies**: 80+ major tech companies

**Supported Companies** (Priority 1):
- Stripe, Airbnb, Uber, Dropbox, Lyft, Square, Twilio
- Coinbase, Robinhood, Figma, Notion, Discord, Reddit
- Pinterest, Snap, Instacart, DoorDash, Plaid, Snowflake
- Databricks, CrowdStrike, HashiCorp, MongoDB, Elastic
- Datadog, Grafana Labs, ClickHouse, Supabase, Vercel, Netlify
- Cloudflare, Fly.io, Render, Railway, PlanetScale, ngrok
- Postman, GitLab, Sentry, Linear, Height, Raycast, Warp

**Supported Companies** (Priority 2):
- Canva, Pitch, Mural, Miro, Airtable, Asana, Monday, Coda
- Slack, Zoom, Webflow, Framer, Retool, Metabase, dbt Labs
- Fivetran, Segment, Amplitude, Mixpanel, PostHog, Customer.io
- Iterable, Braze, Klaviyo, Attio, Apollo, Loom, Descript
- Riverside, Otter.ai, Grammarly, Copy.ai, Jasper, Anthropic
- Stability AI, Replicate, Hugging Face, Weights & Biases, ClearML
- Dagster, Prefect, Temporal, Camunda, Confluent, Apache Kafka
- Pulsar, Redpanda, Materialize, RisingWave, Starburst, Dremio
- Trino, Monte Carlo, Bigeye, Metadata, Select Star, Secoda
- Atlan, Collibra, Alation, DataHub, Great Expectations, Soda

**Usage**:
```javascript
const { greenhouseScraper } = require('./src/scrapers/greenhouse');

// Fetch all jobs from all enabled companies
const jobs = await greenhouseScraper.fetchJobs({ query: 'engineer', location: 'remote', priority: 2 });

// Fetch jobs from specific company
const stripeJobs = await greenhouseScraper.fetchCompanyJobs('stripe');

// Get available sources
const sources = greenhouseScraper.getAvailableSources();
```

#### Lever Scraper (`backend/src/scrapers/lever.js`)

Scrapes job listings from companies using Lever ATS.

- **API Endpoint**: `https://api.lever.co/v0/postings/{company}?mode=json`
- **Rate Limit**: 60 requests per minute (1 request/second)
- **Companies**: 20+ companies

**Supported Companies** (Priority 1):
- Netflix, Shopify, Flexport

**Supported Companies** (Priority 2):
- Foursquare, Kaltura, Udemy, Coursera, Wix, WeWork
- Automattic, Acquia, Digit, Gusto, Looker, Betterment
- Wealthfront, SoFi, Chime, Hims & Hers, Ro, Forward
- Carbon Health, HubSpot

**Usage**:
```javascript
const { leverScraper } = require('./src/scrapers/lever');

// Fetch all jobs from all enabled companies
const jobs = await leverScraper.fetchJobs({ query: 'designer', location: 'San Francisco', priority: 2 });

// Fetch jobs from specific company
const netflixJobs = await leverScraper.fetchCompanyJobs('netflix');

// Get available sources
const sources = leverScraper.getAvailableSources();
```

### 3. Custom Scrapers (`backend/src/scrapers/custom/`)

Custom scrapers for major tech companies with proprietary career pages.

**Note**: Many of these companies don't provide public APIs and require headless browser scraping or have strong anti-bot measures. The current implementation returns empty arrays for these scrapers as they would require:

1. Headless browser (Puppeteer/Playwright) for JavaScript-rendered pages
2. Complex anti-bot evasion techniques
3. Legal review of terms of service

**Available Custom Scrapers**:
- **Google** (`custom/google.js`) - careers.google.com
- **Apple** (`custom/apple.js`) - jobs.apple.com
- **Meta** (`custom/meta.js`) - metacareers.com
- **Tesla** (`custom/tesla.js`) - tesla.com/careers
- **NVIDIA** (`custom/nvidia.js`) - nvidia.com/careers
- **Spotify** (`custom/spotify.js`) - lifeatspotify.com/jobs

**Usage**:
```javascript
const { customScrapers } = require('./src/scrapers/index');

// Get all custom scrapers
const scrapers = customScrapers.getAllScrapers();

// Fetch jobs from specific custom scraper
const googleJobs = await scrapers.google.fetchJobs({ query: 'developer' });
```

## Job Data Format

All scrapers normalize job data to this standard format:

```javascript
{
  id: string,              // Unique job identifier
  title: string,          // Job title
  company: string,        // Company name
  location: string,       // Job location
  description: string,    // Job description (truncated to 2000 chars)
  url: string,           // Job posting URL
  salary: string,        // Salary range (if available)
  job_type: string,      // Full-time, Part-time, Contract, etc.
  posted_at: string,     // ISO 8601 timestamp
  source: string,        // Source name (e.g., "Greenhouse", "Lever")
  is_remote: boolean,    // Whether job is remote
  tags: string[]         // Array of tags/categories
}
```

## Configuration

### Company Configuration (`backend/config/companies.js`)

Companies are organized by ATS type with priority levels:

```javascript
{
  greenhouse: [
    { name: 'Stripe', board: 'stripe', enabled: true, priority: 1 },
    // ...
  ],
  lever: [
    { name: 'Netflix', board: 'netflix', enabled: true, priority: 1 },
    // ...
  ],
  custom: [
    { name: 'Google', url: 'https://careers.google.com/jobs', enabled: true, priority: 3 },
    // ...
  ]
}
```

**Priority Levels**:
- **1**: Highest priority companies (major tech companies)
- **2**: Medium priority companies (SaaS, tools, etc.)
- **3**: Lower priority companies (may be disabled or require custom handling)

**To enable/disable a company**:
```javascript
{ name: 'CompanyName', board: 'company-board', enabled: false, priority: 2 }
```

## API Endpoints

### GET /api/jobs

Fetch jobs from multiple sources.

**Query Parameters**:
- `search`: Search query string
- `location`: Location filter
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 20, max: 100)
- `sources`: Comma-separated list of sources (default: 'adzuna,remotive,arbeitnow,greenhouse,lever')
  - Available sources: `adzuna`, `remotive`, `arbeitnow`, `remoteok`, `usajobs`, `jsearch`, `greenhouse`, `lever`, `custom`, `google`, `apple`, `meta`, `tesla`, `nvidia`, `spotify`
- `useATS`: Enable/disable ATS scrapers (default: 'true')
- `useCustom`: Enable/disable custom scrapers (default: 'true')

**Example Requests**:
```bash
# Fetch from all sources
GET /api/jobs?search=software%20engineer&location=remote

# Fetch only from Greenhouse
GET /api/jobs?sources=greenhouse&search=frontend&limit=50

# Fetch from specific ATS companies (priority 1 only)
GET /api/jobs?sources=greenhouse,lever&priority=1

# Disable ATS scrapers, use only job boards
GET /api/jobs?useATS=false
```

**Response**:
```json
{
  "jobs": [
    {
      "id": "greenhouse-stripe-12345",
      "title": "Senior Software Engineer",
      "company": "Stripe",
      "location": "Remote",
      "description": "We're looking for...",
      "url": "https://boards.greenhouse.io/stripe/jobs/12345",
      "salary": "$200,000 - $300,000",
      "job_type": "Full-time",
      "posted_at": "2024-01-15T00:00:00.000Z",
      "posted_date": 1705276800,
      "source": "Greenhouse",
      "is_remote": true,
      "tags": ["Engineering", "Backend", "Payments"]
    }
  ],
  "total": 150,
  "page": 1,
  "totalPages": 8
}
```

### GET /api/sources

Get available job sources and their status.

**Response**:
```json
{
  "sources": {
    "remotive": { "name": "Remotive", "configured": true, "free": true, "category": "job-board" },
    "greenhouse": {
      "name": "Greenhouse",
      "configured": true,
      "free": true,
      "category": "ats",
      "description": "80+ companies including Stripe, Airbnb, Uber, Dropbox",
      "companies": 82
    },
    "lever": {
      "name": "Lever",
      "configured": true,
      "free": true,
      "category": "ats",
      "description": "20+ companies including Netflix, Shopify",
      "companies": 20
    },
    "custom": {
      "name": "Custom",
      "configured": true,
      "free": true,
      "category": "custom",
      "description": "Major tech companies with custom career pages",
      "companies": 6
    }
  }
}
```

### GET /api/ats-sources

Get detailed information about ATS companies.

**Response**:
```json
{
  "atsSources": {
    "greenhouse": {
      "name": "Greenhouse ATS",
      "companies": [
        { "name": "Stripe", "board": "stripe", "enabled": true, "priority": 1 },
        { "name": "Airbnb", "board": "airbnb", "enabled": true, "priority": 1 }
      ],
      "total": 82
    },
    "lever": {
      "name": "Lever ATS",
      "companies": [
        { "name": "Netflix", "board": "netflix", "enabled": true, "priority": 1 },
        { "name": "Shopify", "board": "shopify", "enabled": true, "priority": 1 }
      ],
      "total": 20
    }
  }
}
```

## Rate Limiting

All scrapers implement rate limiting to respect API constraints:

| Scraper Type | Rate Limit | Algorithm |
|-------------|-----------|-----------|
| Greenhouse   | 60 req/min | Token bucket |
| Lever        | 60 req/min | Token bucket |
| Custom       | 30 req/min | Token bucket |

Rate limiting is automatic and transparent - no manual configuration needed.

## Caching

All scrapers use in-memory caching to reduce API calls:

- **Default TTL**: 1 hour (3600 seconds)
- **Cache Type**: LRU (Least Recently Used)
- **Scope**: Per-scraper cache

To clear cache:
```javascript
await greenhouseScraper.clearCache();
```

To get cache stats:
```javascript
const stats = greenhouseScraper.getCacheStats();
// { size: 150, ttl: 3600000 }
```

## Error Handling

All scrapers implement graceful error handling:

- Failed requests return empty arrays (don't crash the server)
- Errors are logged with detailed information
- Failed scrapers don't affect other sources
- Timeouts are handled gracefully

## Adding New Scrapers

### Adding a New ATS Company

1. Add company to `backend/config/companies.js`:
```javascript
greenhouse: [
  { name: 'NewCompany', board: 'newcompany', enabled: true, priority: 2 }
]
```

2. No code changes needed - the scraper will automatically pick up the new company.

### Adding a New Custom Scraper

1. Create new scraper file in `backend/src/scrapers/custom/`:
```javascript
const { BaseScraper, RateLimiter, logger } = require('../base');

class NewCompanyScraper extends BaseScraper {
  constructor(options = {}) {
    super({
      name: 'NewCompany',
      baseUrl: 'https://careers.newcompany.com',
      ...options,
    });

    this.rateLimiter = new RateLimiter(30, 60000);
  }

  async fetchJobs(options = {}) {
    // Implement scraping logic
    return [];
  }

  normalizeJob(job) {
    return {
      id: `newcompany-${job.id}`,
      title: job.title,
      company: 'NewCompany',
      // ... other fields
    };
  }
}

module.exports = {
  NewCompanyScraper,
  scraper: new NewCompanyScraper(),
};
```

2. Update `backend/src/scrapers/index.js`:
```javascript
const { NewCompanyScraper, scraper: newcompanyScraper } = require('./custom/newcompany');

module.exports = {
  // ... existing exports
  NewCompanyScraper,
  newcompanyScraper,

  getAllScrapers() {
    return {
      // ... existing scrapers
      newcompany: newcompanyScraper,
    };
  }
};
```

3. Add company to config:
```javascript
custom: [
  { name: 'NewCompany', url: 'https://careers.newcompany.com', enabled: true, priority: 3 }
]
```

## Testing

Run the scraper test suite:

```bash
cd backend
npm test
```

To test individual scrapers:

```bash
node -e "
const { greenhouseScraper } = require('./src/scrapers/greenhouse');
greenhouseScraper.fetchJobs({ query: 'engineer', limit: 5 })
  .then(jobs => console.log(jobs))
  .catch(console.error);
"
```

## Performance Optimization

1. **Parallel Fetching**: All sources are fetched in parallel using Promise.allSettled
2. **Caching**: Repeated requests use cached data
3. **Rate Limiting**: Automatic backoff prevents rate limit errors
4. **Deduplication**: Jobs are deduplicated across sources

## Troubleshooting

### Common Issues

**Issue**: No jobs returned from a source
- Check if the source is enabled in `backend/config/companies.js`
- Check logs for error messages
- Verify rate limits aren't being exceeded

**Issue**: Rate limit errors
- The rate limiter should handle this automatically
- Check if multiple instances are running
- Increase rate limit in scraper constructor if needed

**Issue**: Old job data
- Clear cache: `await scraper.clearCache()`
- Reduce cache TTL in scraper constructor

## Future Enhancements

1. **Headless Browser Support**: Add Puppeteer/Playwright for JavaScript-rendered pages
2. **Redis Cache**: Replace in-memory cache with Redis for distributed caching
3. **Real-time Updates**: Webhook support for immediate job updates
4. **Advanced Filtering**: More sophisticated job filtering and ranking
5. **Analytics**: Track which companies/sources are most popular

## Compliance Notes

- All scrapers respect robots.txt
- Rate limits are strictly enforced
- No personal data is collected
- Only publicly available job postings are scraped
- Companies can be easily disabled in config
