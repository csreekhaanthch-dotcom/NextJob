/**
 * Job Scraper Module - JavaScript
 * Sources: Adzuna, Remotive, Arbeitnow, JSearch, Greenhouse, Lever
 */

const fetch = require('node-fetch');

// Configuration
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
  jsearch: {
    apiKey: process.env.JSEARCH_API_KEY,
    baseUrl: 'https://jsearch.p.rapidapi.com/search',
  },
};

// Company lists for career page scraping
const GREENHOUSE_COMPANIES = [
  'stripe', 'airbnb', 'dropbox', 'shopify', 'notion', 'figma', 'canva',
  'webflow', 'zapier', 'robinhood', 'coinbase', 'gusto', 'docker',
  'grammarly', 'postman', 'vercel', 'linear', 'automattic', 'gitlab'
];

const LEVER_COMPANIES = [
  'netflix', 'atlassian', 'segment', 'qualtrics', 'twitch', 'quora',
  'postman', 'loom', 'scale', 'vercel', 'linear', 'hackerrank'
];

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

function normalizeGreenhouseJob(job, companyName) {
  return {
    id: `greenhouse-${job.id}`,
    title: job.title || '',
    company: companyName,
    location: job.location?.name || 'Remote',
    description: '',
    url: job.absolute_url || `https://boards.greenhouse.com/jobs/${job.id}`,
    salary: '',
    job_type: '',
    posted_at: job.updated_at || '',
    source: `Greenhouse - ${companyName}`,
    is_remote: true,
  };
}

function normalizeLeverJob(job, companyName) {
  const categories = job.categories || {};
  return {
    id: `lever-${job.id}`,
    title: job.text || '',
    company: companyName,
    location: categories.location || 'Remote',
    description: (job.descriptionPlain || '').substring(0, 2000),
    url: job.hostedUrl || '',
    salary: '',
    job_type: categories.commitment || '',
    posted_at: '',
    source: `Lever - ${companyName}`,
    is_remote: true,
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
      jobs = jobs.filter(job =>
        job.candidate_required_location?.toLowerCase().includes(locLower)
      );
    }

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
      jobs = jobs.filter(job =>
        job.title?.toLowerCase().includes(queryLower) ||
        job.description?.toLowerCase().includes(queryLower)
      );
    }

    if (location) {
      const locLower = location.toLowerCase();
      jobs = jobs.filter(job =>
        job.location?.toLowerCase().includes(locLower) ||
        (locLower === 'remote' && job.remote)
      );
    }

    return jobs.map(normalizeArbeitnowJob);
  } catch (error) {
    console.error('[Arbeitnow] Error:', error.message);
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

// Greenhouse scraper
async function fetchGreenhouseJobs(query, location) {
  const allJobs = [];
  
  for (const company of GREENHOUSE_COMPANIES.slice(0, 10)) { // Limit to 10 companies
    try {
      const url = `https://boards.greenhouse.io/embed/job_board?for=${company}`;
      const response = await fetch(url);
      
      if (!response.ok) continue;
      
      const data = await response.json();
      let jobs = data.jobs || [];
      
      // Filter by query
      if (query) {
        const queryLower = query.toLowerCase();
        jobs = jobs.filter(job => job.title?.toLowerCase().includes(queryLower));
      }
      
      jobs.forEach(job => allJobs.push(normalizeGreenhouseJob(job, company)));
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      // Silently skip failed companies
    }
  }
  
  console.log(`[Greenhouse] Found ${allJobs.length} jobs`);
  return allJobs;
}

// Lever scraper
async function fetchLeverJobs(query, location) {
  const allJobs = [];
  
  for (const company of LEVER_COMPANIES.slice(0, 10)) { // Limit to 10 companies
    try {
      const url = `https://api.lever.co/v0/postings/${company}?mode=json`;
      const response = await fetch(url);
      
      if (!response.ok) continue;
      
      let jobs = await response.json();
      
      // Filter by query
      if (query) {
        const queryLower = query.toLowerCase();
        jobs = jobs.filter(job => 
          job.text?.toLowerCase().includes(queryLower) ||
          job.descriptionPlain?.toLowerCase().includes(queryLower)
        );
      }
      
      jobs.forEach(job => allJobs.push(normalizeLeverJob(job, company)));
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      // Silently skip failed companies
    }
  }
  
  console.log(`[Lever] Found ${allJobs.length} jobs`);
  return allJobs;
}

// Aggregator
async function fetchAllJobs(options = {}) {
  const {
    query = '',
    location = '',
    page = 1,
    sources = ['adzuna', 'remotive', 'arbeitnow'],
  } = options;

  const fetchPromises = [];
  
  if (sources.includes('adzuna')) fetchPromises.push(fetchAdzunaJobs(query, location, page, 20));
  if (sources.includes('remotive')) fetchPromises.push(fetchRemotiveJobs(query, location, 50));
  if (sources.includes('arbeitnow')) fetchPromises.push(fetchArbeitnowJobs(query, location, page));
  if (sources.includes('jsearch')) fetchPromises.push(fetchJSearchJobs(query, location, page));
  if (sources.includes('greenhouse')) fetchPromises.push(fetchGreenhouseJobs(query, location));
  if (sources.includes('lever')) fetchPromises.push(fetchLeverJobs(query, location));

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
  return {
    adzuna: { name: 'Adzuna', configured: !!(CONFIG.adzuna.appId && CONFIG.adzuna.apiKey), free: false },
    remotive: { name: 'Remotive', configured: true, free: true },
    arbeitnow: { name: 'Arbeitnow', configured: true, free: true },
    jsearch: { name: 'JSearch', configured: !!CONFIG.jsearch.apiKey, free: false },
    greenhouse: { name: 'Greenhouse', configured: true, free: true },
    lever: { name: 'Lever', configured: true, free: true },
  };
}

module.exports = {
  fetchAllJobs,
  fetchAdzunaJobs,
  fetchRemotiveJobs,
  fetchArbeitnowJobs,
  fetchJSearchJobs,
  fetchGreenhouseJobs,
  fetchLeverJobs,
  getAvailableSources,
};
