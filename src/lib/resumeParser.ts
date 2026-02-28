/**
 * Resume Parser Utility
 * A comprehensive resume analyzer inspired by OpenResume and Resume Matcher
 * Combines pattern-based extraction with AI-powered analysis
 */

// Skills Database - Comprehensive list organized by category
const SKILLS_DATABASE = {
  programming: [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'C++', 'C', 'Ruby', 'Go', 'Rust',
    'PHP', 'Swift', 'Kotlin', 'Scala', 'R', 'MATLAB', 'Perl', 'Lua', 'Haskell', 'Elixir',
    'Clojure', 'F#', 'Objective-C', 'Dart', 'Julia', 'VBA', 'Assembly', 'COBOL'
  ],
  frontend: [
    'React', 'Angular', 'Vue.js', 'Vue', 'Svelte', 'Next.js', 'Nuxt.js', 'Gatsby',
    'HTML5', 'HTML', 'CSS3', 'CSS', 'Tailwind CSS', 'Tailwind', 'Bootstrap', 'Material UI',
    'Redux', 'MobX', 'Zustand', 'Recoil', 'Webpack', 'Vite', 'Rollup', 'Parcel',
    'Jest', 'Cypress', 'Testing Library', 'React Testing Library', 'Storybook',
    'SASS', 'SCSS', 'LESS', 'Styled Components', 'Emotion', 'Framer Motion'
  ],
  backend: [
    'Node.js', 'Node', 'Express.js', 'Express', 'NestJS', 'Fastify', 'Koa',
    'FastAPI', 'Django', 'Flask', 'Spring Boot', 'Spring', 'Ruby on Rails', 'Rails',
    'ASP.NET', '.NET', 'Laravel', 'Symfony', 'Phoenix', 'Gin', 'Echo',
    'GraphQL', 'Apollo', 'REST API', 'RESTful', 'Microservices', 'gRPC', 'WebSocket'
  ],
  database: [
    'PostgreSQL', 'Postgres', 'MySQL', 'MongoDB', 'Redis', 'SQLite', 'Oracle',
    'SQL Server', 'DynamoDB', 'Elasticsearch', 'Firebase', 'Supabase', 'Cassandra',
    'MariaDB', 'CouchDB', 'Neo4j', 'GraphQL', 'Prisma', 'Sequelize', 'TypeORM',
    'Mongoose', 'SQLAlchemy', 'Doctrine', 'Hibernate', 'JPA'
  ],
  cloud: [
    'AWS', 'Amazon Web Services', 'Azure', 'Google Cloud', 'GCP', 'Google Cloud Platform',
    'AWS Lambda', 'EC2', 'S3', 'RDS', 'DynamoDB', 'CloudFormation', 'CloudWatch',
    'Azure Functions', 'Azure DevOps', 'Google Compute Engine', 'Google Kubernetes Engine',
    'Terraform', 'CloudFormation', 'Pulumi', 'Serverless', 'Vercel', 'Netlify', 'Heroku'
  ],
  devops: [
    'Docker', 'Kubernetes', 'K8s', 'Jenkins', 'GitHub Actions', 'GitLab CI', 'CircleCI',
    'CI/CD', 'Ansible', 'Chef', 'Puppet', 'Terraform', 'Prometheus', 'Grafana',
    'Linux', 'Ubuntu', 'CentOS', 'Red Hat', 'Nginx', 'Apache', 'HAProxy',
    'ELK Stack', 'Splunk', 'DataDog', 'New Relic', 'PagerDuty'
  ],
  ml_ai: [
    'Machine Learning', 'ML', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Keras',
    'Scikit-learn', 'sklearn', 'Pandas', 'NumPy', 'NLP', 'Natural Language Processing',
    'Computer Vision', 'LLM', 'Large Language Models', 'GPT', 'OpenAI', 'LangChain',
    'Hugging Face', 'Transformers', 'CNN', 'RNN', 'LSTM', 'GAN', 'XGBoost', 'LightGBM'
  ],
  mobile: [
    'React Native', 'Flutter', 'iOS Development', 'Android Development', 'Swift',
    'Swift UI', 'Jetpack Compose', 'PWA', 'Progressive Web App', 'Ionic',
    'Xamarin', 'Cordova', 'Capacitor', 'NativeScript'
  ],
  security: [
    'Cybersecurity', 'Security', 'Penetration Testing', 'Pentesting', 'OWASP',
    'OAuth', 'OAuth2', 'JWT', 'SSL/TLS', 'HTTPS', 'Zero Trust', 'CISSP',
    'Ethical Hacking', 'Vulnerability Assessment', 'SIEM', 'Firewall', 'Encryption'
  ],
  tools: [
    'Git', 'GitHub', 'GitLab', 'Bitbucket', 'SVN', 'Jira', 'Confluence', 'Slack',
    'Microsoft Office', 'Excel', 'PowerPoint', 'Word', 'Figma', 'Sketch', 'Adobe XD',
    'VS Code', 'Visual Studio', 'IntelliJ', 'PyCharm', 'Eclipse', 'Vim', 'Emacs'
  ],
  soft_skills: [
    'Leadership', 'Team Leadership', 'Communication', 'Problem Solving', 'Critical Thinking',
    'Project Management', 'Agile', 'Scrum', 'Kanban', 'Time Management', 'Collaboration',
    'Teamwork', 'Mentoring', 'Public Speaking', 'Presentation', 'Negotiation',
    'Adaptability', 'Creativity', 'Analytical Skills', 'Decision Making'
  ],
  methodologies: [
    'Agile', 'Scrum', 'Kanban', 'Waterfall', 'DevOps', 'TDD', 'Test Driven Development',
    'BDD', 'Behavior Driven Development', 'CI/CD', 'GitOps', 'Microservices',
    'SOA', 'Service Oriented Architecture', 'Domain Driven Design', 'DDD'
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
  'QA Engineer', 'Quality Assurance', 'Test Engineer', 'Automation Engineer',
  'Security Engineer', 'Cybersecurity Engineer', 'Cloud Engineer', 'Solutions Architect',
  'UI/UX Designer', 'UX Designer', 'UI Designer', 'Product Designer',
  'Business Analyst', 'Systems Analyst', 'Technical Writer', 'Developer Advocate',
  'Junior Developer', 'Senior Developer', 'Principal Engineer', 'Staff Engineer',
  'Intern', 'Software Engineering Intern', 'Software Development Intern'
]

// Education keywords
const EDUCATION_KEYWORDS = [
  'Bachelor', 'Master', 'PhD', 'Doctorate', 'Associate', 'Degree',
  'Computer Science', 'Software Engineering', 'Information Technology', 'IT',
  'Electrical Engineering', 'Electronics', 'Mathematics', 'Physics',
  'Data Science', 'Artificial Intelligence', 'Machine Learning',
  'University', 'College', 'Institute', 'School', 'Academy',
  'GPA', 'Grade', 'Magna Cum Laude', 'Summa Cum Laude', 'Dean\'s List',
  'B.S.', 'B.A.', 'M.S.', 'M.A.', 'M.B.A.', 'Ph.D.', 'B.E.', 'M.E.',
  'B.Tech', 'M.Tech', 'BSc', 'MSc'
]

// Certificate keywords
const CERTIFICATE_KEYWORDS = [
  'Certified', 'Certification', 'Certificate', 'AWS Certified', 'Azure Certified',
  'Google Cloud Certified', 'PMP', 'Scrum Master', 'CSM', 'PSM',
  'Kubernetes Certified', 'CKA', 'CKAD', 'Security+', 'CISSP',
  'Oracle Certified', 'Java Certified', 'Microsoft Certified', 'MCSE',
  'Cisco Certified', 'CCNA', 'CCNP', 'Salesforce Certified',
  'AWS Solutions Architect', 'AWS Developer', 'AWS DevOps',
  'Google Professional', 'Azure Solutions Architect'
]

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
  
  // Education
  education: Array<{
    degree: string
    field: string
    institution: string
    year: string | null
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
}

// Action verbs for resume analysis
const ACTION_VERBS = [
  'developed', 'implemented', 'designed', 'built', 'created', 'launched',
  'led', 'managed', 'directed', 'coordinated', 'oversaw', 'supervised',
  'improved', 'increased', 'reduced', 'optimized', 'enhanced', 'streamlined',
  'achieved', 'delivered', 'executed', 'established', 'initiated', 'pioneered',
  'analyzed', 'researched', 'investigated', 'evaluated', 'assessed', 'audited',
  'collaborated', 'partnered', 'coordinated', 'facilitated', 'negotiated',
  'automated', 'integrated', 'deployed', 'scaled', 'migrated', 'refactored',
  'trained', 'mentored', 'coached', 'educated', 'presented', 'authored'
]

// Quantifiable result patterns
const QUANTIFIABLE_PATTERNS = [
  /\d+%/g,                          // percentages
  /\$\d+[kKmMbB]?/g,               // dollar amounts
  /\d+\s*(users?|customers?|clients?)/gi,  // user counts
  /\d+\s*(team|people|members?)/gi,        // team sizes
  /\d+\s*(years?|months?)/gi,              // time periods
  /\d+x\s*(improvement|increase|faster)/gi // multipliers
]

/**
 * Main resume parsing function
 */
export function parseResume(text: string): ParsedResume {
  const cleanText = text.replace(/\s+/g, ' ').trim()
  const lowerText = cleanText.toLowerCase()
  
  return {
    name: extractName(cleanText),
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
    experienceLevel: determineExperienceLevel(cleanText)
  }
}

function extractName(text: string): string | null {
  const lines = text.split('\n').filter(l => l.trim())
  if (lines.length === 0) return null
  
  const firstLine = lines[0].trim()
  
  if (/^[A-Z][a-z]+(\s+[A-Z][a-z]+){1,3}$/.test(firstLine)) {
    return firstLine
  }
  
  const nameMatch = text.match(/(?:name\s*[:–-]?\s*)([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i)
  if (nameMatch) return nameMatch[1]
  
  return null
}

function extractEmail(text: string): string | null {
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)
  return emailMatch ? emailMatch[0] : null
}

function extractPhone(text: string): string | null {
  const phonePatterns = [
    /\+?1?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/,
    /\+?\d{1,3}[-.\s]?\d{2,4}[-.\s]?\d{2,4}[-.\s]?\d{2,4}/
  ]
  
  for (const pattern of phonePatterns) {
    const match = text.match(pattern)
    if (match) return match[0]
  }
  return null
}

function extractLocation(text: string): string | null {
  const locationPatterns = [
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?,\s*[A-Z]{2})/,
    /([A-Z][a-z]+,\s*[A-Z][a-z]+)/,
    /(?:location|address|based in)[:\s]+([A-Z][a-z]+(?:,\s*[A-Z]{2})?)/i
  ]
  
  for (const pattern of locationPatterns) {
    const match = text.match(pattern)
    if (match) return match[1]
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
  const match = text.match(/(?:portfolio|website|site)[:\s]+(https?:\/\/[^\s]+)/i)
  return match ? match[1] : null
}

function extractTechnicalSkills(text: string): string[] {
  const found: string[] = []
  
  for (const skill of ALL_SKILLS) {
    const skillLower = skill.toLowerCase()
    const regex = new RegExp(`\\b${escapeRegExp(skillLower)}\\b`, 'i')
    if (regex.test(text) && !found.includes(skill)) {
      found.push(skill)
    }
  }
  
  return found.sort()
}

function extractSoftSkills(text: string): string[] {
  const found: string[] = []
  const lowerText = text.toLowerCase()
  
  for (const skill of SKILLS_DATABASE.soft_skills) {
    if (lowerText.includes(skill.toLowerCase()) && !found.includes(skill)) {
      found.push(skill)
    }
  }
  
  return found
}

function categorizeSkills(text: string): Record<string, string[]> {
  const result: Record<string, string[]> = {}
  
  for (const [category, skills] of Object.entries(SKILLS_DATABASE)) {
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
  const yearPatterns = text.match(/\b(19|20)\d{2}\b/g) || []
  
  const expMatch = text.match(/(\d+)\+?\s*(?:years?|yrs?)\s*(?:of\s+)?(?:experience|expertise)/i)
  if (expMatch) {
    return parseInt(expMatch[1])
  }
  
  const dateRanges = text.match(/(?:19|20)\d{2}\s*[-–to]+\s*(?:present|current|now|(?:19|20)\d{2})/gi) || []
  
  if (dateRanges.length > 0) {
    return Math.min(15, dateRanges.length * 2)
  }
  
  const seniorityKeywords = ['senior', 'lead', 'principal', 'staff', 'manager', 'director']
  const hasSeniority = seniorityKeywords.some(kw => text.toLowerCase().includes(kw))
  
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
  
  const atMatches = text.matchAll(/(?:at|@)\s+([A-Z][A-Za-z0-9]+(?:\s+[A-Z][A-Za-z0-9]+)?)/g)
  for (const match of atMatches) {
    const company = match[1]
    if (!['University', 'College', 'School', 'The', 'Google', 'Amazon', 'Microsoft', 'Apple', 'Meta', 'Netflix'].includes(company)) {
      companies.push(company)
    }
  }
  
  return [...new Set(companies)].slice(0, 5)
}

function extractEducation(text: string): Array<{ degree: string; field: string; institution: string; year: string | null }> {
  const education: Array<{ degree: string; field: string; institution: string; year: string | null }> = []
  
  const degreePatterns = [
    /(Bachelor(?:'s)?|B\.?S\.?|B\.?A\.?|B\.?Tech)\s*(?:in|of)?\s*([A-Za-z\s]+)/i,
    /(Master(?:'s)?|M\.?S\.?|M\.?A\.?|M\.?B\.?A\.?|M\.?Tech)\s*(?:in|of)?\s*([A-Za-z\s]+)/i,
    /(PhD|Ph\.?D\.?|Doctorate)\s*(?:in)?\s*([A-Za-z\s]+)/i,
    /(Associate(?:'s)?|A\.?S\.?|A\.?A\.?)\s*(?:in|of)?\s*([A-Za-z\s]+)/i
  ]
  
  for (const pattern of degreePatterns) {
    const matches = text.matchAll(pattern)
    for (const match of matches) {
      const degree = match[1]
      const field = match[2]?.trim() || 'Not specified'
      
      const yearMatch = text.match(/\b(19|20)\d{2}\b/)
      const year = yearMatch ? yearMatch[0] : null
      
      const institutionMatch = text.match(/(?:University|College|Institute|School)\s+(?:of\s+)?([A-Za-z\s]+)/i)
      const institution = institutionMatch ? institutionMatch[0] : 'Not specified'
      
      education.push({
        degree: degree.trim(),
        field: field.trim(),
        institution,
        year
      })
    }
  }
  
  return education
}

function extractCertifications(text: string): string[] {
  const certifications: string[] = []
  
  for (const cert of CERTIFICATE_KEYWORDS) {
    const regex = new RegExp(`\\b${escapeRegExp(cert)}[^,.\n]*`, 'i')
    const match = text.match(regex)
    if (match) {
      certifications.push(match[0].trim())
    }
  }
  
  return [...new Set(certifications)]
}

function calculateATSScore(text: string): number {
  let score = 100
  
  const wordCount = text.split(/\s+/).length
  if (wordCount < 200) score -= 15
  if (wordCount > 1000) score -= 10
  
  if (!extractEmail(text)) score -= 10
  if (!extractPhone(text)) score -= 10
  
  if (!/skills?/i.test(text)) score -= 15
  if (!/experience|employment|work history/i.test(text)) score -= 15
  if (!/education|degree|university|college/i.test(text)) score -= 10
  
  if (!checkQuantifiableResults(text)) score -= 10
  
  const actionVerbsFound = findActionVerbs(text)
  if (actionVerbsFound.length < 5) score -= 10
  
  const skills = extractTechnicalSkills(text)
  if (skills.length < 5) score -= 10
  if (skills.length > 15) score += 5
  
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
  
  return issues
}

function generateATSSuggestions(text: string): string[] {
  const suggestions: string[] = []
  
  if (!checkQuantifiableResults(text)) {
    suggestions.push('Add quantifiable achievements (e.g., "Increased sales by 25%")')
  }
  
  const actionVerbs = findActionVerbs(text)
  if (actionVerbs.length < 5) {
    suggestions.push('Use more action verbs like "developed", "implemented", "led"')
  }
  
  const skills = extractTechnicalSkills(text)
  if (skills.length < 10) {
    suggestions.push('Include more relevant technical keywords from job descriptions')
  }
  
  if (!/summary|objective|profile/i.test(text)) {
    suggestions.push('Add a professional summary section')
  }
  
  suggestions.push('Tailor keywords to match job description requirements')
  suggestions.push('Keep formatting simple for ATS readability')
  
  return suggestions
}

function identifySections(text: string): string[] {
  const sections: string[] = []
  const sectionPatterns = [
    { name: 'Summary', pattern: /summary|objective|profile|about/i },
    { name: 'Experience', pattern: /experience|employment|work history/i },
    { name: 'Education', pattern: /education|academic/i },
    { name: 'Skills', pattern: /skills|technologies|competencies/i },
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
    if (lowerText.includes(verb)) {
      found.push(verb)
    }
  }
  
  return found
}

function recommendJobTitles(text: string): string[] {
  const skillsByCat = categorizeSkills(text)
  const foundTitles: string[] = []
  
  if (skillsByCat.frontend && skillsByCat.frontend.length >= 3) {
    foundTitles.push('Frontend Developer')
    if (skillsByCat.frontend.includes('React')) {
      foundTitles.push('React Developer')
    }
  }
  
  if (skillsByCat.backend && skillsByCat.backend.length >= 3) {
    foundTitles.push('Backend Developer')
  }
  
  if ((skillsByCat.frontend?.length || 0) >= 2 && (skillsByCat.backend?.length || 0) >= 2) {
    foundTitles.push('Full Stack Developer')
  }
  
  if (skillsByCat.ml_ai && skillsByCat.ml_ai.length >= 3) {
    foundTitles.push('Data Scientist')
    foundTitles.push('Machine Learning Engineer')
  }
  
  if (skillsByCat.devops && skillsByCat.devops.length >= 3) {
    foundTitles.push('DevOps Engineer')
    foundTitles.push('Site Reliability Engineer')
  }
  
  if (skillsByCat.cloud && skillsByCat.cloud.length >= 3) {
    foundTitles.push('Cloud Engineer')
    foundTitles.push('Solutions Architect')
  }
  
  if (skillsByCat.mobile && skillsByCat.mobile.length >= 2) {
    foundTitles.push('Mobile Developer')
  }
  
  if (foundTitles.length === 0) {
    foundTitles.push('Software Developer')
    foundTitles.push('Technical Specialist')
  }
  
  return [...new Set(foundTitles)].slice(0, 5)
}

function determineExperienceLevel(text: string): 'entry' | 'mid' | 'senior' | 'lead' | 'executive' {
  const years = estimateExperience(text)
  
  if (/\b(director|vp|vice president|cto|cio|chief|head of)\b/i.test(text)) {
    return 'executive'
  }
  
  if (/\b(lead|principal|staff|senior)\b/i.test(text)) {
    return years >= 8 ? 'lead' : 'senior'
  }
  
  if (years >= 10) return 'executive'
  if (years >= 6) return 'senior'
  if (years >= 3) return 'mid'
  return 'entry'
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Calculate job match score
 */
export function calculateJobMatch(resumeText: string, jobDescription: string): {
  score: number
  matchedSkills: string[]
  missingSkills: string[]
  recommendations: string[]
} {
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
  
  let score = 50
  
  if (jobSkills.length > 0) {
    const matchRatio = matchedSkills.length / jobSkills.length
    score += Math.round(matchRatio * 40)
  } else {
    score += 20
  }
  
  const resumeLevel = determineExperienceLevel(resumeText)
  const jobLevel = determineExperienceLevel(jobDescription)
  if (resumeLevel === jobLevel) {
    score += 10
  }
  
  const recommendations: string[] = []
  
  if (missingSkills.length > 0) {
    recommendations.push(`Consider highlighting experience with: ${missingSkills.slice(0, 5).join(', ')}`)
  }
  
  if (matchedSkills.length < 5) {
    recommendations.push('Add more relevant keywords from the job description')
  }
  
  recommendations.push('Tailor your summary to match job requirements')
  recommendations.push('Highlight relevant projects that demonstrate required skills')
  
  return {
    score: Math.min(100, Math.max(0, score)),
    matchedSkills,
    missingSkills,
    recommendations
  }
}

export { SKILLS_DATABASE, ALL_SKILLS, JOB_TITLES, ACTION_VERBS }