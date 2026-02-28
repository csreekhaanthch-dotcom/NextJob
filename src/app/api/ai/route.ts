import { NextRequest, NextResponse } from 'next/server'

// Direct import - will fail at startup if not installed
let ZAI: any = null

try {
  ZAI = require('z-ai-web-dev-sdk').default || require('z-ai-web-dev-sdk')
  console.log('✅ z-ai-web-dev-sdk loaded successfully')
} catch (e) {
  console.log('❌ z-ai-web-dev-sdk NOT installed. AI features will use fallback.')
}

// Cache ZAI instance
let zaiInstance: any = null

async function getZai() {
  if (!ZAI) {
    console.log('ZAI SDK not available')
    return null
  }
  
  if (zaiInstance) {
    return zaiInstance
  }
  
  try {
    console.log('Initializing ZAI...')
    zaiInstance = await ZAI.create()
    console.log('✅ ZAI initialized successfully')
    return zaiInstance
  } catch (error) {
    console.error('❌ Failed to initialize ZAI:', error)
    return null
  }
}

async function callAI(systemPrompt: string, userPrompt: string, maxTokens: number = 1000): Promise<{ content: string | null; error?: string }> {
  try {
    const zai = await getZai()
    
    if (!zai) {
      return { content: null, error: 'AI SDK not available' }
    }
    
    console.log('Calling AI with prompt length:', userPrompt.length)
    
    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: maxTokens,
      temperature: 0.7
    })

    const content = completion.choices?.[0]?.message?.content
    
    if (content) {
      console.log('✅ AI response received, length:', content.length)
      return { content }
    } else {
      console.log('❌ AI returned empty response')
      return { content: null, error: 'Empty AI response' }
    }
  } catch (error: any) {
    console.error('❌ AI call error:', error?.message || error)
    return { content: null, error: error?.message || 'Unknown error' }
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

// Smart fallback based on resume content
function generateSmartFallback(resumeText: string): any {
  const text = resumeText.toLowerCase()
  
  const skills: string[] = []
  if (text.includes('javascript') || text.includes('typescript')) skills.push('JavaScript/TypeScript')
  if (text.includes('python')) skills.push('Python')
  if (text.includes('java ')) skills.push('Java')
  if (text.includes('react')) skills.push('React')
  if (text.includes('node')) skills.push('Node.js')
  if (text.includes('sql') || text.includes('database')) skills.push('SQL/Databases')
  if (text.includes('aws') || text.includes('azure')) skills.push('Cloud Services')
  if (text.includes('docker') || text.includes('kubernetes')) skills.push('DevOps')
  if (text.includes('machine learning') || text.includes('ml')) skills.push('Machine Learning')
  if (text.includes('agile') || text.includes('scrum')) skills.push('Agile')
  if (skills.length === 0) skills.push('Problem Solving', 'Communication')
  
  const yearMatches = text.match(/\b(19|20)\d{2}\b/g) || []
  const currentYear = new Date().getFullYear()
  const years = yearMatches.map(y => parseInt(y)).filter(y => y >= 1990 && y <= currentYear)
  const experienceYears = years.length > 0 ? Math.min(currentYear - Math.min(...years), 25) : 3
  
  const titles: string[] = []
  if (text.includes('engineer') || text.includes('developer')) titles.push('Software Engineer')
  if (text.includes('senior')) titles.push('Senior Engineer')
  if (text.includes('lead') || text.includes('principal')) titles.push('Lead Engineer')
  if (text.includes('manager')) titles.push('Engineering Manager')
  if (text.includes('data scientist')) titles.push('Data Scientist')
  if (text.includes('product manager')) titles.push('Product Manager')
  if (titles.length === 0) titles.push('Software Developer')
  
  let score = 50
  if (resumeText.length > 500) score += 10
  if (resumeText.length > 1000) score += 10
  if (text.includes('education')) score += 5
  if (text.includes('experience')) score += 5
  if (text.includes('project')) score += 5
  if (skills.length >= 5) score += 5
  score = Math.min(score, 95)
  
  return {
    overall_score: score,
    strengths: [
      `Detected ${skills.length} relevant skills`,
      `Estimated ${experienceYears} years of experience`,
      `Resume contains ${resumeText.length} characters`
    ],
    weaknesses: [
      'Full AI analysis unavailable',
      'Add more specific achievements',
      'Include measurable results'
    ],
    improvements: [
      'Add quantifiable metrics (e.g., "increased sales by 20%")',
      'Include a professional summary',
      'Use action verbs to start bullet points',
      'Tailor to specific job descriptions'
    ],
    skills_detected: skills,
    experience_years: experienceYears,
    job_titles_fit: titles.slice(0, 5),
    keywords_missing: ['Results-driven', 'Cross-functional', 'Stakeholder management'],
    ats_compatibility_score: Math.max(60, score - 5),
    _analysis_type: 'fallback',
    _ai_available: !!ZAI
  }
}

async function analyzeResume(resumeText: string): Promise<{ analysis: any; aiUsed: boolean; error?: string }> {
  if (!resumeText || resumeText.trim().length < 50) {
    return { 
      analysis: null, 
      aiUsed: false, 
      error: 'Please provide at least 50 characters' 
    }
  }
  
  const systemPrompt = `You are an expert resume analyst. Analyze THIS SPECIFIC resume and provide UNIQUE insights.

IMPORTANT: Extract actual details from the resume. Be specific and personal.

Return ONLY valid JSON:
{
  "overall_score": <0-100>,
  "strengths": [<3-5 specific strengths from THIS resume>],
  "weaknesses": [<2-4 specific issues in THIS resume>],
  "improvements": [<3-5 specific actionable recommendations>],
  "skills_detected": [<actual skills YOU found>],
  "experience_years": <number based on resume>,
  "job_titles_fit": [<job titles matching this person>],
  "keywords_missing": [<important missing keywords>],
  "ats_compatibility_score": <0-100>
}

Make it UNIQUE to this resume - don't use generic responses!`

  const userPrompt = `Analyze this resume thoroughly:

 ${resumeText.substring(0, 4000)}

Provide a detailed, PERSONALIZED analysis specific to this individual.`

  const result = await callAI(systemPrompt, userPrompt, 1500)
  
  if (result.content) {
    const parsed = extractJsonFromResponse(result.content)
    if (parsed && parsed.overall_score) {
      parsed._analysis_type = 'ai_powered'
      parsed._ai_available = true
      return { analysis: parsed, aiUsed: true }
    }
  }
  
  // Fallback
  const fallback = generateSmartFallback(resumeText)
  fallback._ai_error = result.error
  return { analysis: fallback, aiUsed: false, error: result.error }
}

async function generateInterviewQuestions(job: any): Promise<{ questions: any[]; aiUsed: boolean }> {
  const systemPrompt = 'You are an interview coach. Generate specific interview questions in JSON array format.'
  const userPrompt = `Generate 8 interview questions for:
Position: ${job.title}
Company: ${job.company}
Description: ${(job.description || '').substring(0, 500)}

Return JSON array:
[{"question": "", "category": "behavioral|technical|situational", "difficulty": "easy|medium|hard", "tips": ""}]`

  const result = await callAI(systemPrompt, userPrompt, 1500)
  
  if (result.content) {
    const parsed = extractJsonFromResponse(result.content)
    if (Array.isArray(parsed) && parsed.length > 0) {
      return { questions: parsed, aiUsed: true }
    }
  }
  
  // Fallback questions
  const title = job?.title || 'this position'
  return {
    questions: [
      { question: `Tell me about your experience with ${title}.`, category: 'behavioral', difficulty: 'easy', tips: 'Use specific examples.' },
      { question: 'Describe a challenging project you worked on.', category: 'behavioral', difficulty: 'medium', tips: 'Highlight problem-solving.' },
      { question: 'How do you handle tight deadlines?', category: 'situational', difficulty: 'medium', tips: 'Discuss prioritization.' },
      { question: 'What are your greatest strengths?', category: 'behavioral', difficulty: 'easy', tips: 'Be specific and honest.' }
    ],
    aiUsed: false
  }
}

async function generateCoverLetter(job: any, userProfile: string): Promise<{ coverLetter: string; aiUsed: boolean }> {
  const systemPrompt = 'You are a career coach. Write professional cover letters.'
  const userPrompt = `Write a cover letter (250 words max) for:
Job: ${job.title} at ${job.company}
Candidate: ${userProfile.substring(0, 500)}`

  const result = await callAI(systemPrompt, userPrompt, 600)
  
  if (result.content) {
    return { coverLetter: result.content, aiUsed: true }
  }
  
  return {
    coverLetter: `Dear Hiring Manager,

I am writing to express my interest in the ${job.title} position at ${job.company}. My experience and skills make me a strong candidate for this role.

I would welcome the opportunity to discuss my qualifications further.

Sincerely,
[Your Name]`,
    aiUsed: false
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, job, userProfile, resumeText } = body

    console.log(`AI API called: action=${action}`)

    switch (action) {
      case 'cover-letter':
        if (!job || !userProfile) {
          return NextResponse.json({ error: 'Job and userProfile required' }, { status: 400 })
        }
        return NextResponse.json(await generateCoverLetter(job, userProfile))

      case 'analyze-resume':
        if (!resumeText || resumeText.trim().length < 50) {
          return NextResponse.json({ error: 'Provide at least 50 characters' }, { status: 400 })
        }
        return NextResponse.json(await analyzeResume(resumeText))

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
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}