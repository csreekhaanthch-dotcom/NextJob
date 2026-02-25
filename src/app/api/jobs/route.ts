import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

// Helper function to strip HTML tags
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

async function fetchRemotiveJobs(search: string, location: string, limit: number) {
  try {
    const params = new URLSearchParams()
    if (search) params.append('search', search)
    if (limit) params.append('limit', String(Math.min(limit, 50)))
    
    const response = await fetch(`https://remotive.com/api/remote-jobs?${params.toString()}`, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(10000)
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
    
    return jobs.map((job: any) => ({
      id: `remotive-${job.id}`,
      title: job.title || 'Unknown Title',
      company: job.company_name || 'Unknown Company',
      location: job.candidate_required_location || 'Remote',
      description: stripHtml(job.description?.substring(0, 300) || ''),
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
      signal: AbortSignal.timeout(10000)
    })
    
    if (!response.ok) return []
    
    const data = await response.json()
    let jobs = data.data || []
    
    if (search) {
      const searchLower = search.toLowerCase()
      jobs = jobs.filter((job: any) => 
        job.title?.toLowerCase().includes(searchLower) ||
        job.company_name?.toLowerCase().includes(searchLower)
      )
    }
    
    if (location) {
      const locLower = location.toLowerCase()
      jobs = jobs.filter((job: any) => 
        job.location?.toLowerCase().includes(locLower)
      )
    }
    
    return jobs.slice(0, limit || 20).map((job: any) => ({
      id: `arbeitnow-${job.slug || job.id}`,
      title: job.title || 'Unknown Title',
      company: job.company_name || 'Unknown Company',
      location: job.location || 'Not specified',
      description: stripHtml(job.description?.substring(0, 300) || ''),
      url: job.url || `https://www.arbeitnow.com/job/${job.slug}`,
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

async function fetchAdzunaJobs(search: string, location: string, page: number, limit: number) {
  const appId = process.env.ADZUNA_APP_ID
  const apiKey = process.env.ADZUNA_API_KEY
  
  if (!appId || !apiKey) return []
  
  try {
    const params = new URLSearchParams({
      app_id: appId,
      app_key: apiKey,
      results_per_page: String(limit),
    })
    if (search) params.append('what', search)
    if (location) params.append('where', location)
    
    const response = await fetch(
      `https://api.adzuna.com/v1/api/jobs/us/search/${page}?${params.toString()}`,
      { signal: AbortSignal.timeout(10000) }
    )
    
    if (!response.ok) return []
    
    const data = await response.json()
    
    return (data.results || []).map((job: any) => ({
      id: `adzuna-${job.id}`,
      title: job.title || 'Unknown Title',
      company: job.company?.display_name || 'Unknown Company',
      location: job.location?.display_name || 'Not specified',
      description: stripHtml(job.description?.substring(0, 300) || ''),
      url: job.redirect_url,
      salary: job.salary_min && job.salary_max 
        ? `$${Math.round(job.salary_min)} - $${Math.round(job.salary_max)}`
        : null,
      posted_date: job.created,
      tags: [job.contract_time || 'N/A'],
      job_type: job.contract_time || 'Full-time',
      is_remote: false,
      source: 'Adzuna'
    }))
  } catch (error) {
    console.error('Adzuna API error:', error)
    return []
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  
  const search = searchParams.get('search') || ''
  const location = searchParams.get('location') || ''
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '12')
  
  try {
    const [remotiveJobs, arbeitnowJobs, adzunaJobs] = await Promise.all([
      fetchRemotiveJobs(search, location, limit),
      fetchArbeitnowJobs(search, location, limit),
      fetchAdzunaJobs(search, location, page, limit)
    ])
    
    let allJobs = [...remotiveJobs, ...arbeitnowJobs, ...adzunaJobs]
    
    // Sort by date
    allJobs.sort((a, b) => {
      const dateA = a.posted_date ? new Date(a.posted_date).getTime() : 0
      const dateB = b.posted_date ? new Date(b.posted_date).getTime() : 0
      return dateB - dateA
    })
    
    // Remove duplicates
    const seen = new Set()
    allJobs = allJobs.filter(job => {
      const key = `${job.title}-${job.company}`.toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    
    const total = allJobs.length
    const startIndex = (page - 1) * limit
    const paginatedJobs = allJobs.slice(startIndex, startIndex + limit)
    
    return NextResponse.json({
      jobs: paginatedJobs,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    })
  } catch (error: any) {
    console.error('Jobs API error:', error)
    return NextResponse.json({ error: 'Failed to fetch jobs', message: error.message }, { status: 500 })
  }
}
