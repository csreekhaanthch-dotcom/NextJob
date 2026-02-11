# JobDone Backend System

Ultra-high-performance job board aggregator backend with Elasticsearch-style search, zero-cost AI ranking, and analytics.

## Architecture Overview

6-Layer System:
1. Modular Scraper Layer
2. Extraction & Normalization Layer
3. Inverted Index Engine
4. AI Ranking Engine
5. Analytics Engine
6. Search API Layer

## Key Features

- **Sub-300ms Search**: Optimized inverted index with in-memory caching
- **Zero-Cost AI Ranking**: Heuristic-based scoring computed at ingestion time
- **Background Scraping**: Never blocks search operations
- **Scalable Design**: Roadmap to 1M+ jobs with partitioning strategy
- **No Paid Dependencies**: 100% open-source stack
- **Resume Improvement Engine**: Deterministic NLP analysis for resume optimization

## Performance Optimizations

1. **Precomputed Rankings**: All scoring happens during ingestion
2. **Efficient Indexing**: SQLite with custom indexing strategy
3. **Smart Caching**: LRU cache for hot queries
4. **Connection Pooling**: Optimized database connections
5. **Async Processing**: Non-blocking operations throughout

## Scalability Roadmap

### 0-100k Jobs
- Single SQLite database
- Basic indexing
- Single-threaded scraping

### 100k-500k Jobs
- Monthly partitioning
- Archive stale jobs (>90 days)
- Multi-threaded scraping workers

### 500k-1M Jobs
- Migration to PostgreSQL
- GIN indexes for full-text search
- Read/write database separation
- Dedicated caching layer

### 1M+ Jobs
- Horizontal sharding by date/company
- Worker pool architecture
- CDN-ready API endpoints
- Advanced caching strategies

## API Endpoints

### Search
```
GET /jobs?keyword=&location=&remote=&page=
```

### Analytics
```
GET /stats/trending
GET /stats/remote-ratio
GET /stats/top-companies
GET /stats/location-growth
```

### Resume Matching
```
POST /match
POST /match/text
```

### Resume Improvement
```
POST /resume-improve
```

Parameters:
- `resume` (multipart/form-data): Resume file (PDF, DOCX, TXT)
- `resume_text` (form-data): Plain text resume

Response:
```json
{
  "score": 85,
  "strengths": [
    "Strong use of quantifiable metrics",
    "Demonstrated leadership experience"
  ],
  "improvements": [
    "Contains 3 weak phrases that reduce impact"
  ],
  "missing_skills": [
    "kubernetes",
    "docker",
    "aws"
  ],
  "keyword_opportunities": [
    "cloud",
    "scalability",
    "performance"
  ],
  "suggested_rewrites": [
    {
      "original": "responsible for maintaining servers",
      "suggestion": "Maintained cloud infrastructure resulting in 99.9% uptime",
      "reason": "Replace weak phrase \"responsible for\" with stronger action verb"
    }
  ]
}
```

### Admin
```
POST /admin/cache/clear
```

## Environment Variables

```
PORT=3001
NODE_ENV=production
```

## Monitoring

- Response time logging
- Cache hit/miss tracking
- Worker health checks
- Database performance metrics