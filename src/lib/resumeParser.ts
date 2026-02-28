/**
 * Hybrid Resume Parser - OpenResume + Custom Analysis
 * Combines reliable PDF extraction with tech-focused skill detection
 * ATS scoring, job matching, and AI-ready data structures
 */

// ============================================
// SKILLS DATABASE - Comprehensive Tech Skills
// ============================================

const SKILLS_DATABASE = {
  programming: [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'C++', 'C', 'Ruby', 'Go', 'Rust',
    'PHP', 'Swift', 'Kotlin', 'Scala', 'R', 'MATLAB', 'Perl', 'Lua', 'Haskell', 'Elixir',
    'Clojure', 'F#', 'Objective-C', 'Dart', 'Julia', 'VBA', 'Assembly', 'COBOL', 'Fortran',
    'Groovy', 'Pascal', 'Ada', 'Delphi', 'Erlang', 'OCaml', 'Scheme', 'Lisp', 'Prolog'
  ],
  frontend: [
    'React', 'Angular', 'Vue.js', 'Vue', 'Svelte', 'Next.js', 'Nuxt.js', 'Gatsby',
    'HTML5', 'HTML', 'CSS3', 'CSS', 'Tailwind CSS', 'Tailwind', 'Bootstrap', 'Material UI',
    'MUI', 'Chakra UI', 'Ant Design', 'Semantic UI', 'Foundation', 'Bulma',
    'Redux', 'MobX', 'Zustand', 'Recoil', 'Jotai', 'XState', 'RxJS', 'NgRx',
    'Webpack', 'Vite', 'Rollup', 'Parcel', 'esbuild', 'Snowpack',
    'Jest', 'Cypress', 'Testing Library', 'React Testing Library', 'Vitest', 'Playwright',
    'Storybook', 'SASS', 'SCSS', 'LESS', 'Styled Components', 'Emotion', 'Framer Motion',
    'React Query', 'TanStack Query', 'SWR', 'React Hook Form', 'Formik', 'Yup'
  ],
  backend: [
    'Node.js', 'Node', 'Express.js', 'Express', 'NestJS', 'Fastify', 'Koa', 'Hapi',
    'FastAPI', 'Django', 'Flask', 'Spring Boot', 'Spring', 'Ruby on Rails', 'Rails',
    'ASP.NET', '.NET', '.NET Core', 'Laravel', 'Symfony', 'Phoenix', 'Gin', 'Echo', 'Fiber',
    'GraphQL', 'Apollo', 'REST API', 'RESTful', 'Microservices', 'gRPC', 'WebSocket',
    'tRPC', 'Nexus', 'Prisma', 'Hasura', 'PostGraphile'
  ],
  database: [
    'PostgreSQL', 'Postgres', 'MySQL', 'MongoDB', 'Redis', 'SQLite', 'Oracle',
    'SQL Server', 'DynamoDB', 'Elasticsearch', 'Firebase', 'Supabase', 'Cassandra',
    'MariaDB', 'CouchDB', 'Neo4j', 'GraphQL', 'Prisma', 'Sequelize', 'TypeORM',
    'Mongoose', 'SQLAlchemy', 'Doctrine', 'Hibernate', 'JPA', 'Couchbase',
    'InfluxDB', 'TimescaleDB', 'ArangoDB', 'RethinkDB', 'FoundationDB'
  ],
  cloud: [
    'AWS', 'Amazon Web Services', 'Azure', 'Google Cloud', 'GCP', 'Google Cloud Platform',
    'AWS Lambda', 'EC2', 'S3', 'RDS', 'DynamoDB', 'CloudFormation', 'CloudWatch',
    'API Gateway', 'ECS', 'EKS', 'Fargate', 'Step Functions', 'SQS', 'SNS',
    'Azure Functions', 'Azure DevOps', 'Azure App Service', 'Azure Cosmos DB',
    'Google Compute Engine', 'Google Kubernetes Engine', 'GKE', 'Cloud Run', 'BigQuery',
    'Terraform', 'Pulumi', 'Serverless', 'Vercel', 'Netlify', 'Heroku', 'DigitalOcean',
    'Cloudflare', 'Fastly', 'Linode', 'Vultr'
  ],
  devops: [
    'Docker', 'Kubernetes', 'K8s', 'Jenkins', 'GitHub Actions', 'GitLab CI', 'CircleCI',
    'CI/CD', 'Ansible', 'Chef', 'Puppet', 'SaltStack', 'Terraform', 'Packer',
    'Prometheus', 'Grafana', 'Datadog', 'New Relic', 'Splunk', 'ELK Stack',
    'Linux', 'Ubuntu', 'CentOS', 'Red Hat', 'Debian', 'Alpine',
    'Nginx', 'Apache', 'HAProxy', 'Traefik', 'Envoy', 'Istio',
    'Helm', 'ArgoCD', 'Flux', 'Spinnaker', 'Harbor'
  ],
  ml_ai: [
    'Machine Learning', 'ML', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Keras',
    'Scikit-learn', 'sklearn', 'Pandas', 'NumPy', 'NLP', 'Natural Language Processing',
    'Computer Vision', 'LLM', 'Large Language Models', 'GPT', 'OpenAI', 'LangChain',
    'Hugging Face', 'Transformers', 'CNN', 'RNN', 'LSTM', 'GAN', 'XGBoost', 'LightGBM',
    'Jupyter', 'Colab', 'Kaggle', 'spaCy', 'NLTK', 'Gensim', 'FastText',
    'Stable Diffusion', 'Midjourney', 'DALL-E', 'RAG', 'Embeddings', 'Vector Database'
  ],
  mobile: [
    'React Native', 'Flutter', 'iOS Development', 'Android Development', 'Swift',
    'SwiftUI', 'Jetpack Compose', 'PWA', 'Progressive Web App', 'Ionic',
    'Xamarin', 'Cordova', 'Capacitor', 'NativeScript', 'Expo', 'Kotlin Multiplatform'
  ],
  security: [
    'Cybersecurity', 'Security', 'Penetration Testing', 'Pentesting', 'OWASP',
    'OAuth', 'OAuth2', 'OIDC', 'JWT', 'SSL/TLS', 'HTTPS', 'Zero Trust',
    'Ethical Hacking', 'Vulnerability Assessment', 'SIEM', 'Firewall', 'Encryption',
    'SAST', 'DAST', 'DevSecOps', 'Keycloak', 'Auth0', 'Cognito'
  ],
  tools: [
    'Git', 'GitHub', 'GitLab', 'Bitbucket', 'SVN', 'Mercurial',
    'Jira', 'Confluence', 'Slack', 'Microsoft Teams', 'Notion', 'Linear',
    'Microsoft Office', 'Excel', 'PowerPoint', 'Word', 'Google Workspace',
    'Figma', 'Sketch', 'Adobe XD', 'Canva', 'InVision', 'Zeplin',
    'VS Code', 'Visual Studio', 'IntelliJ', 'PyCharm', 'Eclipse', 'Vim', 'Emacs',
    'Postman', 'Insomnia', 'Thunder Client', 'curl', 'HTTPie'
  ],
  soft_skills: [
    'Leadership', 'Team Leadership', 'Communication', 'Problem Solving', 'Critical Thinking',
    'Project Management', 'Agile', 'Scrum', 'Kanban', 'Time Management', 'Collaboration',
    'Teamwork', 'Mentoring', 'Public Speaking', 'Presentation', 'Negotiation',
    'Adaptability', 'Creativity', 'Analytical Skills', 'Decision Making',
    'Conflict Resolution', 'Emotional Intelligence', 'Stakeholder Management'
  ],
  methodologies: [
    'Agile', 'Scrum', 'Kanban', 'Waterfall', 'DevOps', 'TDD', 'Test Driven Development',
    'BDD', 'Behavior Driven Development', 'CI/CD', 'GitOps', 'Microservices',
    'SOA', 'Service Oriented Architecture', 'Domain Driven Design', 'DDD',
    'Pair Programming', 'Code Review', 'SOLID', 'Clean Architecture'
  ]
}

// All skills flat array for quick lookup
const ALL_SKILLS = Object.values(SKILLS_DATABASE).flat()

// Common job titles for extraction
const JOB_TITLES = [
  'Software Engineer', 'Software Developer', 'Full Stack Developer', 'Fullstack Developer',
  'Frontend Developer', 'Front-end Developer', 'Backend Developer', 'Back-end Developer',
  'Web Developer', 'Mobile Developer', 'iOS Developer', 'Android Developer',
  'DevOps Engineer', 'Site Reliability Engineer', 'SRE', 'Platform Engineer',
  'Data Scientist', 'Data Engineer', 'Data Analyst', 'Machine Learning Engineer', 'ML Engineer',
  'AI Engineer', 'Artificial Intelligence Engineer', 'Research Scientist',
  'Product Manager', 'Product Owner', 'Project Manager', 'Program Manager',
  'Engineering Manager', 'Tech Lead', 'Technical Lead', 'Team Lead', 'CTO', 'VP of Engineering',
  'QA Engineer', 'Quality Assurance', 'Test Engineer', 'Automation Engineer', 'SDET',
  'Security Engineer', 'Cybersecurity Engineer', 'Cloud Engineer', 'Solutions Architect',
  'UI/UX Designer', 'UX Designer', 'UI Designer', 'Product Designer',
  'Business Analyst', 'Systems Analyst', 'Technical Writer', 'Developer Advocate',
  'Junior Developer', 'Senior Developer', 'Principal Engineer', 'Staff Engineer',
  'Intern', 'Software Engineering Intern', 'Software Development Intern',
  'Software Architect', 'Systems Engineer', 'Network Engineer', 'Database Administrator',
  'CRM Developer', 'Salesforce Developer', 'SAP Developer', 'Odoo Developer'
]

// Education keywords
const EDUCATION_KEYWORDS = [
  'Bachelor', 'Master', 'PhD', 'Doctorate', 'Associate', 'Degree',
  'Computer Science', 'Software Engineering', 'Information Technology', 'IT',
  'Electrical Engineering', 'Electronics', 'Mathematics', 'Physics',
  'Data Science', 'Artificial Intelligence', 'Machine Learning', 'Cybersecurity',
  'University', 'College', 'Institute', 'School', 'Academy',
  'GPA', 'Grade', 'Magna Cum Laude', 'Summa Cum Laude', 'Dean\'s List',
  'B.S.', 'B.A.', 'M.S.', 'M.A.', 'M.B.A.', 'Ph.D.', 'B.E.', 'M.E.',
  'B.Tech', 'M.Tech', 'BSc', 'MSc', 'BEng', 'MEng'
]

// Certificate keywords
const CERTIFICATE_KEYWORDS = [
  'Certified', 'Certification', 'Certificate', 'AWS Certified', 'Azure Certified',
  'Google Cloud Certified', 'PMP', 'Scrum Master', 'CSM', 'PSM',
  'Kubernetes Certified', 'CKA', 'CKAD', 'CKS', 'Security+', 'CISSP', 'CEH',
  'Oracle Certified', 'Java Certified', 'Microsoft Certified', 'MCSE', 'AZ-900', 'AZ-104',
  'Cisco Certified', 'CCNA', 'CCNP', 'Salesforce Certified',
  'AWS Solutions Architect', 'AWS Developer', 'AWS DevOps', 'AWS Security',
  'Google Professional', 'Azure Solutions Architect', 'Azure Developer',
  'Terraform Certified', 'HashiCorp Certified', 'CompTIA'
]

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface ParsedResume {
  // Contact Information
  name: string | null
  email: string | null
  phone: string | null
  location: string | null
  linkedin: string | null
  github: string | null
  portfolio: string | null
  
  // Skills
  technicalSkills: string[]
  softSkills: string[]
  skillsByCategory: Record<string, string[]>
  
  // Experience
  experienceYears: number
  jobTitles: string[]
  companies: string[]
  experienceHighlights: string[]
  
  // Education
  education: Array<{
    degree: string
    field: string
    institution: string
    year: string | null
    gpa?: string
  }>
  
  // Certifications
  certifications: string[]
  
  // ATS Analysis
  atsScore: number
  atsIssues: string[]
  atsSuggestions: string[]
  
  // Content Analysis
  wordCount: number
  sections: string[]
  hasQuantifiableResults: boolean
  actionVerbsUsed: string[]
  
  // Job Fit
  recommendedJobTitles: string[]
  experienceLevel: 'entry' | 'mid' | 'senior' | 'lead' | 'executive'
  
  // Source info
  source: 'pdf' | 'text'
  extractionQuality: number
}

export interface JobMatchResult {
  score: number
  matchedSkills: string[]
  missingSkills: string[]
  recommendations: string[]
  skillMatchPercentage: number
  experienceMatch: boolean
  educationMatch: boolean
}

// ============================================
// CONSTANTS FOR ANALYSIS
// ============================================

const ACTION_VERBS = [
  'developed', 'implemented', 'designed', 'built', 'created', 'launched',
  'led', 'managed', 'directed', 'coordinated', 'oversaw', 'supervised',
  'improved', 'increased', 'reduced', 'optimized', 'enhanced', 'streamlined',
  'achieved', 'delivered', 'executed', 'established', 'initiated', 'pioneered',
  'analyzed', 'researched', 'investigated', 'evaluated', 'assessed', 'audited',
  'collaborated', 'partnered', 'facilitated', 'negotiated', 'spearheaded',
  'automated', 'integrated', 'deployed', 'scaled', 'migrated', 'refactored',
  'trained', 'mentored', 'coached', 'educated', 'presented', 'authored',
  'architected', 'engineered', 'transformed', 'accelerated', 'maximized'
]

const QUANTIFIABLE_PATTERNS = [
  /\d+%/g,                          // percentages
  /\$\d+[kKmMbB]?/g,               // dollar amounts
  /\d+\s*(users?|customers?|clients?)/gi,  // user counts
  /\d+\s*(team|people|members?)/gi,        // team sizes
  /\d+\s*(years?|months?)/gi,              // time periods
  /\d+x\s*(improvement|increase|faster|growth)/gi, // multipliers
  /reduced.*\d+/gi,                // reduction metrics
  /increased.*\d+/gi,              // increase metrics
  /saved.*\d+/gi,                  // savings
  /improved.*\d+/gi                // improvements
]

// ============================================
// MAIN PARSING FUNCTION
// ============================================

export function parseResume(text: string, source: 'pdf' | 'text' = 'text'): ParsedResume {
  const cleanText = text.replace(/\s+/g, ' ').trim()
  const originalText = text
  
  // Calculate extraction quality based on text characteristics
  const extractionQuality = calculateExtractionQuality(cleanText)
  
  return {
    name: extractName(originalText),
    email: extractEmail(cleanText),
    phone: extractPhone(cleanText),
    location: extractLocation(cleanText),
    linkedin: extractLinkedIn(cleanText),
    github: extractGitHub(cleanText),
    portfolio: extractPortfolio(cleanText),
    
    technicalSkills: extractTechnicalSkills(cleanText),
    softSkills: extractSoftSkills(cleanText),
    skillsByCategory: categorizeSkills(cleanText),
    
    experienceYears: estimateExperience(cleanText),
    jobTitles: extractJobTitles(cleanText),
    companies: extractCompanies(cleanText),
    experienceHighlights: extractExperienceHighlights(originalText),
    
    education: extractEducation(cleanText),
    certifications: extractCertifications(cleanText),
    
    atsScore: calculateATSScore(cleanText),
    atsIssues: identifyATSIssues(cleanText),
    atsSuggestions: generateATSSuggestions(cleanText),
    
    wordCount: cleanText.split(/\s+/).length,
    sections: identifySections(cleanText),
    hasQuantifiableResults: checkQuantifiableResults(cleanText),
    actionVerbsUsed: findActionVerbs(cleanText),
    
    recommendedJobTitles: recommendJobTitles(cleanText),
    experienceLevel: determineExperienceLevel(cleanText),
    
    source,
    extractionQuality
  }
}

// ============================================
// EXTRACTION HELPER FUNCTIONS
// ============================================

function calculateExtractionQuality(text: string): number {
  let quality = 100
  
  // Penalize for very short text
  if (text.length < 200) quality -= 40
  else if (text.length < 500) quality -= 20
  
  // Penalize for excessive special characters (PDF extraction artifacts)
  const specialCharCount = (text.match(/[^\w\s.,;:!?@\-()]/g) || []).length
  const specialCharRatio = specialCharCount / text.length
  if (specialCharRatio > 0.1) quality -= 20
  
  // Penalize for lack of structure
  const lineBreaks = (text.match(/\n/g) || []).length
  if (lineBreaks < 5) quality -= 15
  
  // Reward for common resume patterns
  if (/experience|education|skills/i.test(text)) quality += 5
  if (/\d{4}/.test(text)) quality += 5 // Has dates
  
  return Math.max(0, Math.min(100, quality))
}

function extractName(text: string): string | null {
  const lines = text.split('\n').filter(l => l.trim())
  if (lines.length === 0) return null
  
  // First line is often the name
  const firstLine = lines[0].trim()
  
  // Check if first line looks like a name (2-4 words, properly capitalized)
  if (/^[A-Z][a-z]+(\s+[A-Z][a-z]+){1,3}$/.test(firstLine)) {
    return firstLine
  }
  
  // Look for "Name:" pattern
  const nameMatch = text.match(/(?:name\s*[:–-]?\s*)([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i)
  if (nameMatch) return nameMatch[1]
  
  // Try to find name at the beginning (before contact info)
  const firstLines = lines.slice(0, 3).join(' ')
  const possibleName = firstLines.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/)
  if (possibleName && possibleName[1].length < 40) {
    return possibleName[1]
  }
  
  return null
}

function extractEmail(text: string): string | null {
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)
  return emailMatch ? emailMatch[0].toLowerCase() : null
}

function extractPhone(text: string): string | null {
  const phonePatterns = [
    /\+?1?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/,
    /\+?\d{1,3}[-.\s]?\d{2,4}[-.\s]?\d{2,4}[-.\s]?\d{2,4}/,
    /\(\d{3}\)\s*\d{3}[-.\s]?\d{4}/
  ]
  
  for (const pattern of phonePatterns) {
    const match = text.match(pattern)
    if (match) return match[0]
  }
  return null
}

function extractLocation(text: string): string | null {
  const locationPatterns = [
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?,\s*[A-Z]{2}\s*\d{0,5})/,  // City, ST
    /([A-Z][a-z]+,\s*[A-Z][a-z]+)/,  // City, State
    /(?:location|address|based in|living in)[:\s]+([A-Z][a-z]+(?:,\s*[A-Z]{2})?)/i
  ]
  
  for (const pattern of locationPatterns) {
    const match = text.match(pattern)
    if (match) return match[1].trim()
  }
  return null
}

function extractLinkedIn(text: string): string | null {
  const match = text.match(/(?:linkedin\.com\/in\/|linkedin:\s*)([a-zA-Z0-9-]+)/i)
  return match ? `linkedin.com/in/${match[1]}` : null
}

function extractGitHub(text: string): string | null {
  const match = text.match(/(?:github\.com\/|github:\s*)([a-zA-Z0-9-]+)/i)
  return match ? `github.com/${match[1]}` : null
}

function extractPortfolio(text: string): string | null {
  const match = text.match(/(?:portfolio|website|site|blog)[:\s]+(https?:\/\/[^\s]+)/i)
  return match ? match[1] : null
}

function extractTechnicalSkills(text: string): string[] {
  const found: string[] = []
  
  for (const skill of ALL_SKILLS) {
    const regex = new RegExp(`\\b${escapeRegExp(skill)}\\b`, 'i')
    if (regex.test(text) && !found.includes(skill)) {
      found.push(skill)
    }
  }
  
  return found.sort()
}

function extractSoftSkills(text: string): string[] {
  const found: string[] = []
  
  for (const skill of SKILLS_DATABASE.soft_skills) {
    const regex = new RegExp(`\\b${escapeRegExp(skill)}\\b`, 'i')
    if (regex.test(text) && !found.includes(skill)) {
      found.push(skill)
    }
  }
  
  return found
}

function categorizeSkills(text: string): Record<string, string[]> {
  const result: Record<string, string[]> = {}
  
  for (const [category, skills] of Object.entries(SKILLS_DATABASE)) {
    if (category === 'soft_skills') continue
    
    const found: string[] = []
    for (const skill of skills) {
      const regex = new RegExp(`\\b${escapeRegExp(skill)}\\b`, 'i')
      if (regex.test(text)) {
        found.push(skill)
      }
    }
    if (found.length > 0) {
      result[category] = found
    }
  }
  
  return result
}

function estimateExperience(text: string): number {
  // Look for explicit experience mentions
  const expMatch = text.match(/(\d+)\+?\s*(?:years?|yrs?)\s*(?:of\s+)?(?:experience|expertise)/i)
  if (expMatch) {
    return parseInt(expMatch[1])
  }
  
  // Count date ranges
  const dateRanges = text.match(/(?:19|20)\d{2}\s*[-–to]+\s*(?:present|current|now|(?:19|20)\d{2})/gi) || []
  if (dateRanges.length > 0) {
    let totalYears = 0
    for (const range of dateRanges) {
      const startMatch = range.match(/(19|20)\d{2}/)
      const endMatch = range.match(/present|current|now/i) ? new Date().getFullYear() : 
                       parseInt(range.match(/(?:19|20)(\d{2})/g)?.pop()?.slice(2) || '0') + 2000
      if (startMatch) {
        const startYear = parseInt(startMatch[0])
        totalYears += Math.max(1, endMatch - startYear)
      }
    }
    return Math.min(20, totalYears)
  }
  
  // Look for job title progression
  const seniorityKeywords = ['senior', 'lead', 'principal', 'staff', 'manager', 'director']
  const hasSeniority = seniorityKeywords.some(kw => text.toLowerCase().includes(kw))
  
  // Count years mentioned
  const yearPatterns = text.match(/\b(19|20)\d{2}\b/g) || []
  const uniqueYears = [...new Set(yearPatterns)]
  
  if (uniqueYears.length >= 4) return hasSeniority ? 6 : 4
  if (uniqueYears.length >= 2) return hasSeniority ? 4 : 2
  
  if (hasSeniority) return 5
  
  return Math.max(1, Math.min(10, Math.floor(yearPatterns.length / 2)))
}

function extractJobTitles(text: string): string[] {
  const found: string[] = []
  
  for (const title of JOB_TITLES) {
    const regex = new RegExp(`\\b${escapeRegExp(title)}\\b`, 'i')
    if (regex.test(text)) {
      found.push(title)
    }
  }
  
  return [...new Set(found)]
}

function extractCompanies(text: string): string[] {
  const companies: string[] = []
  
  // Look for "at [Company]" patterns
  const atMatches = text.matchAll(/(?:at|@)\s+([A-Z][A-Za-z0-9]+(?:\s+[A-Z][A-Za-z0-9]+)?)/g)
  for (const match of atMatches) {
    const company = match[1]
    // Filter out common false positives
    const falsePositives = ['University', 'College', 'School', 'The', 'Google', 'Amazon', 
                           'Microsoft', 'Apple', 'Meta', 'Netflix', 'A', 'An', 'The']
    if (!falsePositives.includes(company) && company.length > 2) {
      companies.push(company)
    }
  }
  
  // Look for well-known tech companies
  const knownCompanies = ['Google', 'Amazon', 'Microsoft', 'Apple', 'Meta', 'Facebook',
                         'Netflix', 'Uber', 'Airbnb', 'Spotify', 'Twitter', 'LinkedIn',
                         'Salesforce', 'Adobe', 'Oracle', 'IBM', 'Intel', 'Nvidia']
  
  for (const company of knownCompanies) {
    if (text.toLowerCase().includes(company.toLowerCase()) && !companies.includes(company)) {
      companies.push(company)
    }
  }
  
  return [...new Set(companies)].slice(0, 8)
}

function extractExperienceHighlights(text: string): string[] {
  const highlights: string[] = []
  const lines = text.split('\n')
  
  for (const line of lines) {
    const trimmed = line.trim()
    // Look for bullet points or achievement statements
    if (/^[•\-\*]\s+/.test(trimmed) || 
        ACTION_VERBS.some(verb => trimmed.toLowerCase().startsWith(verb))) {
      if (trimmed.length > 20 && trimmed.length < 200) {
        highlights.push(trimmed.replace(/^[•\-\*]\s+/, ''))
      }
    }
  }
  
  return highlights.slice(0, 10)
}

function extractEducation(text: string): Array<{ degree: string; field: string; institution: string; year: string | null; gpa?: string }> {
  const education: Array<{ degree: string; field: string; institution: string; year: string | null; gpa?: string }> = []
  
  const degreePatterns = [
    /(Bachelor(?:'s)?(?:\s+of\s+(?:Science|Arts|Engineering|Technology))?|B\.?S\.?|B\.?A\.?|B\.?Tech|B\.?E\.?)/i,
    /(Master(?:'s)?(?:\s+of\s+(?:Science|Arts|Business Administration|Engineering))?|M\.?S\.?|M\.?A\.?|M\.?B\.?A\.?|M\.?Tech|M\.?E\.?)/i,
    /(PhD|Ph\.?D\.?|Doctorate|Doctor\s+of\s+Philosophy)/i,
    /(Associate(?:'s)?(?:\s+of\s+(?:Science|Arts|Applied\s+Science))?|A\.?S\.?|A\.?A\.?|A\.?A\.?S\.?)/i
  ]
  
  // Find education section
  const eduSectionMatch = text.match(/(?:EDUCATION|ACADEMIC)\s*\n([\s\S]*?)(?=\n\s*(?:EXPERIENCE|SKILLS|PROJECTS|CERTIFICATIONS|AWARDS|WORK)|$)/i)
  const eduSection = eduSectionMatch ? eduSectionMatch[1] : text
  
  for (const pattern of degreePatterns) {
    const matches = eduSection.matchAll(pattern)
    for (const match of matches) {
      const degree = match[1]
      
      // Find field of study near degree
      const fieldMatch = eduSection.match(new RegExp(`${escapeRegExp(degree)}[^\\n]*?(?:in|of)\\s+([A-Za-z\\s]+)`, 'i'))
      const field = fieldMatch ? fieldMatch[1].trim().split(/[\n,]/)[0] : 'Not specified'
      
      // Find year
      const yearMatch = eduSection.match(/\b(19|20)\d{2}\b/)
      const year = yearMatch ? yearMatch[0] : null
      
      // Find institution
      const institutionPatterns = [
        /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:University|College|Institute|School))/,
        /(?:University|College)\s+(?:of\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/
      ]
      let institution = 'Not specified'
      for (const instPattern of institutionPatterns) {
        const instMatch = eduSection.match(instPattern)
        if (instMatch) {
          institution = instMatch[1] || instMatch[0]
          break
        }
      }
      
      // Find GPA
      const gpaMatch = eduSection.match(/GPA[:\s]+(\d+\.?\d*)/i)
      const gpa = gpaMatch ? gpaMatch[1] : undefined
      
      education.push({
        degree: degree.trim(),
        field: field.trim(),
        institution,
        year,
        gpa
      })
    }
  }
  
  return education.length > 0 ? education : [{ degree: 'Not detected', field: '', institution: '', year: null }]
}

function extractCertifications(text: string): string[] {
  const certifications: string[] = []
  
  // Find certifications section
  const certSectionMatch = text.match(/(?:CERTIFICATIONS?|CERTIFICATES?)\s*\n([\s\S]*?)(?=\n\s*(?:EXPERIENCE|EDUCATION|SKILLS|PROJECTS|AWARDS|LANGUAGES)|$)/i)
  const searchText = certSectionMatch ? certSectionMatch[1] : text
  
  for (const cert of CERTIFICATE_KEYWORDS) {
    const regex = new RegExp(`(${escapeRegExp(cert)}[^,\n]{0,50})`, 'gi')
    const matches = searchText.matchAll(regex)
    for (const match of matches) {
      const certText = match[1].trim()
      if (certText.length > 5 && !certifications.some(c => c.toLowerCase().includes(certText.toLowerCase()))) {
        certifications.push(certText)
      }
    }
  }
  
  return [...new Set(certifications)].slice(0, 10)
}

// ============================================
// ATS ANALYSIS FUNCTIONS
// ============================================

function calculateATSScore(text: string): number {
  let score = 100
  
  // Check for contact info
  if (!extractEmail(text)) score -= 10
  if (!extractPhone(text)) score -= 10
  
  // Check for sections
  if (!/skills?/i.test(text)) score -= 15
  if (!/experience|employment|work history/i.test(text)) score -= 15
  if (!/education|degree|university|college/i.test(text)) score -= 10
  
  // Length check
  const wordCount = text.split(/\s+/).length
  if (wordCount < 200) score -= 15
  if (wordCount > 1000) score -= 5
  
  // Check for quantifiable results
  if (!checkQuantifiableResults(text)) score -= 10
  
  // Check for action verbs
  const actionVerbsFound = findActionVerbs(text)
  if (actionVerbsFound.length < 5) score -= 10
  
  // Check for keywords
  const skills = extractTechnicalSkills(text)
  if (skills.length < 5) score -= 10
  if (skills.length > 15) score += 5
  
  // Bonus for good structure
  if (/summary|profile|objective/i.test(text)) score += 5
  
  return Math.max(0, Math.min(100, score))
}

function identifyATSIssues(text: string): string[] {
  const issues: string[] = []
  
  if (!extractEmail(text)) issues.push('Missing email address')
  if (!extractPhone(text)) issues.push('Missing phone number')
  if (!/skills?/i.test(text)) issues.push('No clear skills section')
  if (!/experience|employment|work history/i.test(text)) issues.push('No clear experience section')
  if (!checkQuantifiableResults(text)) issues.push('No quantifiable achievements found')
  
  const actionVerbs = findActionVerbs(text)
  if (actionVerbs.length < 5) issues.push('Limited use of action verbs')
  
  const skills = extractTechnicalSkills(text)
  if (skills.length < 5) issues.push('Few technical keywords detected')
  
  if (!/education|degree|university|college/i.test(text)) issues.push('No clear education section')
  
  const wordCount = text.split(/\s+/).length
  if (wordCount < 200) issues.push('Resume content is too brief')
  if (wordCount > 1500) issues.push('Resume may be too long for ATS')
  
  return issues
}

function generateATSSuggestions(text: string): string[] {
  const suggestions: string[] = []
  
  if (!checkQuantifiableResults(text)) {
    suggestions.push('Add quantifiable achievements (e.g., "Increased performance by 40%")')
  }
  
  const actionVerbs = findActionVerbs(text)
  if (actionVerbs.length < 5) {
    suggestions.push('Use more action verbs: developed, implemented, led, optimized, achieved')
  }
  
  const skills = extractTechnicalSkills(text)
  if (skills.length < 10) {
    suggestions.push('Include more relevant technical keywords from job descriptions')
  }
  
  if (!/summary|profile|objective/i.test(text)) {
    suggestions.push('Add a professional summary section at the top')
  }
  
  if (!extractLinkedIn(text)) {
    suggestions.push('Add your LinkedIn profile URL')
  }
  
  if (!extractGitHub(text) && skills.some(s => ['JavaScript', 'Python', 'React', 'Node.js'].includes(s))) {
    suggestions.push('Add your GitHub profile to showcase your code')
  }
  
  suggestions.push('Tailor keywords to match each job description')
  suggestions.push('Use standard section headings (Experience, Education, Skills)')
  suggestions.push('Avoid tables, columns, and graphics that ATS cannot read')
  
  return suggestions.slice(0, 8)
}

// ============================================
// HELPER ANALYSIS FUNCTIONS
// ============================================

function identifySections(text: string): string[] {
  const sections: string[] = []
  const sectionPatterns = [
    { name: 'Summary', pattern: /summary|objective|profile|about/i },
    { name: 'Experience', pattern: /experience|employment|work history/i },
    { name: 'Education', pattern: /education|academic/i },
    { name: 'Skills', pattern: /skills|technologies|competencies|expertise/i },
    { name: 'Projects', pattern: /projects|portfolio/i },
    { name: 'Certifications', pattern: /certifications|certificates/i },
    { name: 'Awards', pattern: /awards|honors|achievements/i },
    { name: 'Languages', pattern: /languages/i },
    { name: 'Interests', pattern: /interests|hobbies/i }
  ]
  
  for (const { name, pattern } of sectionPatterns) {
    if (pattern.test(text)) {
      sections.push(name)
    }
  }
  
  return sections
}

function checkQuantifiableResults(text: string): boolean {
  for (const pattern of QUANTIFIABLE_PATTERNS) {
    if (pattern.test(text)) return true
  }
  return false
}

function findActionVerbs(text: string): string[] {
  const found: string[] = []
  const lowerText = text.toLowerCase()
  
  for (const verb of ACTION_VERBS) {
    if (lowerText.includes(' ' + verb) || lowerText.includes('\n' + verb)) {
      found.push(verb)
    }
  }
  
  return found
}

function recommendJobTitles(text: string): string[] {
  const skillsByCat = categorizeSkills(text)
  const foundTitles: string[] = []
  
  // Frontend Developer
  if ((skillsByCat.frontend?.length || 0) >= 3) {
    foundTitles.push('Frontend Developer')
    if (skillsByCat.frontend?.includes('React')) foundTitles.push('React Developer')
    if (skillsByCat.frontend?.includes('Vue')) foundTitles.push('Vue.js Developer')
    if (skillsByCat.frontend?.includes('Angular')) foundTitles.push('Angular Developer')
  }
  
  // Backend Developer
  if ((skillsByCat.backend?.length || 0) >= 3) {
    foundTitles.push('Backend Developer')
    if (skillsByCat.backend?.includes('Node.js')) foundTitles.push('Node.js Developer')
    if (skillsByCat.backend?.includes('Python') || skillsByCat.backend?.includes('Django')) {
      foundTitles.push('Python Developer')
    }
  }
  
  // Full Stack Developer
  if ((skillsByCat.frontend?.length || 0) >= 2 && (skillsByCat.backend?.length || 0) >= 2) {
    foundTitles.push('Full Stack Developer')
  }
  
  // Data/ML
  if ((skillsByCat.ml_ai?.length || 0) >= 3) {
    foundTitles.push('Data Scientist')
    foundTitles.push('Machine Learning Engineer')
  }
  
  // DevOps
  if ((skillsByCat.devops?.length || 0) >= 3) {
    foundTitles.push('DevOps Engineer')
    foundTitles.push('Site Reliability Engineer')
  }
  
  // Cloud
  if ((skillsByCat.cloud?.length || 0) >= 3) {
    foundTitles.push('Cloud Engineer')
    foundTitles.push('Solutions Architect')
  }
  
  // Mobile
  if ((skillsByCat.mobile?.length || 0) >= 2) {
    foundTitles.push('Mobile Developer')
  }
  
  // Default fallback
  if (foundTitles.length === 0) {
    foundTitles.push('Software Developer')
  }
  
  return [...new Set(foundTitles)].slice(0, 6)
}

function determineExperienceLevel(text: string): 'entry' | 'mid' | 'senior' | 'lead' | 'executive' {
  const years = estimateExperience(text)
  
  // Check for executive/leadership keywords
  if (/\b(director|vp|vice president|cto|cio|chief|head of|principal)\b/i.test(text)) {
    return 'executive'
  }
  
  // Check for lead/senior keywords
  if (/\b(lead|principal|staff)\b/i.test(text)) {
    return years >= 6 ? 'lead' : 'senior'
  }
  
  if (/\bsenior\b/i.test(text)) {
    return 'senior'
  }
  
  // Check for junior/entry keywords
  if (/\b(junior|entry|intern|associate)\b/i.test(text)) {
    return 'entry'
  }
  
  // Base on years of experience
  if (years >= 10) return 'executive'
  if (years >= 6) return 'senior'
  if (years >= 3) return 'mid'
  return 'entry'
}

// ============================================
// JOB MATCHING FUNCTION
// ============================================

export function calculateJobMatch(resumeText: string, jobDescription: string): JobMatchResult {
  const resumeSkills = extractTechnicalSkills(resumeText)
  const jobSkills = extractTechnicalSkills(jobDescription)
  
  const matchedSkills = resumeSkills.filter(skill => 
    jobSkills.some(jobSkill => 
      jobSkill.toLowerCase() === skill.toLowerCase() ||
      jobSkill.toLowerCase().includes(skill.toLowerCase()) ||
      skill.toLowerCase().includes(jobSkill.toLowerCase())
    )
  )
  
  const missingSkills = jobSkills.filter(skill =>
    !resumeSkills.some(resumeSkill =>
      resumeSkill.toLowerCase() === skill.toLowerCase() ||
      resumeSkill.toLowerCase().includes(skill.toLowerCase()) ||
      skill.toLowerCase().includes(resumeSkill.toLowerCase())
    )
  )
  
  // Calculate scores
  const skillMatchPercentage = jobSkills.length > 0 
    ? Math.round((matchedSkills.length / jobSkills.length) * 100)
    : 50
  
  let score = 40 + skillMatchPercentage * 0.4
  
  // Experience match
  const resumeLevel = determineExperienceLevel(resumeText)
  const jobLevel = determineExperienceLevel(jobDescription)
  const experienceMatch = resumeLevel === jobLevel
  if (experienceMatch) score += 10
  
  // Education match
  const resumeEdu = extractEducation(resumeText)
  const jobEduKeywords = /(bachelor|master|phd|degree|computer science|engineering)/i.test(jobDescription)
  const educationMatch = resumeEdu.length > 0 && resumeEdu[0].degree !== 'Not detected'
  if (educationMatch && jobEduKeywords) score += 5
  
  // Generate recommendations
  const recommendations: string[] = []
  
  if (missingSkills.length > 0) {
    recommendations.push(`Consider highlighting experience with: ${missingSkills.slice(0, 5).join(', ')}`)
  }
  
  if (matchedSkills.length < 5) {
    recommendations.push('Add more relevant keywords from the job description')
  }
  
  if (!experienceMatch) {
    recommendations.push(`Position requires ${jobLevel} level experience`)
  }
  
  recommendations.push('Tailor your summary to match job requirements')
  recommendations.push('Highlight relevant projects that demonstrate required skills')
  
  return {
    score: Math.min(100, Math.max(0, Math.round(score))),
    matchedSkills,
    missingSkills,
    recommendations: recommendations.slice(0, 5),
    skillMatchPercentage,
    experienceMatch,
    educationMatch
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// Export skills database for external use
export { SKILLS_DATABASE, ALL_SKILLS, JOB_TITLES, ACTION_VERBS }
