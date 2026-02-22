/**
 * Job Scraper Module - JavaScript
 * Sources: Remotive, Arbeitnow, RemoteOK, USAJOBS, Adzuna, JSearch, Greenhouse, Lever, Custom
 */

const fetch = require('node-fetch');

// Import new ATS scrapers
let greenhouseScraper, leverScraper;
try {
  const greenhouseModule = require('./src/scrapers/greenhouse');
  greenhouseScraper = greenhouseModule.scraper;
} catch (error) {
  console.warn('Greenhouse scraper not available:', error.message);
}

try {
  const leverModule = require('./src/scrapers/lever');
  leverScraper = leverModule.scraper;
} catch (error) {
  console.warn('Lever scraper not available:', error.message);
}

const CONFIG = {
  adzuna: {
    appId: process.env.ADZUNA_APP_ID,
    apiKey: process.env.ADZUNA_API_KEY,
    baseUrl: 'https://api.adzuna.com/v1/api/jobs',
  },
  remotive: {
    baseUrl: 'https://remotive.com/api/remote-jobs',
  },
  arbeitnow: {
    baseUrl: 'https://www.arbeitnow.com/api/job-board-api',
  },
  remoteok: {
    baseUrl: 'https://remoteok.com/api',
  },
  usajobs: {
    apiKey: process.env.USAJOBS_API_KEY,
    baseUrl: 'https://data.usajobs.gov/api/search',
  },
  jsearch: {
    apiKey: process.env.JSEARCH_API_KEY,
    baseUrl: 'https://jsearch.p.rapidapi.com/search',
  },
};

// Normalizers
function normalizeAdzunaJob(job) {
  return {
    id: `adzuna-${job.id}`,
    title: job.title || '',
    company: job.company?.display_name || 'Unknown',
    location: job.location?.display_name || '',
    description: job.description || '',
    url: job.redirect_url || '',
    salary: job.salary_min && job.salary_max
      ? `$${job.salary_min?.toLocaleString()} - $${job.salary_max?.toLocaleString()}`
      : '',
    job_type: job.contract_time || '',
    posted_at: job.created || '',
    source: 'Adzuna',
    is_remote: job.location?.display_name?.toLowerCase().includes('remote') || false,
  };
}

function normalizeRemotiveJob(job) {
  return {
    id: `remotive-${job.id}`,
    title: job.title || '',
    company: job.company_name || 'Unknown',
    location: job.candidate_required_location || 'Remote',
    description: (job.description || '').substring(0, 2000),
    url: job.url || '',
    salary: job.salary || '',
    job_type: 'Remote',
    posted_at: job.publication_date || '',
    source: 'Remotive',
    is_remote: true,
    tags: job.tags || [],
  };
}

function normalizeArbeitnowJob(job) {
  return {
    id: `arbeitnow-${job.slug || job.id}`,
    title: job.title || '',
    company: job.company_name || 'Unknown',
    location: job.location || '',
    description: (job.description || '').substring(0, 2000),
    url: job.url || '',
    salary: '',
    job_type: job.remote ? 'Remote' : 'On-site',
    posted_at: job.created_at || '',
    source: 'Arbeitnow',
    is_remote: job.remote || false,
  };
}

function normalizeRemoteOKJob(job) {
  return {
    id: `remoteok-${job.id}`,
    title: job.position || job.title || '',
    company: job.company || 'Unknown',
    location: job.location || 'Remote',
    description: (job.description || '').substring(0, 2000),
    url: job.url || job.apply_url || '',
    salary: job.salary_min && job.salary_max ? `${job.salary_min} - ${job.salary_max}` : '',
    job_type: 'Remote',
    posted_at: job.date || '',
    source: 'RemoteOK',
    is_remote: true,
    tags: job.tags || [],
  };
}

function normalizeUSAJOBSJob(job) {
  const desc = job.MatchedObjectDescriptor || {};
  return {
    id: `usajobs-${desc.PositionID || job.ID}`,
    title: desc.PositionTitle || '',
    company: desc.OrganizationName || 'US Government',
    location: desc.PositionLocationDisplay || 'USA',
    description: (desc.UserArea?.Details?.JobSummary || '').substring(0, 2000),
    url: desc.PositionURI || '',
    salary: desc.PositionRemuneration?.[0] 
      ? `$${desc.PositionRemuneration[0].MinimumRange} - $${desc.PositionRemuneration[0].MaximumRange}`
      : '',
    job_type: desc.PositionSchedule?.[0]?.Name || '',
    posted_at: desc.PublicationStartDate || '',
    source: 'USAJOBS',
    is_remote: false,
  };
}

function normalizeJSearchJob(job) {
  return {
    id: `jsearch-${job.job_id}`,
    title: job.job_title || '',
    company: job.employer_name || 'Unknown',
    location: [job.job_city, job.job_state].filter(Boolean).join(', ') || 'Remote',
    description: (job.job_description || '').substring(0, 2000),
    url: job.job_apply_link || '',
    salary: job.job_min_salary && job.job_max_salary
      ? `${job.job_min_salary.toLocaleString()} - ${job.job_max_salary.toLocaleString()} ${job.job_salary_currency || 'USD'}/${job.job_salary_period || 'yearly'}`
      : '',
    job_type: job.job_employment_type || '',
    posted_at: job.job_posted_at_datetime_utc || '',
    source: 'JSearch',
    is_remote: job.job_is_remote || false,
  };
}

// API Fetchers
async function fetchAdzunaJobs(query, location, page = 1, limit = 20) {
  const { appId, apiKey, baseUrl } = CONFIG.adzuna;
  if (!appId || !apiKey) return [];

  try {
    const params = new URLSearchParams({
      app_id: appId,
      api_key: apiKey,
      what: query || '',
      where: location || '',
      results_per_page: limit.toString(),
      page: page.toString(),
    });
    const response = await fetch(`${baseUrl}/us/search/${page}?${params}`);
    if (!response.ok) return [];
    const data = await response.json();
    return (data.results || []).map(normalizeAdzunaJob);
  } catch (error) {
    console.error('[Adzuna] Error:', error.message);
    return [];
  }
}

async function fetchRemotiveJobs(query, location, limit = 50) {
  try {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (query) params.set('search', query);
    const response = await fetch(`${CONFIG.remotive.baseUrl}?${params}`);
    if (!response.ok) return [];
    const data = await response.json();
    let jobs = data.jobs || [];
    if (location && location.toLowerCase() !== 'remote') {
      const locLower = location.toLowerCase();
      jobs = jobs.filter(job => job.candidate_required_location?.toLowerCase().includes(locLower));
    }
    console.log(`[Remotive] Found ${jobs.length} jobs`);
    return jobs.map(normalizeRemotiveJob);
  } catch (error) {
    console.error('[Remotive] Error:', error.message);
    return [];
  }
}

async function fetchArbeitnowJobs(query, location, page = 1) {
  try {
    const response = await fetch(`${CONFIG.arbeitnow.baseUrl}?page=${page}`);
    if (!response.ok) return [];
    const data = await response.json();
    let jobs = data.data || [];
    if (query) {
      const queryLower = query.toLowerCase();
      jobs = jobs.filter(job => job.title?.toLowerCase().includes(queryLower) || job.description?.toLowerCase().includes(queryLower));
    }
    if (location) {
      const locLower = location.toLowerCase();
      jobs = jobs.filter(job => job.location?.toLowerCase().includes(locLower) || (locLower === 'remote' && job.remote));
    }
    console.log(`[Arbeitnow] Found ${jobs.length} jobs`);
    return jobs.map(normalizeArbeitnowJob);
  } catch (error) {
    console.error('[Arbeitnow] Error:', error.message);
    return [];
  }
}

async function fetchRemoteOKJobs(query, location) {
  try {
    const response = await fetch(CONFIG.remoteok.baseUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      }
    });
    if (!response.ok) {
      console.error(`[RemoteOK] HTTP ${response.status}`);
      return [];
    }
    let jobs = await response.json();
    // First item is metadata, skip it
    if (Array.isArray(jobs) && jobs.length > 0 && !jobs[0].id) {
      jobs = jobs.slice(1);
    }
    if (query) {
      const queryLower = query.toLowerCase();
      jobs = jobs.filter(job => 
        (job.position || job.title || '').toLowerCase().includes(queryLower) ||
        (job.description || '').toLowerCase().includes(queryLower) ||
        (job.tags || []).some(tag => tag.toLowerCase().includes(queryLower))
      );
    }
    console.log(`[RemoteOK] Found ${jobs.length} jobs`);
    return jobs.map(normalizeRemoteOKJob);
  } catch (error) {
    console.error('[RemoteOK] Error:', error.message);
    return [];
  }
}

async function fetchUSAJOBSJobs(query, location, page = 1, limit = 20) {
  const { apiKey, baseUrl } = CONFIG.usajobs;
  
  // USAJOBS requires either API key or proper User-Agent
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'application/json',
  };
  
  if (apiKey) {
    headers['Authorization-Key'] = apiKey;
  }

  try {
    const params = new URLSearchParams({
      ResultsPerPage: limit.toString(),
      Page: page.toString(),
    });
    if (query) params.set('Keyword', query);
    if (location) params.set('LocationName', location);

    const response = await fetch(`${baseUrl}?${params}`, { headers });
    if (!response.ok) {
      console.error(`[USAJOBS] HTTP ${response.status}`);
      return [];
    }
    const data = await response.json();
    const jobs = data.SearchResult?.SearchResultItems || [];
    console.log(`[USAJOBS] Found ${jobs.length} jobs`);
    return jobs.map(normalizeUSAJOBSJob);
  } catch (error) {
    console.error('[USAJOBS] Error:', error.message);
    return [];
  }
}

async function fetchJSearchJobs(query, location, page = 1) {
  const { apiKey, baseUrl } = CONFIG.jsearch;
  if (!apiKey) return [];

  try {
    const params = new URLSearchParams({
      query: [query, location].filter(Boolean).join(' ') || 'software engineer',
      page: page.toString(),
      num_pages: '1',
    });
    const response = await fetch(`${baseUrl}?${params}`, {
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
      }
    });
    if (!response.ok) return [];
    const data = await response.json();
    return (data.data || []).map(normalizeJSearchJob);
  } catch (error) {
    console.error('[JSearch] Error:', error.message);
    return [];
  }
}

// Aggregator
async function fetchAllJobs(options = {}) {
  const {
    query = '',
    location = '',
    page = 1,
    sources = ['remotive', 'arbeitnow', 'remoteok'],
    useATS = true, // Enable ATS scrapers by default
    priority = 2, // Priority level for ATS scrapers (1=highest priority companies)
  } = options;

  const fetchPromises = [];

  // Original job board APIs
  if (sources.includes('adzuna')) fetchPromises.push(fetchAdzunaJobs(query, location, page, 20));
  if (sources.includes('remotive')) fetchPromises.push(fetchRemotiveJobs(query, location, 50));
  if (sources.includes('arbeitnow')) fetchPromises.push(fetchArbeitnowJobs(query, location, page));
  if (sources.includes('remoteok')) fetchPromises.push(fetchRemoteOKJobs(query, location));
  if (sources.includes('usajobs')) fetchPromises.push(fetchUSAJOBSJobs(query, location, page, 20));
  if (sources.includes('jsearch')) fetchPromises.push(fetchJSearchJobs(query, location, page));

  // ATS scrapers (new - 100+ companies)
  if (useATS) {
    if (sources.includes('greenhouse') && greenhouseScraper) {
      fetchPromises.push(
        greenhouseScraper.fetchJobs({ query, location, priority })
          .catch(err => {
            console.error('[Greenhouse] Error:', err.message);
            return [];
          })
      );
    }
    if (sources.includes('lever') && leverScraper) {
      fetchPromises.push(
        leverScraper.fetchJobs({ query, location, priority })
          .catch(err => {
            console.error('[Lever] Error:', err.message);
            return [];
          })
      );
    }
  }

  const results = await Promise.allSettled(fetchPromises);
  let allJobs = [];
  results.forEach(result => {
    if (result.status === 'fulfilled') allJobs = allJobs.concat(result.value);
  });

  // Deduplicate
  const seen = new Set();
  return allJobs.filter(job => {
    const key = `${job.title.toLowerCase().trim()}-${job.company.toLowerCase().trim()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function getAvailableSources() {
  const sources = {
    // Original job board APIs
    remotive: { name: 'Remotive', configured: true, free: true, category: 'job-board' },
    arbeitnow: { name: 'Arbeitnow', configured: true, free: true, category: 'job-board' },
    remoteok: { name: 'RemoteOK', configured: true, free: true, category: 'job-board' },
    usajobs: { name: 'USAJOBS', configured: true, free: true, category: 'job-board' },
    adzuna: { name: 'Adzuna', configured: !!(CONFIG.adzuna.appId && CONFIG.adzuna.apiKey), free: false, category: 'job-board' },
    jsearch: { name: 'JSearch', configured: !!CONFIG.jsearch.apiKey, free: false, category: 'job-board' },

    // ATS scrapers (new)
    greenhouse: {
      name: 'Greenhouse',
      configured: !!greenhouseScraper,
      free: true,
      category: 'ats',
      description: '60+ companies including Stripe, Airbnb, Uber, Dropbox',
      companies: greenhouseScraper ? greenhouseScraper.getAvailableSources().length : 0,
    },
    lever: {
      name: 'Lever',
      configured: !!leverScraper,
      free: true,
      category: 'ats',
      description: '10+ companies including Netflix, Shopify',
      companies: leverScraper ? leverScraper.getAvailableSources().length : 0,
    },
  };

  return sources;
}

/**
 * Get detailed information about ATS companies
 */
function getATSSources() {
  const result = {};

  if (greenhouseScraper) {
    result.greenhouse = {
      name: 'Greenhouse ATS',
      companies: greenhouseScraper.getAvailableSources(),
      total: greenhouseScraper.getAvailableSources().length,
    };
  }

  if (leverScraper) {
    result.lever = {
      name: 'Lever ATS',
      companies: leverScraper.getAvailableSources(),
      total: leverScraper.getAvailableSources().length,
    };
  }

  return result;
}

module.exports = {
  fetchAllJobs,
  fetchRemotiveJobs,
  fetchArbeitnowJobs,
  fetchRemoteOKJobs,
  fetchUSAJOBSJobs,
  fetchAdzunaJobs,
  fetchJSearchJobs,
  getAvailableSources,
  getATSSources,
};
