import { NextRequest, NextResponse } from 'next/server'

// ============ UTILITY FUNCTIONS ============

function stripHtml(html: string): string {
  if (!html) return ''
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

// ============ FREE JOB APIs ============

async function fetchRemotiveJobs(search: string, location: string, limit: number) {
  try {
    const params = new URLSearchParams()
    if (search) params.append('search', search)
    params.append('limit', String(Math.min(limit * 2, 100)))
    
    const response = await fetch('https://remotive.com/api/remote-jobs?' + params.toString(), {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(15000)
    })
    
    if (!response.ok) return []
    
    const data = await response.json()
    let jobs = data.jobs || []
    
    if (location) {
      const locLower = location.toLowerCase()
      jobs = jobs.filter((job: any) => 
        job.candidate_required_location?.toLowerCase().includes(locLower) ||
        job.country?.toLowerCase().includes(locLower)
      )
    }
    
    return jobs.slice(0, limit).map((job: any) => ({
      id: 'remotive-' + job.id,
      title: job.title || 'Unknown Title',
      company: job.company_name || 'Unknown Company',
      location: job.candidate_required_location || 'Remote',
      description: stripHtml(job.description?.substring(0, 500) || ''),
      url: job.url,
      salary: job.salary || null,
      posted_date: job.publication_date,
      tags: job.tags || [],
      job_type: job.job_type || 'Full-time',
      is_remote: true,
      source: 'Remotive'
    }))
  } catch (error) {
    console.error('Remotive API error:', error)
    return []
  }
}

async function fetchArbeitnowJobs(search: string, location: string, limit: number) {
  try {
    const response = await fetch('https://www.arbeitnow.com/api/job-board-api', {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(15000)
    })
    
    if (!response.ok) return []
    
    const data = await response.json()
    let jobs = data.data || []
    
    if (search) {
      const searchLower = search.toLowerCase()
      jobs = jobs.filter((job: any) => 
        job.title?.toLowerCase().includes(searchLower) ||
        job.company_name?.toLowerCase().includes(searchLower) ||
        job.description?.toLowerCase().includes(searchLower)
      )
    }
    
    if (location) {
      const locLower = location.toLowerCase()
      jobs = jobs.filter((job: any) => 
        job.location?.toLowerCase().includes(locLower)
      )
    }
    
    return jobs.slice(0, limit).map((job: any) => ({
      id: 'arbeitnow-' + (job.slug || job.id),
      title: job.title || 'Unknown Title',
      company: job.company_name || 'Unknown Company',
      location: job.location || 'Not specified',
      description: stripHtml(job.description?.substring(0, 500) || ''),
      url: job.url || 'https://www.arbeitnow.com/job/' + job.slug,
      salary: job.salary || null,
      posted_date: job.created_at,
      tags: job.tags || [],
      job_type: job.job_type || 'Full-time',
      is_remote: job.remote || false,
      source: 'Arbeitnow'
    }))
  } catch (error) {
    console.error('Arbeitnow API error:', error)
    return []
  }
}

async function fetchMuseJobs(search: string, location: string, page: number, limit: number) {
  try {
    const params = new URLSearchParams({
      page: String(page),
      descending: 'true'
    })
    
    const response = await fetch('https://www.themuse.com/api/public/jobs?' + params.toString(), {
      signal: AbortSignal.timeout(15000)
    })
    
    if (!response.ok) return []
    
    const data = await response.json()
    let jobs = data.results || []
    
    if (search) {
      const searchLower = search.toLowerCase()
      jobs = jobs.filter((job: any) => 
        job.name?.toLowerCase().includes(searchLower) ||
        job.company?.name?.toLowerCase().includes(searchLower)
      )
    }
    
    if (location) {
      const locLower = location.toLowerCase()
      jobs = jobs.filter((job: any) => 
        job.locations?.some((loc: any) => loc.name?.toLowerCase().includes(locLower))
      )
    }
    
    return jobs.slice(0, limit).map((job: any) => ({
      id: 'muse-' + job.id,
      title: job.name || 'Unknown Title',
      company: job.company?.name || 'Unknown Company',
      location: job.locations?.map((l: any) => l.name).join(', ') || 'Not specified',
      description: stripHtml(job.contents?.substring(0, 500) || ''),
      url: job.refs?.landing_page,
      salary: null,
      posted_date: job.publication_date,
      tags: job.categories?.map((c: any) => c.name) || [],
      job_type: 'Full-time',
      is_remote: false,
      source: 'TheMuse'
    }))
  } catch (error) {
    console.error('Muse API error:', error)
    return []
  }
}

async function fetchRemoteOKJobs(search: string, limit: number) {
  try {
    const response = await fetch('https://remoteok.com/api', {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(10000)
    })
    
    if (!response.ok) return []
    
    const data = await response.json()
    let jobs = data.slice(1) // First item is metadata
    
    if (search) {
      const searchLower = search.toLowerCase()
      jobs = jobs.filter((job: any) => 
        job.position?.toLowerCase().includes(searchLower) ||
        job.company?.toLowerCase().includes(searchLower)
      )
    }
    
    return jobs.slice(0, limit).map((job: any) => ({
      id: 'remoteok-' + job.id,
      title: job.position || 'Unknown Title',
      company: job.company || 'Unknown Company',
      location: job.location || 'Remote',
      description: stripHtml(job.description?.substring(0, 500) || ''),
      url: job.url || 'https://remoteok.com/remote-jobs/' + job.id,
      salary: job.salary || null,
      posted_date: job.date ? new Date(job.date * 1000).toISOString() : null,
      tags: job.tags || [],
      job_type: job.type || 'Full-time',
      is_remote: true,
      source: 'RemoteOK'
    }))
  } catch (error) {
    console.error('RemoteOK API error:', error)
    return []
  }
}

// ============ REAL COMPANY CAREER PAGE SCRAPERS ============

// Greenhouse API - Used by: Uber, Airbnb, Spotify, Dropbox, Stripe, Coinbase, etc.
const GREENHOUSE_COMPANIES: Record<string, string> = {
  'uber': 'uber',
  'airbnb': 'airbnb',
  'spotify': 'spotify',
  'dropbox': 'dropbox',
  'stripe': 'stripe',
  'coinbase': 'coinbase',
  'lyft': 'lyft',
  'shopify': 'shopify',
  'atlassian': 'atlassian',
  'mongodb': 'mongodb',
  'notion': 'notion', 
  'figma': 'figma',
  'canva': 'canva',
  'discord': 'discord',
  'reddit': 'reddit',
  'twilio': 'twilio',
  'instacart': 'instacart',
  'doordash': 'doordash',
  'roblox': 'roblox',
  'databricks': 'databricks',
  'snowflake': 'snowflake',
  'square': 'square',
  'block': 'block',
  'plaid': 'plaid',
  'flexport': 'flexport',
  'samsara': 'samsara',
  'yelp': 'yelp',
  'autodesk': 'autodesk',
  'zapier': 'zapier',
  'linear': 'linear',
  'vercel': 'vercel',
  'gitlab': 'gitlab'
}

async function fetchGreenhouseJobs(companyKey: string, search: string, limit: number): Promise<any[]> {
  const boardId = GREENHOUSE_COMPANIES[companyKey.toLowerCase()]
  if (!boardId) return []
  
  try {
    const response = await fetch(`https://boards-api.greenhouse.io/v1/boards/${boardId}/jobs?content=true`, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(15000)
    })
    
    if (!response.ok) {
      console.log(`Greenhouse: ${boardId} returned ${response.status}`)
      return []
    }
    
    const data = await response.json()
    let jobs = data.jobs || []
    
    if (search) {
      const searchLower = search.toLowerCase()
      jobs = jobs.filter((job: any) => 
        job.title?.toLowerCase().includes(searchLower) ||
        job.content?.toLowerCase().includes(searchLower)
      )
    }
    
    return jobs.slice(0, limit).map((job: any) => {
      const locations = job.location?.name || 'Not specified'
      const departments = job.departments?.map((d: any) => d.name).join(', ') || ''
      
      return {
        id: `greenhouse-${companyKey}-${job.id}`,
        title: job.title || 'Unknown Title',
        company: companyKey.charAt(0).toUpperCase() + companyKey.slice(1),
        location: locations,
        description: stripHtml(job.content?.substring(0, 500) || ''),
        url: job.absolute_url || `https://boards.greenhouse.io/${boardId}/jobs/${job.id}`,
        salary: null,
        posted_date: job.updated_at || new Date().toISOString(),
        tags: departments ? [departments] : [],
        job_type: 'Full-time',
        is_remote: locations.toLowerCase().includes('remote'),
        source: companyKey.charAt(0).toUpperCase() + companyKey.slice(1),
        verified: true,
        platform: 'Greenhouse'
      }
    })
  } catch (error) {
    console.error(`Greenhouse error for ${boardId}:`, error)
    return []
  }
}

// Lever API - Used by many startups and tech companies
const LEVER_COMPANIES: Record<string, string> = {
  'palantir': 'palantir',
  'anduril': 'anduril',
  'scale': 'scale',
  'openai': 'openai',
  'anthropic': 'anthropic',
  'huggingface': 'huggingface',
  'notion': 'notion',
  'mercury': 'mercury',
  'retool': 'retool',
  'vanta': 'vanta',
  'deel': 'deel',
  'ropes': 'ropes',
  'descript': 'descript',
  'lattice': 'lattice',
  'clubhouse': 'clubhouse',
  'hevy': 'hevy',
  'waymo': 'waymo',
  'nuro': 'nuro',
  'cruise': 'cruise',
  'aurora': 'aurora'
}

async function fetchLeverJobs(companyKey: string, search: string, limit: number): Promise<any[]> {
  const siteId = LEVER_COMPANIES[companyKey.toLowerCase()]
  if (!siteId) return []
  
  try {
    const response = await fetch(`https://api.lever.co/v0/postings/${siteId}?mode=json`, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(15000)
    })
    
    if (!response.ok) {
      console.log(`Lever: ${siteId} returned ${response.status}`)
      return []
    }
    
    const jobs = await response.json()
    
    let filteredJobs = jobs
    if (search) {
      const searchLower = search.toLowerCase()
      filteredJobs = jobs.filter((job: any) => 
        job.text?.toLowerCase().includes(searchLower) ||
        job.description?.toLowerCase().includes(searchLower)
      )
    }
    
    return filteredJobs.slice(0, limit).map((job: any) => {
      const location = job.categories?.location || 'Not specified'
      const team = job.categories?.team || ''
      const commitment = job.categories?.commitment || 'Full-time'
      
      return {
        id: `lever-${companyKey}-${job.id}`,
        title: job.text || 'Unknown Title',
        company: companyKey.charAt(0).toUpperCase() + companyKey.slice(1),
        location: location,
        description: stripHtml(job.descriptionPlain?.substring(0, 500) || ''),
        url: job.hostedUrl || job.applyUrl,
        salary: null,
        posted_date: job.createdAt,
        tags: team ? [team] : [],
        job_type: commitment,
        is_remote: location.toLowerCase().includes('remote'),
        source: companyKey.charAt(0).toUpperCase() + companyKey.slice(1),
        verified: true,
        platform: 'Lever'
      }
    })
  } catch (error) {
    console.error(`Lever error for ${siteId}:`, error)
    return []
  }
}

// Ashby API - Used by modern tech companies
const ASHBY_COMPANIES: Record<string, string> = {
  'replicon': 'replicon',
  'synthesia': 'synthesia'
}

async function fetchAshbyJobs(companyKey: string, search: string, limit: number): Promise<any[]> {
  const handle = ASHBY_COMPANIES[companyKey.toLowerCase()]
  if (!handle) return []
  
  try {
    const response = await fetch(`https://api.ashbyhq.com/posting-api/${handle}`, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(15000)
    })
    
    if (!response.ok) return []
    
    const jobs = await response.json()
    
    let filteredJobs = jobs
    if (search) {
      const searchLower = search.toLowerCase()
      filteredJobs = jobs.filter((job: any) => 
        job.title?.toLowerCase().includes(searchLower)
      )
    }
    
    return filteredJobs.slice(0, limit).map((job: any) => ({
      id: `ashby-${companyKey}-${job.id}`,
      title: job.title || 'Unknown Title',
      company: companyKey.charAt(0).toUpperCase() + companyKey.slice(1),
      location: job.locationName || 'Not specified',
      description: stripHtml(job.description?.substring(0, 500) || ''),
      url: job.jobUrl || job.externalUrl,
      salary: job.compensation?.salaryRange ? 
        `${job.compensation.salaryRange.minValue}-${job.compensation.salaryRange.maxValue} ${job.compensation.salaryRange.currency}` : null,
      posted_date: job.publishedAt,
      tags: job.departmentName ? [job.departmentName] : [],
      job_type: job.employmentType || 'Full-time',
      is_remote: job.isRemote || false,
      source: companyKey.charAt(0).toUpperCase() + companyKey.slice(1),
      verified: true,
      platform: 'Ashby'
    }))
  } catch (error) {
    console.error(`Ashby error for ${handle}:`, error)
    return []
  }
}

// SmartRecruiters API
const SMARTRECRUITERS_COMPANIES: Record<string, string> = {
  'adobe': 'adobe',
  'nvidia': 'nvidia',
  'cisco': 'cisco',
  'intel': 'intel',
  'boeing': 'boeing',
  'visa': 'visa',
  'mastercard': 'mastercard'
}

async function fetchSmartRecruitersJobs(companyKey: string, search: string, limit: number): Promise<any[]> {
  const companyId = SMARTRECRUITERS_COMPANIES[companyKey.toLowerCase()]
  if (!companyId) return []
  
  try {
    const response = await fetch(`https://api.smartrecruiters.com/v1/companies/${companyId}/postings?limit=${limit}`, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(15000)
    })
    
    if (!response.ok) return []
    
    const data = await response.json()
    let jobs = data.content || []
    
    if (search) {
      const searchLower = search.toLowerCase()
      jobs = jobs.filter((job: any) => 
        job.name?.toLowerCase().includes(searchLower)
      )
    }
    
    return jobs.slice(0, limit).map((job: any) => ({
      id: `sr-${companyKey}-${job.id}`,
      title: job.name || 'Unknown Title',
      company: companyKey.charAt(0).toUpperCase() + companyKey.slice(1),
      location: job.location?.city ? `${job.location.city}, ${job.location.country}` : 'Not specified',
      description: job.jobAd?.sections?.qualifications?.text?.substring(0, 500) || '',
      url: `https://jobs.smartrecruiters.com/${companyId}/${job.id}`,
      salary: null,
      posted_date: job.releasedDate,
      tags: job.department?.label ? [job.department.label] : [],
      job_type: job.typeOfEmployment?.label || 'Full-time',
      is_remote: false,
      source: companyKey.charAt(0).toUpperCase() + companyKey.slice(1),
      verified: true,
      platform: 'SmartRecruiters'
    }))
  } catch (error) {
    console.error(`SmartRecruiters error for ${companyId}:`, error)
    return []
  }
}

// Fetch jobs from all company career pages
async function fetchAllCompanyJobs(search: string, location: string, limit: number): Promise<any[]> {
  const allJobs: any[] = []
  
  // Fetch from all platforms in parallel
  const fetchPromises: Promise<any[]>[] = []
  
  // Greenhouse companies (most popular tech companies)
  Object.keys(GREENHOUSE_COMPANIES).forEach(company => {
    fetchPromises.push(fetchGreenhouseJobs(company, search, Math.ceil(limit / 10)))
  })
  
  // Lever companies
  Object.keys(LEVER_COMPANIES).forEach(company => {
    fetchPromises.push(fetchLeverJobs(company, search, Math.ceil(limit / 10)))
  })
  
  // Ashby companies
  Object.keys(ASHBY_COMPANIES).forEach(company => {
    fetchPromises.push(fetchAshbyJobs(company, search, Math.ceil(limit / 10)))
  })
  
  // SmartRecruiters companies
  Object.keys(SMARTRECRUITERS_COMPANIES).forEach(company => {
    fetchPromises.push(fetchSmartRecruitersJobs(company, search, Math.ceil(limit / 10)))
  })
  
  const results = await Promise.all(fetchPromises)
  
  results.forEach(jobs => {
    allJobs.push(...jobs)
  })
  
  // Filter by location if specified
  if (location) {
    const locLower = location.toLowerCase()
    return allJobs.filter(job => 
      job.location?.toLowerCase().includes(locLower) ||
      (location.toLowerCase() === 'remote' && job.is_remote)
    )
  }
  
  return allJobs
}

// Fetch jobs from specific company
async function fetchSpecificCompanyJobs(companyName: string, search: string, location: string, limit: number): Promise<any[]> {
  const companyLower = companyName.toLowerCase()
  
  // Try Greenhouse first
  if (GREENHOUSE_COMPANIES[companyLower]) {
    const jobs = await fetchGreenhouseJobs(companyLower, search, limit)
    if (jobs.length > 0) return jobs
  }
  
  // Try Lever
  if (LEVER_COMPANIES[companyLower]) {
    const jobs = await fetchLeverJobs(companyLower, search, limit)
    if (jobs.length > 0) return jobs
  }
  
  // Try Ashby
  if (ASHBY_COMPANIES[companyLower]) {
    const jobs = await fetchAshbyJobs(companyLower, search, limit)
    if (jobs.length > 0) return jobs
  }
  
  // Try SmartRecruiters
  if (SMARTRECRUITERS_COMPANIES[companyLower]) {
    const jobs = await fetchSmartRecruitersJobs(companyLower, search, limit)
    if (jobs.length > 0) return jobs
  }
  
  return []
}

// ============ ALL COMPANY MAPPINGS ============

const ALL_COMPANIES = {
  ...GREENHOUSE_COMPANIES,
  ...LEVER_COMPANIES,
  ...ASHBY_COMPANIES,
  ...SMARTRECRUITERS_COMPANIES
}

const BIG_TECH_COMPANIES = Object.keys(ALL_COMPANIES)

// ============ MAIN API HANDLER ============

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  
  const search = searchParams.get('search') || ''
  const location = searchParams.get('location') || ''
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '12')
  const company = searchParams.get('company') || ''
  const companies = searchParams.get('companies')?.split(',').filter(Boolean) || []
  const includeBigTech = searchParams.get('bigTech') === 'true'
  const includeCareerPages = searchParams.get('careerPages') === 'true'
  const platform = searchParams.get('platform') || ''
  const sources = searchParams.get('sources')?.split(',') || ['remotive', 'arbeitnow', 'muse', 'remoteok']
  
  return fetchJobsInternal({
    search, location, page, limit, company, companies, includeBigTech, includeCareerPages, platform, sources
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const search = body.search || ''
    const location = body.location || ''
    const page = parseInt(body.page || '1')
    const limit = parseInt(body.limit || '12')
    const company = body.company || ''
    const companies = body.companies || []
    const includeBigTech = body.bigTech === 'true'
    const includeCareerPages = body.careerPages === 'true'
    const platform = body.platform || ''
    const sources = body.sources || ['remotive', 'arbeitnow', 'muse', 'remoteok']
    
    return fetchJobsInternal({
      search, location, page, limit, company, companies, includeBigTech, includeCareerPages, platform, sources
    })
  } catch (error: any) {
    console.error('Jobs POST API error:', error)
    return NextResponse.json(
      { error: 'Failed to parse request', message: error.message },
      { status: 400 }
    )
  }
}

async function fetchJobsInternal(params: {
  search: string
  location: string
  page: number
  limit: number
  company: string
  companies: string[]
  includeBigTech: boolean
  includeCareerPages: boolean
  platform: string
  sources: string[]
}) {
  const { search, location, page, limit, company, companies, includeBigTech, includeCareerPages, platform, sources } = params
  
  try {
    console.log(`Jobs API: search="${search}", location="${location}", page=${page}`)
    
    const fetchPromises: Promise<any[]>[] = []
    
    // Free API sources
    if (sources.includes('remotive')) {
      fetchPromises.push(fetchRemotiveJobs(search, location, limit))
    }
    if (sources.includes('arbeitnow')) {
      fetchPromises.push(fetchArbeitnowJobs(search, location, limit))
    }
    if (sources.includes('muse')) {
      fetchPromises.push(fetchMuseJobs(search, location, page, limit))
    }
    if (sources.includes('remoteok')) {
      fetchPromises.push(fetchRemoteOKJobs(search, limit))
    }
    
    // Career page scraping
    if (includeCareerPages) {
      fetchPromises.push(fetchAllCompanyJobs(search, location, limit * 2))
    }
    
    // Specific company
    if (company) {
      fetchPromises.push(fetchSpecificCompanyJobs(company, search, location, limit))
    }
    
    // Multiple companies
    if (companies.length > 0) {
      companies.forEach(c => {
        fetchPromises.push(fetchSpecificCompanyJobs(c.trim(), search, location, Math.ceil(limit / companies.length)))
      })
    }
    
    // Big Tech
    if (includeBigTech) {
      fetchPromises.push(fetchAllCompanyJobs(search, location, limit * 2))
    }
    
    const results = await Promise.all(fetchPromises)
    
    // Combine all jobs
    let allJobs = results.flat()
    
    console.log(`Total jobs fetched: ${allJobs.length}`)
    
    // Sort by posted_date (newest first)
    allJobs.sort((a, b) => {
      const dateA = a.posted_date ? new Date(a.posted_date).getTime() : 0
      const dateB = b.posted_date ? new Date(b.posted_date).getTime() : 0
      return dateB - dateA
    })
    
    // Remove duplicates based on title + company
    const seen = new Set()
    allJobs = allJobs.filter(job => {
      const key = `${job.title}-${job.company}`.toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    
    // Filter by platform if specified
    if (platform) {
      allJobs = allJobs.filter(job => 
        job.platform === platform || job.source === platform
      )
    }
    
    // Apply pagination
    const total = allJobs.length
    const startIndex = (page - 1) * limit
    const paginatedJobs = allJobs.slice(startIndex, startIndex + limit)
    
    // Count jobs by platform
    const platformCounts: Record<string, number> = {}
    allJobs.forEach(job => {
      const platform = job.platform || job.source
      platformCounts[platform] = (platformCounts[platform] || 0) + 1
    })
    
    return NextResponse.json({
      jobs: paginatedJobs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      sources: [
        { name: 'Remotive', status: 'active', type: 'free' },
        { name: 'Arbeitnow', status: 'active', type: 'free' },
        { name: 'TheMuse', status: 'active', type: 'free' },
        { name: 'RemoteOK', status: 'active', type: 'free' },
        { name: 'Greenhouse', status: 'active', type: 'career-api', companies: Object.keys(GREENHOUSE_COMPANIES).length },
        { name: 'Lever', status: 'active', type: 'career-api', companies: Object.keys(LEVER_COMPANIES).length },
        { name: 'SmartRecruiters', status: 'active', type: 'career-api', companies: Object.keys(SMARTRECRUITERS_COMPANIES).length },
        { name: 'Ashby', status: 'active', type: 'career-api', companies: Object.keys(ASHBY_COMPANIES).length }
      ],
      platformCounts,
      companies: companies.length > 0 ? companies : (includeBigTech ? BIG_TECH_COMPANIES : [])
    })
  } catch (error: any) {
    console.error('Jobs API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch jobs', message: error.message },
      { status: 500 }
    )
  }
}
