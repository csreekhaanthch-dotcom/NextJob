import { NextRequest, NextResponse } from 'next/server'

async function fetchRemotiveJobs(search: string, limit: number) {
  try {
    const params = new URLSearchParams()
    if (search) params.append('search', search)
    if (limit) params.append('limit', String(Math.min(limit, 50)))
    
    const res = await fetch(`https://remotive.com/api/remote-jobs?${params}`, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(10000)
    })
    
    if (!res.ok) return []
    const data = await res.json()
    
    return (data.jobs || []).map((job: any, index: number) => ({
      id: `remotive-${job.id || index}-${Date.now()}`,
      title: job.title || 'Unknown Position',
      company: job.company_name || 'Unknown Company',
      location: job.candidate_required_location || 'Remote',
      description: (job.description || '').substring(0, 300),
      url: job.url || '#',
      salary: job.salary || null,
      posted_date: job.publication_date || new Date().toISOString(),
      source: 'Remotive',
      is_remote: true
    }))
  } catch {
    return []
  }
}

async function fetchArbeitnowJobs(search: string, limit: number) {
  try {
    const res = await fetch('https://www.arbeitnow.com/api/job-board-api', {
      signal: AbortSignal.timeout(10000)
    })
    
    if (!res.ok) return []
    const data = await res.json()
    let jobs = data.data || []
    
    if (search) {
      const s = search.toLowerCase()
      jobs = jobs.filter((j: any) => 
        (j.title || '').toLowerCase().includes(s) ||
        (j.company_name || '').toLowerCase().includes(s)
      )
    }
    
    return jobs.slice(0, limit).map((job: any, index: number) => ({
      id: `arbeitnow-${job.slug || job.id || index}-${Date.now()}`,
      title: job.title || 'Unknown Position',
      company: job.company_name || 'Unknown Company',
      location: job.location || 'Not specified',
      description: (job.description || '').substring(0, 300),
      url: job.url || `https://arbeitnow.com/job/${job.slug || ''}`,
      salary: job.salary || null,
      posted_date: job.created_at || new Date().toISOString(),
      source: 'Arbeitnow',
      is_remote: job.remote || false
    }))
  } catch {
    return []
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || ''
  const limit = parseInt(searchParams.get('limit') || '20')
  
  const [remotive, arbeitnow] = await Promise.all([
    fetchRemotiveJobs(search, limit),
    fetchArbeitnowJobs(search, limit)
  ])
  
  let allJobs = [...remotive, ...arbeitnow]
  
  // Remove duplicates by title + company
  const seen = new Set()
  allJobs = allJobs.filter(job => {
    const key = `${job.title}-${job.company}`.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
  
  // Sort by date
  allJobs.sort((a, b) => 
    new Date(b.posted_date).getTime() - new Date(a.posted_date).getTime()
  )
  
  return NextResponse.json({ jobs: allJobs.slice(0, limit), total: allJobs.length })
}
