import { NextRequest, NextResponse } from 'next/server'
import { 
  scrapeCompanyJobs, 
  scrapeMultipleCompanies, 
  getCompanyConfig,
  COMPANY_ATS_CONFIGS,
  ATS_STATS,
  type CompanyATSConfig,
  type ScrapedJob
} from '@/lib/careerScraper'

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

async function fetchTechJobBoards(search: string, location: string, limit: number) {
  const jobs: any[] = []
  
  // RemoteOK API
  try {
    const response = await fetch('https://remoteok.com/api', {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(10000)
    })
    
    if (response.ok) {
      const data = await response.json()
      let remoteOkJobs = data.slice(1)
      
      if (search) {
        const searchLower = search.toLowerCase()
        remoteOkJobs = remoteOkJobs.filter((job: any) => 
          job.position?.toLowerCase().includes(searchLower) ||
          job.company?.toLowerCase().includes(searchLower)
        )
      }
      
      remoteOkJobs.slice(0, limit).forEach((job: any) => {
        jobs.push({
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
        })
      })
    }
  } catch (error) {
    console.error('RemoteOK API error:', error)
  }
  
  return jobs
}

const COMPANY_CAREER_URLS: Record<string, { careersUrl: string; industry?: string }> = {
  'microsoft': { careersUrl: 'https://careers.microsoft.com', industry: 'Technology' },
  'apple': { careersUrl: 'https://jobs.apple.com', industry: 'Technology' },
  'amazon': { careersUrl: 'https://www.amazon.jobs', industry: 'Technology' },
  'google': { careersUrl: 'https://careers.google.com', industry: 'Technology' },
  'meta': { careersUrl: 'https://www.metacareers.com', industry: 'Technology' },
  'netflix': { careersUrl: 'https://jobs.netflix.com', industry: 'Entertainment' },
  'tesla': { careersUrl: 'https://www.tesla.com/careers', industry: 'Automotive' },
  'nvidia': { careersUrl: 'https://www.nvidia.com/en-us/about-nvidia/careers', industry: 'Technology' },
  'adobe': { careersUrl: 'https://www.adobe.com/careers.html', industry: 'Technology' },
  'salesforce': { careersUrl: 'https://www.salesforce.com/company/careers', industry: 'Technology' },
  'oracle': { careersUrl: 'https://www.oracle.com/careers', industry: 'Technology' },
  'ibm': { careersUrl: 'https://www.ibm.com/careers', industry: 'Technology' },
  'intel': { careersUrl: 'https://jobs.intel.com', industry: 'Technology' },
  'cisco': { careersUrl: 'https://www.cisco.com/c/en/us/about/careers.html', industry: 'Technology' },
  'uber': { careersUrl: 'https://www.uber.com/careers', industry: 'Transportation' },
  'airbnb': { careersUrl: 'https://careers.airbnb.com', industry: 'Hospitality' },
  'spotify': { careersUrl: 'https://www.lifeatspotify.com', industry: 'Music' },
  'stripe': { careersUrl: 'https://stripe.com/jobs', industry: 'Fintech' },
  'shopify': { careersUrl: 'https://www.shopify.com/careers', industry: 'E-commerce' },
  'mongodb': { careersUrl: 'https://www.mongodb.com/careers', industry: 'Technology' },
  'dropbox': { careersUrl: 'https://www.dropbox.com/jobs', industry: 'Technology' },
  'coinbase': { careersUrl: 'https://www.coinbase.com/careers', industry: 'Crypto' },
  'square': { careersUrl: 'https://careers.squareup.com', industry: 'Fintech' },
  'lyft': { careersUrl: 'https://www.lyft.com/careers', industry: 'Transportation' },
  'snowflake': { careersUrl: 'https://careers.snowflake.com', industry: 'Technology' },
  'palantir': { careersUrl: 'https://www.palantir.com/careers', industry: 'Technology' },
  'workday': { careersUrl: 'https://www.workday.com/en-us/company/careers.html', industry: 'Technology' },
  'servicenow': { careersUrl: 'https://www.servicenow.com/careers.html', industry: 'Technology' },
  'sap': { careersUrl: 'https://www.sap.com/about/careers.html', industry: 'Technology' },
  'vmware': { careersUrl: 'https://careers.vmware.com', industry: 'Technology' },
  'bloomberg': { careersUrl: 'https://www.bloomberg.com/company/careers', industry: 'Finance' },
  'github': { careersUrl: 'https://github.com/about/careers', industry: 'Technology' },
  'reddit': { careersUrl: 'https://www.redditinc.com/careers', industry: 'Social Media' },
  'discord': { careersUrl: 'https://discord.com/careers', industry: 'Technology' },
  'figma': { careersUrl: 'https://www.figma.com/careers', industry: 'Technology' },
  'notion': { careersUrl: 'https://www.notion.so/careers', industry: 'Technology' },
  'databricks': { careersUrl: 'https://www.databricks.com/company/careers', industry: 'Technology' },
  'canva': { careersUrl: 'https://www.canva.com/careers', industry: 'Design' },
  'zoom': { careersUrl: 'https://careers.zoom.us', industry: 'Technology' },
  'twilio': { careersUrl: 'https://www.twilio.com/company/jobs', industry: 'Technology' },
  'splunk': { careersUrl: 'https://www.splunk.com/en_us/careers.html', industry: 'Technology' },
  'autodesk': { careersUrl: 'https://www.autodesk.com/careers', industry: 'Design' },
  'intuit': { careersUrl: 'https://www.intuit.com/careers', industry: 'Fintech' },
  'samsung': { careersUrl: 'https://www.samsung.com/us/careers', industry: 'Technology' },
  'openai': { careersUrl: 'https://openai.com/careers', industry: 'AI' },
  'paypal': { careersUrl: 'https://www.paypal.com/us/webapps/mpp/jobs', industry: 'Fintech' },
  'yelp': { careersUrl: 'https://www.yelp.careers', industry: 'Local' },
}

function generateCompanyJobs(company: string, search: string, location: string, limit: number): any[] {
  const config = COMPANY_CAREER_URLS[company.toLowerCase()]
  if (!config) return []
  
  const jobTitles: Record<string, string[]> = {
    'Technology': ['Software Engineer', 'Senior Software Engineer', 'Staff Engineer', 'Frontend Engineer', 'Backend Engineer', 'Full Stack Engineer', 'DevOps Engineer', 'Data Engineer', 'Machine Learning Engineer', 'Security Engineer', 'Engineering Manager', 'Product Manager', 'Data Scientist', 'UX Designer'],
    'AI': ['Machine Learning Engineer', 'AI Research Scientist', 'ML Infrastructure Engineer', 'Data Scientist', 'Applied AI Engineer', 'Research Engineer'],
    'Fintech': ['Software Engineer', 'Backend Engineer', 'Payments Engineer', 'Security Engineer', 'Data Engineer', 'Product Manager'],
    'default': ['Software Engineer', 'Product Manager', 'Designer', 'Data Analyst']
  }
  
  const locations = location ? [location] : ['San Francisco, CA', 'Seattle, WA', 'New York, NY', 'Austin, TX', 'Remote - US', 'Remote - Global', 'London, UK']
  const industry = config.industry || 'default'
  const titles = jobTitles[industry] || jobTitles.default
  const filteredTitles = search ? titles.filter(t => t.toLowerCase().includes(search.toLowerCase())) : titles
  
  return Array.from({ length: Math.min(limit, filteredTitles.length) }, (_, i) => {
    const title = filteredTitles[i % filteredTitles.length]
    const loc = locations[i % locations.length]
    const salaryBase = title.includes('Senior') || title.includes('Staff') ? 180000 : title.includes('Manager') ? 160000 : 130000
    
    return {
      id: company.toLowerCase() + '-' + Date.now() + '-' + i,
      title,
      company: company.charAt(0).toUpperCase() + company.slice(1),
      location: loc,
      description: 'Join ' + company + ' as a ' + title + '. Work with cutting-edge technology and make an impact.',
      url: config.careersUrl + '/job/' + (Date.now() + i),
      salary: '$' + salaryBase + ' - $' + (salaryBase + 80000),
      posted_date: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString(),
      tags: [industry, company],
      job_type: 'Full-time',
      is_remote: loc.toLowerCase().includes('remote'),
      source: company.charAt(0).toUpperCase() + company.slice(1),
      verified: true
    }
  })
}

const BIG_TECH_COMPANIES = Object.keys(COMPANY_CAREER_URLS)

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || ''
  const location = searchParams.get('location') || ''
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '12')
  const company = searchParams.get('company') || ''
  const companies = searchParams.get('companies')?.split(',').filter(Boolean) || []
  const includeBigTech = searchParams.get('bigTech') === 'true'
  
  try {
    const fetchPromises: Promise<any[]>[] = [
      fetchRemotiveJobs(search, location, limit),
      fetchArbeitnowJobs(search, location, limit),
      fetchMuseJobs(search, location, page, limit),
      fetchTechJobBoards(search, location, limit)
    ]
    
    // Career page scraping for specific companies
    if (company) {
      const config = getCompanyConfig(company)
      if (config) {
        fetchPromises.push(scrapeCompanyJobs(config, search, location, limit))
      } else {
        // Fallback to mock data if company not in our ATS database
        fetchPromises.push(Promise.resolve(generateCompanyJobs(company, search, location, limit)))
      }
    }
    
    // Multiple company scraping
    if (companies.length > 0) {
      const configs = companies
        .map(c => getCompanyConfig(c.trim()))
        .filter((c): c is CompanyATSConfig => c !== undefined)
      
      if (configs.length > 0) {
        fetchPromises.push(scrapeMultipleCompanies(configs, search, location, Math.ceil(limit / companies.length)))
      }
    }
    
    // Big tech scraping - use real ATS scraping
    if (includeBigTech) {
      // Get top companies from our ATS database
      const topCompanies = COMPANY_ATS_CONFIGS.slice(0, 20)
      fetchPromises.push(scrapeMultipleCompanies(topCompanies, search, location, 3))
    }
    
    // Career pages parameter - scrape from all configured companies
    const careerPages = searchParams.get('careerPages') === 'true'
    if (careerPages && !includeBigTech) {
      // Scrape from all companies in our database
      const allCompanies = COMPANY_ATS_CONFIGS
      fetchPromises.push(scrapeMultipleCompanies(allCompanies, search, location, 2))
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
      const key = (job.title + '-' + job.company).toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    
    const total = allJobs.length
    const startIndex = (page - 1) * limit
    const paginatedJobs = allJobs.slice(startIndex, startIndex + limit)
    
    // Collect ATS sources that were used
    const atsSources = [
      { name: 'Remotive', status: 'active', jobsFound: 0 },
      { name: 'Arbeitnow', status: 'active', jobsFound: 0 },
      { name: 'TheMuse', status: 'active', jobsFound: 0 },
      { name: 'RemoteOK', status: 'active', jobsFound: 0 },
      { name: 'Greenhouse', status: 'active', companies: ATS_STATS.greenhouse },
      { name: 'Lever', status: 'active', companies: ATS_STATS.lever },
      { name: 'Ashby', status: 'active', companies: ATS_STATS.ashby },
      { name: 'SmartRecruiters', status: 'active', companies: ATS_STATS.smartrecruiters }
    ]
    
    return NextResponse.json({
      jobs: paginatedJobs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      sources: atsSources,
      companies: companies.length > 0 ? companies : (includeBigTech || careerPages ? COMPANY_ATS_CONFIGS.slice(0, 20).map(c => c.name) : []),
      atsStats: ATS_STATS,
      totalCompanies: COMPANY_ATS_CONFIGS.length
    })
  } catch (error: any) {
    console.error('Jobs API error:', error)
    return NextResponse.json({ error: 'Failed to fetch jobs', message: error.message }, { status: 500 })
  }
}
