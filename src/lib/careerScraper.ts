/**
 * Career Page Scraper
 * Fetches real jobs from company career pages via ATS APIs
 * Supports: Greenhouse, Lever, Ashby, SmartRecruiters, Workday
 */

// Company ATS Configuration
export interface CompanyATSConfig {
  name: string
  ats: 'greenhouse' | 'lever' | 'ashby' | 'smartrecruiters' | 'workday' | 'custom'
  identifier: string // ATS-specific company identifier
  careerUrl?: string
  industry?: string
}

// Comprehensive company ATS database
export const COMPANY_ATS_CONFIGS: CompanyATSConfig[] = [
  // === GREENHOUSE COMPANIES ===
  { name: 'Airbnb', ats: 'greenhouse', identifier: 'airbnb', industry: 'Technology' },
  { name: 'Stripe', ats: 'greenhouse', identifier: 'stripe', industry: 'Fintech' },
  { name: 'Notion', ats: 'greenhouse', identifier: 'notion', industry: 'Technology' },
  { name: 'Figma', ats: 'greenhouse', identifier: 'figma', industry: 'Design' },
  { name: 'Discord', ats: 'greenhouse', identifier: 'discord', industry: 'Technology' },
  { name: 'Canva', ats: 'greenhouse', identifier: 'canva', industry: 'Design' },
  { name: 'Dropbox', ats: 'greenhouse', identifier: 'dropbox', industry: 'Technology' },
  { name: 'Coinbase', ats: 'greenhouse', identifier: 'coinbase', industry: 'Crypto' },
  { name: 'Square', ats: 'greenhouse', identifier: 'square', industry: 'Fintech' },
  { name: 'Lyft', ats: 'greenhouse', identifier: 'lyft', industry: 'Transportation' },
  { name: 'Pinterest', ats: 'greenhouse', identifier: 'pinterest', industry: 'Social Media' },
  { name: 'Slack', ats: 'greenhouse', identifier: 'slack', industry: 'Technology' },
  { name: 'Zapier', ats: 'greenhouse', identifier: 'zapier', industry: 'Technology' },
  { name: 'Twilio', ats: 'greenhouse', identifier: 'twilio', industry: 'Technology' },
  { name: 'Shopify', ats: 'greenhouse', identifier: 'shopify', industry: 'E-commerce' },
  { name: 'Databricks', ats: 'greenhouse', identifier: 'databricks', industry: 'Technology' },
  { name: 'Plaid', ats: 'greenhouse', identifier: 'plaid', industry: 'Fintech' },
  { name: 'Retool', ats: 'greenhouse', identifier: 'retool', industry: 'Technology' },
  { name: 'Vercel', ats: 'greenhouse', identifier: 'vercel', industry: 'Technology' },
  { name: 'Linear', ats: 'greenhouse', identifier: 'linear', industry: 'Technology' },
  { name: 'Mercury', ats: 'greenhouse', identifier: 'mercury', industry: 'Fintech' },
  { name: 'Ramp', ats: 'greenhouse', identifier: 'ramp', industry: 'Fintech' },
  { name: 'Rippling', ats: 'greenhouse', identifier: 'rippling', industry: 'Technology' },
  { name: 'Deel', ats: 'greenhouse', identifier: 'deel', industry: 'HR Tech' },
  { name: 'Loom', ats: 'greenhouse', identifier: 'loom', industry: 'Technology' },
  
  // === LEVER COMPANIES ===
  { name: 'Netflix', ats: 'lever', identifier: 'netflix', industry: 'Entertainment' },
  { name: 'Segment', ats: 'lever', identifier: 'segment', industry: 'Technology' },
  { name: 'Coursera', ats: 'lever', identifier: 'coursera', industry: 'Education' },
  { name: 'Quora', ats: 'lever', identifier: 'quora', industry: 'Social Media' },
  { name: 'Headspace', ats: 'lever', identifier: 'headspace', industry: 'Health' },
  { name: 'Hipcamp', ats: 'lever', identifier: 'hipcamp', industry: 'Travel' },
  { name: 'Twitch', ats: 'lever', identifier: 'twitch', industry: 'Entertainment' },
  { name: 'Eventbrite', ats: 'lever', identifier: 'eventbrite', industry: 'Events' },
  { name: 'Niantic', ats: 'lever', identifier: 'niantic', industry: 'Gaming' },
  { name: 'Moderna', ats: 'lever', identifier: 'moderna', industry: 'Biotech' },
  { name: 'MuckRack', ats: 'lever', identifier: 'muckrack', industry: 'Media' },
  { name: 'Scale', ats: 'lever', identifier: 'scale', industry: 'AI' },
  { name: 'OpenAI', ats: 'lever', identifier: 'openai', industry: 'AI' },
  { name: 'Y Combinator', ats: 'lever', identifier: 'ycombinator', industry: 'VC' },
  
  // === ASHBY COMPANIES ===
  { name: 'Tally', ats: 'ashby', identifier: 'tally', industry: 'Fintech' },
  { name: 'Polly', ats: 'ashby', identifier: 'polly', industry: 'Technology' },
  { name: 'Flox', ats: 'ashby', identifier: 'flox', industry: 'Technology' },
  { name: 'GlossGenius', ats: 'ashby', identifier: 'glossgenius', industry: 'Beauty' },
  { name: 'Pylon', ats: 'ashby', identifier: 'pylon', industry: 'Technology' },
  { name: 'Nash', ats: 'ashby', identifier: 'nash', industry: 'Logistics' },
  
  // === SMARTRECRUITERS COMPANIES ===
  { name: 'Uber', ats: 'smartrecruiters', identifier: 'uber', industry: 'Transportation' },
  { name: 'Spotify', ats: 'smartrecruiters', identifier: 'spotify', industry: 'Music' },
  { name: 'Dell', ats: 'smartrecruiters', identifier: 'dell', industry: 'Technology' },
  { name: 'Vimeo', ats: 'smartrecruiters', identifier: 'vimeo', industry: 'Video' },
  { name: 'Docusign', ats: 'smartrecruiters', identifier: 'docusign', industry: 'Technology' },
  { name: 'Line', ats: 'smartrecruiters', identifier: 'line', industry: 'Technology' },
  { name: 'Kaiser', ats: 'smartrecruiters', identifier: 'kaiserpermanente', industry: 'Healthcare' },
]

// Job interface
export interface ScrapedJob {
  id: string
  title: string
  company: string
  location: string
  description: string
  url: string
  salary?: string
  posted_date: string
  tags: string[]
  job_type: string
  is_remote: boolean
  source: string
  ats: string
}

// ==================== GREENHOUSE SCRAPER ====================
async function scrapeGreenhouse(config: CompanyATSConfig, search?: string, location?: string, limit: number = 10): Promise<ScrapedJob[]> {
  const url = `https://boards-api.greenhouse.io/v1/boards/${config.identifier}/jobs?content=true`
  
  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'NextJob/1.0 (Career Platform)'
      },
      signal: AbortSignal.timeout(15000)
    })
    
    if (!response.ok) return []
    
    const data = await response.json()
    let jobs = data.jobs || []
    
    // Filter by search and location
    if (search) {
      const searchLower = search.toLowerCase()
      jobs = jobs.filter((job: any) => 
        job.title?.toLowerCase().includes(searchLower) ||
        job.content?.toLowerCase().includes(searchLower)
      )
    }
    
    if (location) {
      const locLower = location.toLowerCase()
      jobs = jobs.filter((job: any) => 
        job.location?.name?.toLowerCase().includes(locLower)
      )
    }
    
    return jobs.slice(0, limit).map((job: any): ScrapedJob => {
      const content = job.content || ''
      const isRemote = job.location?.name?.toLowerCase().includes('remote') || 
                       content.toLowerCase().includes('remote')
      
      return {
        id: `gh-${config.identifier}-${job.id}`,
        title: job.title || 'Unknown Title',
        company: config.name,
        location: job.location?.name || 'Not specified',
        description: stripHtml(content).substring(0, 500),
        url: `https://boards.greenhouse.io/${config.identifier}/jobs/${job.id}`,
        salary: extractSalary(content),
        posted_date: job.updated_at || new Date().toISOString(),
        tags: extractSkills(content),
        job_type: detectJobType(job.title || '', content),
        is_remote: isRemote,
        source: config.name,
        ats: 'Greenhouse'
      }
    })
  } catch (error) {
    console.error(`Greenhouse scrape error for ${config.name}:`, error)
    return []
  }
}

// ==================== LEVER SCRAPER ====================
async function scrapeLever(config: CompanyATSConfig, search?: string, location?: string, limit: number = 10): Promise<ScrapedJob[]> {
  const url = `https://api.lever.co/v0/postings/${config.identifier}?mode=json`
  
  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'NextJob/1.0 (Career Platform)'
      },
      signal: AbortSignal.timeout(15000)
    })
    
    if (!response.ok) return []
    
    let jobs = await response.json()
    
    // Filter by search and location
    if (search) {
      const searchLower = search.toLowerCase()
      jobs = jobs.filter((job: any) => 
        job.text?.toLowerCase().includes(searchLower) ||
        job.description?.toLowerCase().includes(searchLower)
      )
    }
    
    if (location) {
      const locLower = location.toLowerCase()
      jobs = jobs.filter((job: any) => 
        job.categories?.location?.toLowerCase().includes(locLower) ||
        job.categories?.allLocations?.some((l: string) => l.toLowerCase().includes(locLower))
      )
    }
    
    return jobs.slice(0, limit).map((job: any): ScrapedJob => {
      const description = job.descriptionPlain || job.description || ''
      const isRemote = job.categories?.location?.toLowerCase().includes('remote') ||
                       job.workplaceType === 'remote'
      
      return {
        id: `lever-${config.identifier}-${job.id}`,
        title: job.text || 'Unknown Title',
        company: config.name,
        location: job.categories?.location || job.categories?.allLocations?.join(', ') || 'Not specified',
        description: description.substring(0, 500),
        url: job.hostedUrl || `https://jobs.lever.co/${config.identifier}/${job.id}`,
        salary: job.salaryRange ? formatLeverSalary(job.salaryRange) : extractSalary(description),
        posted_date: job.createdAt || new Date().toISOString(),
        tags: job.tags || extractSkills(description),
        job_type: job.categories?.commitment || detectJobType(job.text || '', description),
        is_remote: isRemote,
        source: config.name,
        ats: 'Lever'
      }
    })
  } catch (error) {
    console.error(`Lever scrape error for ${config.name}:`, error)
    return []
  }
}

// ==================== ASHBY SCRAPER ====================
async function scrapeAshby(config: CompanyATSConfig, search?: string, location?: string, limit: number = 10): Promise<ScrapedJob[]> {
  const url = `https://api.ashbyhq.com/posting/${config.identifier}`
  
  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'NextJob/1.0 (Career Platform)'
      },
      signal: AbortSignal.timeout(15000)
    })
    
    if (!response.ok) return []
    
    const data = await response.json()
    let jobs = data.results || data.jobs || data || []
    
    if (!Array.isArray(jobs)) return []
    
    // Filter by search and location
    if (search) {
      const searchLower = search.toLowerCase()
      jobs = jobs.filter((job: any) => 
        job.title?.toLowerCase().includes(searchLower) ||
        job.description?.toLowerCase().includes(searchLower)
      )
    }
    
    if (location) {
      const locLower = location.toLowerCase()
      jobs = jobs.filter((job: any) => 
        job.location?.toLowerCase().includes(locLower)
      )
    }
    
    return jobs.slice(0, limit).map((job: any): ScrapedJob => {
      const description = job.description || job.jobDescription || ''
      
      return {
        id: `ashby-${config.identifier}-${job.id}`,
        title: job.title || 'Unknown Title',
        company: config.name,
        location: job.location || 'Not specified',
        description: stripHtml(description).substring(0, 500),
        url: job.externalUrl || `https://jobs.ashbyhq.com/${config.identifier}/${job.id}`,
        salary: job.compensation ? formatAshbySalary(job.compensation) : extractSalary(description),
        posted_date: job.publishedAt || job.created_at || new Date().toISOString(),
        tags: job.department ? [job.department] : extractSkills(description),
        job_type: job.employmentType || detectJobType(job.title || '', description),
        is_remote: job.isRemote || job.location?.toLowerCase().includes('remote'),
        source: config.name,
        ats: 'Ashby'
      }
    })
  } catch (error) {
    console.error(`Ashby scrape error for ${config.name}:`, error)
    return []
  }
}

// ==================== SMARTRECRUITERS SCRAPER ====================
async function scrapeSmartRecruiters(config: CompanyATSConfig, search?: string, location?: string, limit: number = 10): Promise<ScrapedJob[]> {
  const url = `https://api.smartrecruiters.com/v1/companies/${config.identifier}/postings`
  
  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'NextJob/1.0 (Career Platform)'
      },
      signal: AbortSignal.timeout(15000)
    })
    
    if (!response.ok) return []
    
    const data = await response.json()
    let jobs = data.content || []
    
    // Filter by search and location
    if (search) {
      const searchLower = search.toLowerCase()
      jobs = jobs.filter((job: any) => 
        job.name?.toLowerCase().includes(searchLower) ||
        job.jobAd?.sections?.qualifications?.text?.toLowerCase().includes(searchLower)
      )
    }
    
    if (location) {
      const locLower = location.toLowerCase()
      jobs = jobs.filter((job: any) => 
        job.location?.city?.toLowerCase().includes(locLower) ||
        job.location?.region?.toLowerCase().includes(locLower) ||
        job.location?.country?.toLowerCase().includes(locLower)
      )
    }
    
    return jobs.slice(0, limit).map((job: any): ScrapedJob => {
      const description = job.jobAd?.sections?.qualifications?.text || 
                         job.jobAd?.sections?.jobDescription?.text || ''
      
      return {
        id: `sr-${config.identifier}-${job.id}`,
        title: job.name || job.title || 'Unknown Title',
        company: config.name,
        location: formatSmartRecruitersLocation(job.location),
        description: stripHtml(description).substring(0, 500),
        url: `https://jobs.smartrecruiters.com/${config.identifier}/${job.id}`,
        salary: formatSmartRecruitersSalary(job.salary),
        posted_date: job.releasedDate || job.updatedTime || new Date().toISOString(),
        tags: job.function?.label ? [job.function.label] : [],
        job_type: job.typeOfEmployment?.label || 'Full-time',
        is_remote: job.remoteWork?.type === 'remote' || description.toLowerCase().includes('remote'),
        source: config.name,
        ats: 'SmartRecruiters'
      }
    })
  } catch (error) {
    console.error(`SmartRecruiters scrape error for ${config.name}:`, error)
    return []
  }
}

// ==================== MAIN SCRAPER FUNCTION ====================
export async function scrapeCompanyJobs(
  company: CompanyATSConfig,
  search?: string,
  location?: string,
  limit: number = 10
): Promise<ScrapedJob[]> {
  switch (company.ats) {
    case 'greenhouse':
      return scrapeGreenhouse(company, search, location, limit)
    case 'lever':
      return scrapeLever(company, search, location, limit)
    case 'ashby':
      return scrapeAshby(company, search, location, limit)
    case 'smartrecruiters':
      return scrapeSmartRecruiters(company, search, location, limit)
    default:
      return []
  }
}

// Scrape multiple companies in parallel
export async function scrapeMultipleCompanies(
  companies: CompanyATSConfig[],
  search?: string,
  location?: string,
  limitPerCompany: number = 5
): Promise<ScrapedJob[]> {
  const results = await Promise.all(
    companies.map(company => scrapeCompanyJobs(company, search, location, limitPerCompany))
  )
  
  return results.flat()
}

// Get company config by name
export function getCompanyConfig(companyName: string): CompanyATSConfig | undefined {
  return COMPANY_ATS_CONFIGS.find(
    c => c.name.toLowerCase() === companyName.toLowerCase()
  )
}

// Get all companies by ATS
export function getCompaniesByATS(ats: string): CompanyATSConfig[] {
  return COMPANY_ATS_CONFIGS.filter(c => c.ats === ats)
}

// ==================== HELPER FUNCTIONS ====================
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

function extractSalary(text: string): string | undefined {
  const patterns = [
    /\$[\d,]+(?:\s*-\s*\$?[\d,]+)?\s*(?:per\s+year|annually|\/year)?/gi,
    /(?:salary|compensation|pay)[:\s]+\$[\d,]+(?:\s*-\s*\$?[\d,]+)?/gi,
    /[\d,]+\s*(?:USD|EUR|GBP)/gi,
  ]
  
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) return match[0].trim()
  }
  
  return undefined
}

function extractSkills(text: string): string[] {
  const skillPatterns = [
    /\b(JavaScript|TypeScript|Python|Java|Go|Golang|Ruby|PHP|C\+\+|C#|Rust|Swift|Kotlin|Scala)\b/gi,
    /\b(React|Vue|Angular|Next\.js|Node\.js|Django|Flask|Spring|Express|FastAPI)\b/gi,
    /\b(AWS|Azure|GCP|Docker|Kubernetes|Terraform|Jenkins|CI\/CD)\b/gi,
    /\b(PostgreSQL|MySQL|MongoDB|Redis|Elasticsearch|Kafka|RabbitMQ)\b/gi,
    /\b(Machine Learning|AI|Data Science|Analytics|SQL|Python)\b/gi,
  ]
  
  const skills = new Set<string>()
  
  for (const pattern of skillPatterns) {
    const matches = text.match(pattern) || []
    matches.forEach(skill => skills.add(skill))
  }
  
  return Array.from(skills).slice(0, 5)
}

function detectJobType(title: string, description: string): string {
  const text = (title + ' ' + description).toLowerCase()
  
  if (text.includes('part-time') || text.includes('part time')) return 'Part-time'
  if (text.includes('contract') || text.includes('contractor')) return 'Contract'
  if (text.includes('intern')) return 'Internship'
  if (text.includes('freelance')) return 'Freelance'
  
  return 'Full-time'
}

function formatLeverSalary(salaryRange: any): string | undefined {
  if (!salaryRange) return undefined
  
  const { min, max } = salaryRange
  if (!min && !max) return undefined
  
  if (min && max) {
    return `$${formatNumber(min)} - $${formatNumber(max)}`
  }
  
  return `$${formatNumber(min || max)}`
}

function formatAshbySalary(compensation: any): string | undefined {
  if (!compensation) return undefined
  
  const { baseSalary, baseSalaryMin, baseSalaryMax } = compensation
  
  if (baseSalaryMin && baseSalaryMax) {
    return `$${formatNumber(baseSalaryMin)} - $${formatNumber(baseSalaryMax)}`
  }
  
  if (baseSalary) {
    return `$${formatNumber(baseSalary)}`
  }
  
  return undefined
}

function formatSmartRecruitersSalary(salary: any): string | undefined {
  if (!salary) return undefined
  
  const { min, max, currency } = salary
  const curr = currency || 'USD'
  
  if (min?.value && max?.value) {
    return `${curr} ${formatNumber(min.value)} - ${formatNumber(max.value)}`
  }
  
  if (min?.value || max?.value) {
    return `${curr} ${formatNumber(min?.value || max?.value)}`
  }
  
  return undefined
}

function formatSmartRecruitersLocation(location: any): string {
  if (!location) return 'Not specified'
  
  const parts = [
    location.city,
    location.region,
    location.country
  ].filter(Boolean)
  
  return parts.join(', ') || 'Not specified'
}

function formatNumber(num: number): string {
  return num.toLocaleString('en-US')
}

// Export counts
export const ATS_STATS = {
  greenhouse: COMPANY_ATS_CONFIGS.filter(c => c.ats === 'greenhouse').length,
  lever: COMPANY_ATS_CONFIGS.filter(c => c.ats === 'lever').length,
  ashby: COMPANY_ATS_CONFIGS.filter(c => c.ats === 'ashby').length,
  smartrecruiters: COMPANY_ATS_CONFIGS.filter(c => c.ats === 'smartrecruiters').length,
  total: COMPANY_ATS_CONFIGS.length
}
