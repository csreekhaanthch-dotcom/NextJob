import { NextRequest, NextResponse } from 'next/server'

// Check if we're in development or have the SDK
const hasZaiSdk = () => {
  try {
    require.resolve('z-ai-web-dev-sdk')
    return true
  } catch {
    return false
  }
}

// Dynamic import for ZAI
async function getZai() {
  if (!hasZaiSdk()) {
    console.log('z-ai-web-dev-sdk not installed, using fallback')
    return null
  }
  
  try {
    const ZAI = (await import('z-ai-web-dev-sdk')).default
    return await ZAI.create()
  } catch (error) {
    console.error('Failed to initialize ZAI:', error)
    return null
  }
}

async function callAI(systemPrompt: string, userPrompt: string, maxTokens: number = 800): Promise<string | null> {
  try {
    const zai = await getZai()
    
    if (!zai) {
      console.log('No AI available, returning null')
      return null
    }
    
    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: maxTokens,
      temperature: 0.7
    })

    const content = completion.choices?.[0]?.message?.content
    console.log('AI response received:', content ? 'success' : 'empty')
    return content || null
  } catch (error) {
    console.error('AI call error:', error)
    return null
  }
}

function extractJsonFromResponse(content: string): any {
  if (!content) return null
  try { return JSON.parse(content) } catch {}
  const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (jsonMatch) { try { return JSON.parse(jsonMatch[1].trim()) } catch {} }
  const objectMatch = content.match(/\{[\s\S]*\}/)
  if (objectMatch) { try { return JSON.parse(objectMatch[0]) } catch {} }
  return null
}

// Smart fallback - generates unique analysis based on resume content
function generateSmartFallback(resumeText: string): any {
  const text = resumeText.toLowerCase()
  
  // Detect skills from resume
  const skills = []
  if (text.includes('javascript') || text.includes('typescript')) skills.push('JavaScript/TypeScript')
  if (text.includes('python')) skills.push('Python')
  if (text.includes('java')) skills.push('Java')
  if (text.includes('react')) skills.push('React')
  if (text.includes('node')) skills.push('Node.js')
  if (text.includes('sql') || text.includes('database')) skills.push('SQL/Databases')
  if (text.includes('aws') || text.includes('cloud')) skills.push('Cloud Services')
  if (text.includes('docker') || text.includes('kubernetes')) skills.push('DevOps')
  if (text.includes('machine learning') || text.includes('ai')) skills.push('AI/ML')
  if (text.includes('agile') || text.includes('scrum')) skills.push('Agile/Scrum')
  if (text.includes('leadership') || text.includes('manager')) skills.push('Leadership')
  if (text.includes('communication')) skills.push('Communication')
  if (skills.length === 0) skills.push('Problem Solving', 'Team Collaboration')
  
  // Estimate experience
  const yearMatches = text.match(/\b(19|20)\d{2}\b/g) || []
  const currentYear = new Date().getFullYear()
  const years = yearMatches
    .map(y => parseInt(y))
    .filter(y => y >= 1990 && y <= currentYear)
  const experienceYears = years.length > 0 ? Math.min(currentYear - Math.min(...years), 20) : 3
  
  // Detect job titles
  const titles = []
  if (text.includes('engineer') || text.includes('developer')) titles.push('Software Engineer')
  if (text.includes('senior')) titles.push('Senior Software Engineer')
  if (text.includes('lead') || text.includes('principal')) titles.push('Lead Engineer')
  if (text.includes('manager')) titles.push('Engineering Manager')
  if (text.includes('data') && text.includes('scientist')) titles.push('Data Scientist')
  if (text.includes('product')) titles.push('Product Manager')
  if (titles.length === 0) titles.push('Software Developer')
  
  // Calculate score based on content
  let score = 50
  if (resumeText.length > 500) score += 10
  if (resumeText.length > 1000) score += 10
  if (text.includes('education') || text.includes('degree')) score += 5
  if (text.includes('experience') || text.includes('work')) score += 5
  if (text.includes('project')) score += 5
  if (text.includes('skill')) score += 5
  if (skills.length >= 3) score += 5
  if (text.includes('achievement') || text.includes('award')) score += 5
  score = Math.min(score, 95)
  
  // Extract unique keywords from resume
  const words = resumeText.split(/\s+/).filter(w => w.length > 4)
  const uniqueWords = [...new Set(words)].slice(0, 20)
  
  return {
    overall_score: score,
    strengths: [
      `Resume contains ${skills.length} relevant skill${skills.length > 1 ? 's' : ''}: ${skills.slice(0, 5).join(', ')}`,
      `Estimated ${experienceYears} years of professional experience detected`,
      `Good length with ${resumeText.length} characters of content`
    ],
    weaknesses: [
      'AI analysis unavailable - install z-ai-web-dev-sdk for detailed feedback',
      'Consider adding more quantifiable achievements',
      'Ensure keywords match target job descriptions'
    ],
    improvements: [
      'Add specific metrics and numbers to demonstrate impact',
      'Include a professional summary at the top',
      'Tailor keywords to match the job you\'re applying for',
      'Use action verbs to start bullet points',
      'Keep formatting clean and ATS-friendly'
    ],
    skills_detected: skills,
    experience_years: experienceYears,
    job_titles_fit: titles.slice(0, 5),
    keywords_missing: ['Results-driven', 'Cross-functional', 'Stakeholder management', 'KPIs'],
    ats_compatibility_score: Math.max(60, score - 5),
    _analysis_type: 'smart_fallback',
    _note: 'Install z-ai-web-dev-sdk for full AI-powered analysis'
  }
}

function getFallbackInterviewQuestions(job: any): any[] {
  const title = job?.title || 'this position'
  const company = job?.company || 'our company'
  return [
    { question: `Tell me about your experience related to ${title}.`, category: 'behavioral', difficulty: 'easy', tips: 'Use the STAR method - Situation, Task, Action, Result.' },
    { question: 'Walk me through a challenging project and how you overcame obstacles.', category: 'behavioral', difficulty: 'medium', tips: 'Highlight your problem-solving approach.' },
    { question: `Why are you interested in working at ${company}?`, category: 'behavioral', difficulty: 'easy', tips: 'Research the company beforehand.' },
    { question: 'How do you handle tight deadlines?', category: 'situational', difficulty: 'medium', tips: 'Discuss prioritization methods.' },
    { question: 'Describe a time you learned something new quickly.', category: 'behavioral', difficulty: 'medium', tips: 'Show your adaptability.' }
  ]
}

function getFallbackCoverLetter(job: any, userProfile: string): string {
  const title = job?.title || 'the position'
  const company = job?.company || 'your company'
  return `Dear Hiring Manager,

I am writing to express my strong interest in the ${title} position at ${company}. With my background and experience, I am confident I would be a valuable addition to your team.

I would welcome the opportunity to discuss how my background aligns with your needs.

Sincerely,
[Your Name]`
}

// AI Functions
async function analyzeResume(resumeText: string): Promise<{ analysis: any; aiUsed: boolean; error?: string }> {
  if (!resumeText || resumeText.trim().length < 50) {
    return { 
      analysis: null, 
      aiUsed: false, 
      error: 'Please provide more resume content (at least 50 characters)' 
    }
  }
  
  const systemPrompt = `You are an expert resume reviewer and career coach. Analyze resumes and provide DETAILED, SPECIFIC feedback.

IMPORTANT: Your analysis must be UNIQUE to each resume. Extract specific details from the resume content.

Return ONLY valid JSON with this exact structure:
{
  "overall_score": <number 0-100 based on resume quality>,
  "strengths": [<3-5 specific strengths found in THIS resume>],
  "weaknesses": [<2-4 specific areas needing improvement>],
  "improvements": [<3-5 actionable recommendations>],
  "skills_detected": [<list of skills YOU found in the resume>],
  "experience_years": <estimated years based on dates/titles>,
  "job_titles_fit": [<3-5 job titles matching this resume>],
  "keywords_missing": [<important keywords NOT in this resume>],
  "ats_compatibility_score": <0-100>
}

Be specific to THIS resume. Don't use generic responses.`

  const userPrompt = `Analyze this resume:

 ${resumeText}

Provide a detailed, personalized analysis. Extract the person's actual skills, experience level, and job titles from the content.`

  const response = await callAI(systemPrompt, userPrompt, 1000)
  
  if (response) {
    const parsed = extractJsonFromResponse(response)
    if (parsed) {
      parsed._analysis_type = 'ai_powered'
      return { analysis: parsed, aiUsed: true }
    }
  }
  
  // Use smart fallback instead of generic one
  const fallbackAnalysis = generateSmartFallback(resumeText)
  return { analysis: fallbackAnalysis, aiUsed: false }
}

async function generateCoverLetter(job: any, userProfile: string): Promise<{ coverLetter: string; aiUsed: boolean }> {
  const systemPrompt = 'You are an expert career coach. Write personalized cover letters.'
  const userPrompt = `Write a cover letter for:
Job: ${job.title} at ${job.company}
Description: ${job.description}
Candidate: ${userProfile}
Keep it under 300 words.`

  const response = await callAI(systemPrompt, userPrompt, 500)
  if (response) {
    return { coverLetter: response, aiUsed: true }
  }
  return { coverLetter: getFallbackCoverLetter(job, userProfile), aiUsed: false }
}

async function generateInterviewQuestions(job: any): Promise<{ questions: any[]; aiUsed: boolean }> {
  const systemPrompt = 'You are an interview coach. Generate relevant interview questions in JSON array.'
  const userPrompt = `Generate 8 interview questions for:
Title: ${job.title}
Company: ${job.company}
Description: ${job.description}

Return JSON: [{"question": "", "category": "behavioral|technical|situational", "difficulty": "easy|medium|hard", "tips": ""}]`

  const response = await callAI(systemPrompt, userPrompt, 1000)
  if (response) {
    const parsed = extractJsonFromResponse(response)
    if (Array.isArray(parsed)) {
      return { questions: parsed, aiUsed: true }
    }
  }
  return { questions: getFallbackInterviewQuestions(job), aiUsed: false }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, job, userProfile, resumeText } = body

    switch (action) {
      case 'cover-letter':
        if (!job || !userProfile) {
          return NextResponse.json({ error: 'Job and userProfile required' }, { status: 400 })
        }
        return NextResponse.json(await generateCoverLetter(job, userProfile))

      case 'analyze-resume':
        if (!resumeText || resumeText.trim().length < 50) {
          return NextResponse.json({ 
            error: 'Please provide more resume content (at least 50 characters)',
            analysis: null 
          }, { status: 400 })
        }
        const result = await analyzeResume(resumeText)
        return NextResponse.json(result)

      case 'interview-questions':
        if (!job) {
          return NextResponse.json({ error: 'Job required' }, { status: 400 })
        }
        return NextResponse.json(await generateInterviewQuestions(job))

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error: any) {
    console.error('AI API error:', error)
    return NextResponse.json({ error: 'Processing failed', message: error.message }, { status: 500 })
  }
}