# Job Scrapers Documentation

## Overview

NextJob now includes custom scrapers for 100+ company career pages organized by Applicant Tracking System (ATS) type. This dramatically expands our job coverage from ~6 job board APIs to 70+ direct company sources.

## Architecture

### Base Scraper Class (`src/scrapers/base.js`)

The `BaseScraper` class provides common functionality:

- **Rate Limiting**: Token bucket algorithm for respectful scraping
- **Caching**: In-memory caching with configurable TTL
- **Error Handling**: Graceful degradation and logging
- **robots.txt Checking**: Automatic compliance checking
- **User-Agent**: Proper bot identification

### ATS Scrapers

#### Greenhouse Scraper (`src/scrapers/greenhouse.js`)

Scrapes 60+ companies using Greenhouse ATS with official public API.

**Endpoint:** `https://boards-api.greenhouse.io/v1/boards/{company}/jobs`

**Companies:** Stripe, Airbnb, Uber, Dropbox, Lyft, Square, Twilio, Coinbase, Robinhood, Figma, Notion, Discord, Reddit, Pinterest, Snap, Instacart, DoorDash, Plaid, Snowflake, Databricks, CrowdStrike, Slack, Asana, Trello, Atlassian, GitLab, DigitalOcean, Heroku, and 30+ more.

**Features:**
- Official public API (no scraping needed)
- Full job descriptions and metadata
- Department and location filtering
- Salary and employment type extraction

**Rate Limit:** 100 requests per minute

#### Lever Scraper (`src/scrapers/lever.js`)

Scrapes 10+ companies using Lever ATS with official public API.

**Endpoint:** `https://api.lever.co/v0/postings/{company}?mode=json`

**Companies:** Netflix, Shopify, Foursquare, Kaltura, Udemy, Coursera, Wix, WeWork, Automattic, and more.

**Features:**
- Official public API (no scraping needed)
- JSON format responses
- Commitment and location metadata
- Team and department information

**Rate Limit:** 60 requests per minute

### Custom Scrapers

#### Google, Apple, Tesla Scrapers

Custom scrapers for companies with unique career pages.

**Status:** Implementation placeholders - requires research into specific APIs or HTML structure.

## Configuration

### Company Configuration (`config/companies.js`)

The companies configuration file lists all 100+ companies organized by ATS type:

```javascript
module.exports = {
  greenhouse: [
    { name: 'Stripe', board: 'stripe', enabled: true, priority: 1 },
    { name: 'Airbnb', board: 'airbnb', enabled: true, priority: 1 },
    // ... 50+ more
  ],
  lever: [
    { name: 'Netflix', board: 'netflix', enabled: true, priority: 1 },
    // ... 10+ more
  ],
  workday: [
    // Workday companies (disabled by default)
  ],
  custom: [
    // Custom career pages
  ],
};
```

**Properties:**
- `name`: Company display name
- `board`: ATS board identifier (for Greenhouse/Lever)
- `enabled`: Whether to scrape this company
- `priority`: Scraping priority (1=highest, 5=lowest)

### Environment Variables

See `.env.example` for configuration:

```bash
# ATS Scrapers Configuration
ENABLE_GREENHOUSE_SCRAPER=true
ENABLE_LEVER_SCRAPER=true

# Scraper Priority Level
SCRAPER_PRIORITY=2

# Scraper Cache TTL (milliseconds)
SCRAPER_CACHE_TTL=3600000

# Log Level
LOG_LEVEL=info
```

## API Usage

### Fetch Jobs from All Sources

```javascript
const jobs = await jobScraper.fetchAllJobs({
  query: 'software engineer',
  location: 'San Francisco',
  page: 1,
  sources: ['remotive', 'arbeitnow', 'greenhouse', 'lever'],
  useATS: true,
  priority: 2,
});
```

### Fetch Jobs from Specific Source

```javascript
// Fetch from Greenhouse only
const greenhouseJobs = await greenhouseScraper.fetchJobs({
  query: 'frontend',
  location: 'Remote',
  limit: 50,
});
```

### Fetch from Specific Company

```javascript
// Fetch from Stripe only
const stripeJobs = await greenhouseScraper.fetchJobs({
  company: 'Stripe',
  query: 'engineer',
  limit: 20,
});
```

### Get Available Sources

```javascript
const sources = jobScraper.getAvailableSources();
// Returns:
// {
//   greenhouse: { name: 'Greenhouse', configured: true, companies: 50 },
//   lever: { name: 'Lever', configured: true, companies: 10 },
//   ...
// }
```

### Get ATS Company Details

```javascript
const atsSources = jobScraper.getATSSources();
// Returns detailed company information for each ATS
```

## HTTP API Endpoints

### `GET /api/jobs`

Fetch jobs with filtering.

**Query Parameters:**
- `search`: Job title/keyword
- `location`: Location filter
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 20)
- `sources`: Comma-separated source list (default: includes all)
- `useATS`: Enable ATS scrapers (default: true)

**Example:**
```
GET /api/jobs?search=frontend&location=Remote&sources=greenhouse,lever
```

### `GET /api/sources`

Get available job sources.

**Response:**
```json
{
  "sources": {
    "greenhouse": {
      "name": "Greenhouse",
      "configured": true,
      "free": true,
      "category": "ats",
      "companies": 50
    },
    "lever": {
      "name": "Lever",
      "configured": true,
      "free": true,
      "category": "ats",
      "companies": 10
    }
  }
}
```

### `GET /api/ats-sources`

Get detailed ATS company information.

**Response:**
```json
{
  "atsSources": {
    "greenhouse": {
      "name": "Greenhouse ATS",
      "companies": [
        { "name": "Stripe", "board": "stripe", "enabled": true, "priority": 1 },
        { "name": "Airbnb", "board": "airbnb", enabled": true, "priority": 1 }
      ],
      "total": 50
    },
    "lever": {
      "name": "Lever ATS",
      "companies": [...],
      "total": 10
    }
  }
}
```

## Legal & Ethical Compliance

See `backend/docs/scraping-compliance.md` for detailed legal guidance.

### Key Principles

1. **Official APIs First**: Greenhouse and Lever provide official public APIs
2. **Rate Limiting**: Respect server rate limits
3. **robots.txt**: Always check and respect robots.txt
4. **Attribution**: Always link to original job posting
5. **Opt-out**: Allow companies to request exclusion

### Compliance Status

| ATS Type | Companies | Legal Status | Notes |
|----------|-----------|--------------|-------|
| Greenhouse | 60+ | ✅ Fully Legal | Official public API |
| Lever | 10+ | ✅ Fully Legal | Official public API |
| Workday | 15+ | ⚠️ Caution | Difficult to scrape |
| Custom | 20+ | ⚠️ Varies | Check each company |

## Performance Considerations

### Caching

Job listings are cached to avoid repeated API calls:

- **Greenhouse/Lever**: 1 hour cache
- **Custom pages**: 2-4 hour cache
- Configurable via `SCRAPER_CACHE_TTL`

### Rate Limiting

- **Greenhouse**: 100 requests per minute
- **Lever**: 60 requests per minute
- **Custom**: 1 request per 2 seconds

### Parallel Fetching

Jobs are fetched in parallel from multiple sources using `Promise.allSettled()`. Failed sources don't block others.

## Adding New Companies

### For Greenhouse ATS

1. Find the company's Greenhouse board URL (e.g., `boards.greenhouse.io/stripe`)
2. Add to `config/companies.js`:
   ```javascript
   { name: 'CompanyName', board: 'company-board-name', enabled: true, priority: 2 }
   ```
3. The scraper automatically handles the rest

### For Lever ATS

1. Find the company's Lever board URL (e.g., `jobs.lever.co/netflix`)
2. Add to `config/companies.js`:
   ```javascript
   { name: 'CompanyName', board: 'company-board-name', enabled: true, priority: 2 }
   ```

### For Custom Scrapers

1. Create new scraper in `src/scrapers/custom/`
2. Extend `BaseScraper` class
3. Implement `fetchJobs()` method
4. Add to `scraper.js` and `server.js`

## Troubleshooting

### Scraper Not Working

1. Check if scraper is enabled in config
2. Check logs for errors: `LOG_LEVEL=debug`
3. Verify company board name is correct
4. Check if company has job postings

### Rate Limiting Issues

1. Increase rate limits (carefully)
2. Increase cache TTL to reduce requests
3. Use priority filtering to scrape fewer companies

### Memory Issues

1. Reduce `priority` to scrape fewer companies
2. Increase cache TTL to reduce re-fetching
3. Consider implementing Redis for production

## Future Enhancements

### Phase 1 (Current) ✅
- ✅ Greenhouse scraper (60+ companies)
- ✅ Lever scraper (10+ companies)
- ✅ Base scraper infrastructure
- ✅ Rate limiting and caching
- ✅ API integration

### Phase 2 (Planned)
- ⏳ Workday scraper (requires headless browser)
- ⏳ More custom scrapers (Google, Apple, Tesla)
- ⏳ Redis caching for production
- ⏳ Background scraping with Bull queues
- ⏳ Monitoring and alerting

### Phase 3 (Future)
- ⏳ Official API partnerships (LinkedIn)
- ⏳ 3rd-party aggregation services (SerpAPI)
- ⏳ Machine learning for job matching
- ⏳ Company opt-out mechanism

## Testing

Run tests:

```bash
cd backend
npm test
```

Test specific scrapers:

```javascript
// Test Greenhouse scraper
const { greenhouseScraper } = require('./src/scrapers/greenhouse');
const jobs = await greenhouseScraper.fetchJobs({ limit: 5 });
console.log(jobs);
```

## Monitoring

### Logs

Check scraper logs:

```bash
# Run with debug logging
LOG_LEVEL=debug npm start
```

### Metrics

Monitor:
- Jobs fetched per source
- Error rates per company
- Cache hit/miss ratios
- Rate limit violations

## Support

For issues or questions:
- GitHub Issues: https://github.com/yourrepo/nextjob/issues
- Email: support@nextjob.com
- Documentation: https://docs.nextjob.com

## License

This scraper implementation follows ethical scraping guidelines. See `backend/docs/scraping-compliance.md` for legal details.
