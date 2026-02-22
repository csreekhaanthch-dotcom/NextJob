# Job Scraping - Legal & Ethical Compliance Guide

## Legal Principles

### 1. Public Data Doctrine
- Job postings are public information intended to be found by candidates
- Aggregating job listings is generally considered legal under fair use
- However, the *method* of access matters

### 2. Terms of Service (ToS) Compliance
- Always review and respect website Terms of Service
- Some sites explicitly prohibit automated scraping
- If ToS prohibits scraping, use official APIs or seek permission

### 3. robots.txt Standard
- Always check and respect robots.txt files
- robots.txt is a standard for communicating crawling preferences
- Some robots.txt entries are legally binding (e.g., EU)

### 4. Copyright Considerations
- Job postings are factual data, not creative works
- Facts themselves cannot be copyrighted
- Creative descriptions can be used under fair use for aggregation

## Ethical Best Practices

### 1. Respectful Scraping
- Rate limiting: 1 request per second minimum
- User-Agent identification: Clearly identify your bot
- No hammering: Space out requests, avoid bursts

### 2. Data Minimization
- Only collect data needed for the purpose
- Don't scrape personal information unnecessarily
- Respect privacy of applicants

### 3. Transparency
- Provide attribution (source company, posting URL)
- Allow companies to opt-out of aggregation
- Contact information for requests

## ATS (Applicant Tracking System) Categories

### Category 1: Public API Companies (✅ RECOMMENDED)
These companies provide official public APIs for job data. No scraping needed.

**Examples:**
- **Greenhouse**: `https://boards-api.greenhouse.io/v1/boards/{company}/jobs`
  - Official public API
  - No authentication required
  - Well-documented
  - 60+ major companies use this

- **Lever**: `https://api.lever.co/v0/postings/{company}?mode=json`
  - Official public API
  - No authentication required
  - JSON format
  - 10+ major companies use this

**Status:** ✅ Fully legal and recommended

### Category 2: Permissive Companies (✅ ALLOWED)
These companies don't explicitly prohibit scraping and have permissive robots.txt.

**Examples:**
- **GitHub**: jobs.github.com - Permissive robots.txt
- **Stack Overflow**: stackoverflow.com/jobs - Has API
- **Indeed**: Has API but limited free tier
- **Glassdoor**: Has API partnership program

**Status:** ✅ Generally allowed, but use rate limiting

### Category 3: Official API Required (⚠️ RESTRICTED)
These companies require API partnership. Scraping violates ToS.

**Examples:**
- **LinkedIn**: Explicitly prohibits scraping. Must use official API.
  - API requires partnership application
  - Limited free tier
  - Legal action taken against scrapers

**Status:** ❌ Do NOT scrape. Use official API only.

### Category 4: Anti-Bot Protection (⚠️ DIFFICULT)
These companies have strong anti-bot measures. Scraping may be blocked.

**Examples:**
- **Workday** (Microsoft, Amazon, Adobe, IBM, etc.)
  - JavaScript-rendered pages
  - CAPTCHA challenges
  - IP blocking
  - Session requirements

**Status:** ⚠️ Very difficult. Consider 3rd-party service or official API.

## Company-by-Company Analysis

### Greenhouse ATS (60+ Companies) ✅
These companies use Greenhouse ATS with public API. Fully legal.

**Companies:**
- Stripe, Airbnb, Uber, Dropbox, Lyft, Square, Twilio, Coinbase, Robinhood, Figma, Notion, Discord, Reddit, Pinterest, Snap, Instacart, DoorDash, Plaid, Snowflake, Databricks, CrowdStrike, Slack, Zoom, Asana, Trello, Atlassian, GitLab, DigitalOcean, Heroku, Shopify, Basecamp, 37signals, Box, Yammer, Eventbrite, Yelp, Grubhub, Postmates, Deliveroo, Just Eat, HelloFresh, Blue Apron, DraftKings, FanDuel, Betfair, Paddy Power, William Hill, Flutter Entertainment, Gamesys, Kindred Group, Bet365, 888 Holdings, Gala Coral, Ladbrokes Coral, GVC Holdings, Stars Group, Paysafe, Worldpay, Adyen, Stripe, Square, PayPal, Braintree, Venmo, Cash App

**Compliance:** ✅ Official public API
**Rate Limit:** Respect server responses (typically 100 req/min)
**robots.txt:** N/A (API endpoints not covered)

### Lever ATS (10+ Companies) ✅
These companies use Lever ATS with public API. Fully legal.

**Companies:**
- Netflix, Spotify, Foursquare, Kaltura, Udemy, Coursera, Lyft (also on Greenhouse), Eventbrite (also on Greenhouse), Wix, WeWork

**Compliance:** ✅ Official public API
**Rate Limit:** Respect server responses (typically 60 req/min)
**robots.txt:** N/A (API endpoints not covered)

### Workday ATS (15+ Companies) ⚠️
These companies use Workday ATS. Difficult to scrape.

**Companies:**
- Microsoft, Amazon, Adobe, IBM, Oracle, Salesforce, VMware, Zoom, PayPal, Hewlett Packard Enterprise, Dell, Cisco, SAP, Intel, Advanced Micro Devices (AMD), Nvidia (custom but similar)

**Compliance:** ⚠️ No public API. Scraping difficult.
**Challenges:**
- JavaScript rendering required
- Anti-bot detection
- CAPTCHA challenges
- Session management
- IP blocking

**Recommendation:** 
- Start with a few test companies
- Use headless browser (Puppeteer/Playwright)
- Implement aggressive rate limiting (1 req/5s)
- Consider 3rd-party aggregation service
- Alternative: Use company-specific RSS feeds if available

### Custom Career Pages (20+ Companies) ⚠️
These companies have custom career pages.

**Companies:**
- Google (careers.google.com), Apple (jobs.apple.com), Meta (careers.facebook.com), Tesla, Netflix (also Lever), Spotify (also Lever), Twitter, Snapchat, ByteDance, Alibaba, Tencent, Baidu, Samsung, LG, Sony, Nintendo, Epic Games, Blizzard Entertainment, Activision, Ubisoft, Electronic Arts

**Compliance:** ⚠️ Varies by company
**Recommendations:**
- Check robots.txt for each company
- Check for RSS feeds
- Check for official APIs
- Use rate limiting (1 req/sec min)
- Implement respectful scraping practices

### Official API Only (LinkedIn) ❌
**LinkedIn**: Do NOT scrape. Official API required.

**Compliance:** ❌ Scraping violates ToS
**Alternative:** Apply for LinkedIn API partnership
**Cost:** Limited free tier, paid tiers available

## Implementation Guidelines

### 1. robots.txt Checking
Before scraping any domain, always check robots.txt:

```javascript
async function checkRobotsTxt(domain) {
  try {
    const response = await fetch(`https://${domain}/robots.txt`);
    const text = await response.text();
    
    // Check if our user-agent is disallowed
    const ourUserAgent = 'NextJobBot';
    const disallowed = text
      .split('\n')
      .filter(line => line.startsWith('Disallow:'))
      .some(line => line.includes(ourUserAgent) || line.includes('*'));
    
    return { allowed: !disallowed, robotsTxt: text };
  } catch (error) {
    return { allowed: false, error: error.message };
  }
}
```

### 2. Rate Limiting
Implement rate limiting for all scrapers:

```javascript
// Greenhouse: 100 req/min recommended
// Lever: 60 req/min recommended
// Custom pages: 1 req/sec minimum
// Workday: 1 req/5 sec minimum
```

### 3. User-Agent Identification
Always identify your bot:

```javascript
const headers = {
  'User-Agent': 'NextJob-Bot/1.0 (https://github.com/yourrepo; contact@yourdomain.com)',
  'Accept': 'application/json',
};
```

### 4. Caching
Implement caching to avoid repeated requests:

```javascript
// Cache job listings for 1-6 hours depending on source
// Greenhouse/Lever: 1 hour cache
// Custom pages: 2 hour cache
// Workday: 4 hour cache (due to rate limits)
```

### 5. Opt-Out Mechanism
Provide a way for companies to opt-out:

```javascript
// Check opt-out list before scraping
const OPTED_OUT_COMPANIES = [
  // Companies that have requested to be excluded
];
```

## Risk Assessment

### Low Risk ✅
- **Public API access** (Greenhouse, Lever)
- **Permissive robots.txt**
- **No explicit ToS prohibition**

### Medium Risk ⚠️
- **No robots.txt** (implicit permission)
- **Weak anti-bot measures**
- **Rate limiting respected**

### High Risk ❌
- **Explicit ToS prohibition** (LinkedIn)
- **Strong anti-bot measures** (Workday)
- **Legal action history** (LinkedIn vs hiQ)

## Recommendations

### Phase 1: Start with Low-Risk Sources
1. Implement Greenhouse scraper (60+ companies)
2. Implement Lever scraper (10+ companies)
3. Test with existing sources (Remotive, Arbeitnow, etc.)

### Phase 2: Expand to Medium-Risk Sources
1. Research each company's robots.txt
2. Implement custom scrapers for permissive companies
3. Add rate limiting and caching

### Phase 3: Evaluate High-Risk Sources
1. Apply for official API partnerships (LinkedIn)
2. Consider 3rd-party aggregation services (SerpAPI, ScrapingBee)
3. Evaluate cost/benefit of Workday scrapers

### Alternative Solutions
1. **3rd-Party APIs**: SerpAPI, ScrapingBee, ZenRows (paid)
2. **RSS Feeds**: Some companies provide job RSS feeds
3. **Partnerships**: Direct integration with job boards
4. **User Submissions**: Allow companies to submit jobs

## Legal Disclaimer

*This guide is for informational purposes only and does not constitute legal advice. Always consult with a qualified attorney regarding web scraping and data collection practices in your jurisdiction.*

## References

- [robots.txt Standard](https://developers.google.com/search/docs/advanced/robots/intro)
- [GDPR and Web Scraping](https://gdpr.eu/scraping/)
- [CCPA and Web Scraping](https://oag.ca.gov/privacy/ccpa)
- [Computer Fraud and Abuse Act (CFAA)](https://www.law.cornell.edu/uscode/text/18/1030)
- [LinkedIn vs hiQ Labs Case](https://www.eff.org/cases/hiq-v-linkedin)

## Contact

For questions about data collection or to request opt-out:
- Email: privacy@nextjob.com
- GitHub: https://github.com/yourrepo/nextjob
