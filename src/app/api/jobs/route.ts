import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

// Helper function to strip HTML tags and clean description
function stripHtml(html: string): string {
  if (!html) return ''
  
  // Remove HTML tags
  let text = html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '') // Remove style tags
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // Remove script tags
    .replace(/<[^>]+>/g, ' ') // Remove HTML tags
    .replace(/&nbsp;/g, ' ') // Replace &nbsp;
    .replace(/&amp;/g, '&') // Replace &amp;
    .replace(/&lt;/g, '<') // Replace &lt;
    .replace(/&gt;/g, '>') // Replace &gt;
    .replace(/&quot;/g, '"') // Replace &quot;
    .replace(/&#39;/g, "'") // Replace &#39;
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
  
  return text
}

// Job Source Fetchers
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
      signal: AbortSignal.timeout(10000)
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
    
    return jobs.slice(0, limit || 20).map((job: any) => ({
      id: `arbeitnow-${job.slug || job.id}`,
      title: job.title || 'Unknown Title',
      company: job.company_name || 'Unknown Company',
      location: job.location || 'Not specified',
      description: stripHtml(job.description?.substring(0, 500) || ''),
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
      description: stripHtml(job.description?.substring(0, 500) || ''),
      url: job.redirect_url,
      salary: job.salary_min && job.salary_max 
        ? `$${Math.round(job.salary_min)} - $${Math.round(job.salary_max)}`
        : null,
      posted_date: job.created,
      tags: [job.contract_time || 'N/A', job.category?.label || 'General'],
      job_type: job.contract_time || 'Full-time',
      is_remote: job.location?.display_name?.toLowerCase().includes('remote') || false,
      source: 'Adzuna'
    }))
  } catch (error) {
    console.error('Adzuna API error:', error)
    return []
  }
}

async function fetchJSearchJobs(search: string, location: string, page: number, limit: number) {
  const apiKey = process.env.JSEARCH_API_KEY
  
  if (!apiKey) return []
  
  try {
    const query = search ? `${search} ${location || ''}`.trim() : 'developer'
    
    const response = await fetch(
      `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(query)}&page=${page}&num_pages=1`,
      {
        headers: {
          'X-RapidAPI-Key': apiKey,
          'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
        },
        signal: AbortSignal.timeout(10000)
      }
    )
    
    if (!response.ok) return []
    
    const data = await response.json()
    
    return (data.data || []).map((job: any) => ({
      id: `jsearch-${job.job_id}`,
      title: job.job_title || 'Unknown Title',
      company: job.employer_name || 'Unknown Company',
      location: job.job_city && job.job_state 
        ? `${job.job_city}, ${job.job_state}` 
        : job.job_country || 'Remote',
      description: stripHtml(job.job_description?.substring(0, 500) || ''),
      url: job.job_apply_link,
      salary: job.job_min_salary && job.job_max_salary
        ? `$${job.job_min_salary} - $${job.job_max_salary} ${job.job_salary_period || 'yearly'}`
        : null,
      posted_date: job.job_posted_at_datetime_utc,
      tags: [job.job_employment_type || 'Full-time'],
      job_type: job.job_employment_type || 'Full-time',
      is_remote: job.job_is_remote || false,
      source: 'JSearch'
    }))
  } catch (error) {
    console.error('JSearch API error:', error)
    return []
  }
}

// AI-powered job matching using embeddings
async function calculateMatchScore(job: any, userProfile?: string): Promise<number> {
  if (!userProfile) return 0
  
  try {
    const zai = await ZAI.create()
    
    const prompt = `Rate the match between this job and candidate profile. Return only a number 0-100.

Job Title: ${job.title}
Job Description: ${job.description}
Company: ${job.company}
Required Skills: ${job.tags?.join(', ')}

Candidate Profile: ${userProfile}

Match Score (0-100):`

    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a job matching assistant. Return only a number between 0 and 100.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 10
    })
    
    const score = parseInt(completion.choices[0]?.message?.content?.trim() || '0')
    return Math.min(100, Math.max(0, isNaN(score) ? 0 : score))
  } catch (error) {
    console.error('Match score error:', error)
    return 0
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  
  const search = searchParams.get('search') || ''
  const location = searchParams.get('location') || ''
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '12')
  const sources = searchParams.get('sources')?.split(',') || ['remotive', 'arbeitnow', 'adzuna', 'jsearch']
  const userProfile = searchParams.get('profile') || undefined
  
  try {
    // Fetch from all enabled sources in parallel
    const fetchPromises: Promise<any[]>[] = []
    
    if (sources.includes('remotive')) {
      fetchPromises.push(fetchRemotiveJobs(search, location, limit))
    }
    if (sources.includes('arbeitnow')) {
      fetchPromises.push(fetchArbeitnowJobs(search, location, limit))
    }
    if (sources.includes('adzuna')) {
      fetchPromises.push(fetchAdzunaJobs(search, location, page, limit))
    }
    if (sources.includes('jsearch')) {
      fetchPromises.push(fetchJSearchJobs(search, location, page, limit))
    }
    
    const results = await Promise.all(fetchPromises)
    
    // Combine all jobs
    let allJobs = results.flat()
    
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
    
    // Calculate match scores if profile provided
    if (userProfile && allJobs.length > 0) {
      const matchPromises = allJobs.slice(0, 20).map(async (job) => {
        job.match_score = await calculateMatchScore(job, userProfile)
        return job
      })
      const jobsWithScores = await Promise.all(matchPromises)
      
      // Sort by match score
      jobsWithScores.sort((a, b) => (b.match_score || 0) - (a.match_score || 0))
      allJobs = [...jobsWithScores, ...allJobs.slice(20)]
    }
    
    // Apply pagination
    const total = allJobs.length
    const startIndex = (page - 1) * limit
    const paginatedJobs = allJobs.slice(startIndex, startIndex + limit)
    
    return NextResponse.json({
      jobs: paginatedJobs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      sources: sources.map(s => ({
        name: s,
        status: 'active'
      }))
    })
  } catch (error: any) {
    console.error('Jobs API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch jobs', message: error.message },
      { status: 500 }
    )
  }
}