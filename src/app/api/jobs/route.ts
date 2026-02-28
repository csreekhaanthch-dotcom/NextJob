import { NextRequest, NextResponse } from 'next/server'

// ============ UTILITY FUNCTIONS ============

function stripHtml(html: string): string {
  if (!html) return ''
  
  let text = html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&ensp;/g, ' ')
    .replace(/&emsp;/g, ' ')
    .replace(/\-\-[a-zA-Z0-9\-]+:\s*[^;]+;/g, '')
    .replace(/[a-zA-Z\-]+\s*:\s*[^;]+;/g, '')
    .replace(/\[&[^\]]+\]:[a-zA-Z0-9\-]+/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  
  return text.length > 300 ? text.substring(0, 300) + '...' : text
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
      description: stripHtml(job.description || ''),
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
      description: stripHtml(job.description || ''),
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
      description: stripHtml(job.contents || ''),
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
    let jobs = data.slice(1)
    
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
      description: stripHtml(job.description || ''),
      url: job.url || 'https://remoteok.com/remote-jobs/' + job.id,
      salary: job.salary || null,
      posted_date: job.date && !isNaN(Number(job.date)) ? new Date(Number(job.date) * 1000).toISOString() : new Date().toISOString(),
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

// ============ CAREER PAGE APIS ============

const GREENHOUSE_COMPANIES: Record<string, string> = {
  'uber': 'uber', 'airbnb': 'airbnb', 'spotify': 'spotify', 'dropbox': 'dropbox',
  'stripe': 'stripe', 'coinbase': 'coinbase', 'lyft': 'lyft', 'shopify': 'shopify',
  'atlassian': 'atlassian', 'mongodb': 'mongodb', 'notion': 'notion', 'figma': 'figma',
  'canva': 'canva', 'discord': 'discord', 'reddit': 'reddit', 'twilio': 'twilio'
}

async function fetchGreenhouseJobs(companyKey: string, search: string, limit: number): Promise<any[]> {
  const boardId = GREENHOUSE_COMPANIES[companyKey.toLowerCase()]
  if (!boardId) return []
  
  try {
    const response = await fetch(`https://boards-api.greenhouse.io/v1/boards/${boardId}/jobs?content=true`, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(15000)
    })
    
    if (!response.ok) return []
    
    const data = await response.json()
    let jobs = data.jobs || []
    
    if (search) {
      const searchLower = search.toLowerCase()
      jobs = jobs.filter((job: any) => 
        job.title?.toLowerCase().includes(searchLower)
      )
    }
    
    return jobs.slice(0, limit).map((job: any) => ({
      id: `greenhouse-${companyKey}-${job.id}`,
      title: job.title || 'Unknown Title',
      company: companyKey.charAt(0).toUpperCase() + companyKey.slice(1),
      location: job.location?.name || 'Not specified',
      description: stripHtml(job.content || ''),
      url: job.absolute_url || `https://boards.greenhouse.io/${boardId}/jobs/${job.id}`,
      salary: null,
      posted_date: job.updated_at || new Date().toISOString(),
      tags: job.departments?.map((d: any) => d.name) || [],
      job_type: 'Full-time',
      is_remote: (job.location?.name || '').toLowerCase().includes('remote'),
      source: companyKey.charAt(0).toUpperCase() + companyKey.slice(1),
      verified: true,
      platform: 'Greenhouse'
    }))
  } catch (error) {
    return []
  }
}

const LEVER_COMPANIES: Record<string, string> = {
  'openai': 'openai', 'anthropic': 'anthropic', 'mercury': 'mercury', 'retool': 'retool',
  'vanta': 'vanta', 'deel': 'deel', 'descript': 'descript', 'lattice': 'lattice'
}

async function fetchLeverJobs(companyKey: string, search: string, limit: number): Promise<any[]> {
  const siteId = LEVER_COMPANIES[companyKey.toLowerCase()]
  if (!siteId) return []
  
  try {
    const response = await fetch(`https://api.lever.co/v0/postings/${siteId}?mode=json`, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(15000)
    })
    
    if (!response.ok) return []
    
    const jobs = await response.json()
    
    let filteredJobs = jobs
    if (search) {
      const searchLower = search.toLowerCase()
      filteredJobs = jobs.filter((job: any) => 
        job.text?.toLowerCase().includes(searchLower)
      )
    }
    
    return filteredJobs.slice(0, limit).map((job: any) => ({
      id: `lever-${companyKey}-${job.id}`,
      title: job.text || 'Unknown Title',
      company: companyKey.charAt(0).toUpperCase() + companyKey.slice(1),
      location: job.categories?.location || 'Not specified',
      description: stripHtml(job.descriptionPlain || ''),
      url: job.hostedUrl || job.applyUrl,
      salary: null,
      posted_date: job.createdAt,
      tags: job.categories?.team ? [job.categories.team] : [],
      job_type: job.categories?.commitment || 'Full-time',
      is_remote: (job.categories?.location || '').toLowerCase().includes('remote'),
      source: companyKey.charAt(0).toUpperCase() + companyKey.slice(1),
      verified: true,
      platform: 'Lever'
    }))
  } catch (error) {
    return []
  }
}

async function fetchAllCareerPagesJobs(search: string, location: string, limit: number): Promise<any[]> {
  const allJobs: any[] = []
  const fetchPromises: Promise<any[]>[] = []
  
  Object.keys(GREENHOUSE_COMPANIES).forEach(company => {
    fetchPromises.push(fetchGreenhouseJobs(company, search, Math.ceil(limit / 8)))
  })
  
  Object.keys(LEVER_COMPANIES).forEach(company => {
    fetchPromises.push(fetchLeverJobs(company, search, Math.ceil(limit / 4)))
  })
  
  const results = await Promise.all(fetchPromises)
  results.forEach(jobs => allJobs.push(...jobs))
  
  if (location) {
    const locLower = location.toLowerCase()
    return allJobs.filter(job => 
      job.location?.toLowerCase().includes(locLower) ||
      (location.toLowerCase() === 'remote' && job.is_remote)
    )
  }
  
  return allJobs
}

// ============ API HANDLERS ============

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || ''
  const location = searchParams.get('location') || ''
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '12')
  const includeCareerPages = searchParams.get('careerPages') === 'true'
  
  return fetchJobsInternal({ search, location, page, limit, includeCareerPages })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    return fetchJobsInternal({
      search: body.search || '',
      location: body.location || '',
      page: parseInt(body.page || '1'),
      limit: parseInt(body.limit || '12'),
      includeCareerPages: body.careerPages === 'true'
    })
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to parse request' }, { status: 400 })
  }
}

async function fetchJobsInternal(params: {
  search: string
  location: string
  page: number
  limit: number
  includeCareerPages: boolean
}) {
  const { search, location, page, limit, includeCareerPages } = params
  
  try {
    const fetchPromises: Promise<any[]>[] = [
      fetchRemotiveJobs(search, location, limit),
      fetchArbeitnowJobs(search, location, limit),
      fetchMuseJobs(search, location, page, limit),
      fetchRemoteOKJobs(search, limit)
    ]
    
    if (includeCareerPages) {
      fetchPromises.push(fetchAllCareerPagesJobs(search, location, limit * 2))
    }
    
    const results = await Promise.all(fetchPromises)
    let allJobs = results.flat()
    
    allJobs.sort((a, b) => {
      const dateA = a.posted_date ? new Date(a.posted_date).getTime() : 0
      const dateB = b.posted_date ? new Date(b.posted_date).getTime() : 0
      return dateB - dateA
    })
    
    const seen = new Set()
    allJobs = allJobs.filter(job => {
      const key = `${job.title}-${job.company}`.toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    
    const total = allJobs.length
    const paginatedJobs = allJobs.slice((page - 1) * limit, page * limit)
    
    return NextResponse.json({
      jobs: paginatedJobs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      sources: [
        { name: 'Remotive', status: 'active' },
        { name: 'Arbeitnow', status: 'active' },
        { name: 'TheMuse', status: 'active' },
        { name: 'RemoteOK', status: 'active' },
        { name: 'Greenhouse', status: 'active' },
        { name: 'Lever', status: 'active' }
      ]
    })
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 })
  }
}