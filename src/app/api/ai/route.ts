import { NextRequest, NextResponse } from 'next/server'

// Use dynamic import for ES module
let zaiInstance: any = null

async function getZai() {
  if (zaiInstance) return zaiInstance
  
  try {
    // Dynamic import for the SDK
    const { default: ZAI } = await import('z-ai-web-dev-sdk')
    console.log('✅ z-ai-web-dev-sdk imported')
    
    zaiInstance = await ZAI.create()
    console.log('✅ ZAI initialized successfully')
    return zaiInstance
  } catch (error: any) {
    console.error('❌ ZAI initialization failed:', error.message)
    return null
  }
}

async function callAI(systemPrompt: string, userPrompt: string, maxTokens: number = 1000): Promise<{ content: string | null; error?: string }> {
  try {
    const zai = await getZai()
    
    if (!zai) {
      return { content: null, error: 'AI not initialized' }
    }
    
    console.log('🤖 Calling AI...')
    
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
      console.log('✅ AI response received:', content.substring(0, 100))
      return { content }
    }
    
    return { content: null, error: 'Empty response' }
  } catch (error: any) {
    console.error('❌ AI error:', error.message)
    return { content: null, error: error.message }
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

// Smart fallback
function generateSmartFallback(resumeText: string): any {
  const text = resumeText.toLowerCase()
  
  const skills: string[] = []
  if (text.includes('javascript') || text.includes('typescript')) skills.push('JavaScript/TypeScript')
  if (text.includes('python')) skills.push('Python')
  if (text.includes('java ')) skills.push('Java')
  if (text.includes('react')) skills.push('React')
  if (text.includes('node')) skills.push('Node.js')
  if (text.includes('sql')) skills.push('SQL')
  if (text.includes('aws') || text.includes('azure')) skills.push('Cloud')
  if (text.includes('docker')) skills.push('Docker')
  if (text.includes('kubernetes')) skills.push('Kubernetes')
  if (text.includes('machine learning')) skills.push('Machine Learning')
  if (skills.length === 0) skills.push('Communication', 'Problem Solving')
  
  let score = 60 + Math.min(skills.length * 3, 20)
  if (resumeText.length > 2000) score += 5
  if (resumeText.length > 5000) score += 5
  
  return {
    overall_score: Math.min(score, 95),
    strengths: [
      `Contains ${skills.length} relevant skills`,
      `Resume length: ${Math.round(resumeText.length / 1000)}K characters`,
      'Good skill diversity'
    ],
    weaknesses: [
      'AI service temporarily unavailable',
      'Consider adding metrics'
    ],
    improvements: [
      'Add quantifiable achievements',
      'Include a summary section',
      'Use action verbs'
    ],
    skills_detected: skills,
    experience_years: Math.floor(resumeText.length / 1000),
    job_titles_fit: ['Software Engineer', 'Developer', 'Technical Lead'],
    keywords_missing: ['Metrics', 'Impact', 'Leadership'],
    ats_compatibility_score: Math.min(score - 5, 90),
    _note: 'Fallback analysis - AI initializing'
  }
}

async function analyzeResume(resumeText: string): Promise<{ analysis: any; aiUsed: boolean }> {
  if (!resumeText || resumeText.length < 50) {
    return { analysis: null, aiUsed: false }
  }
  
  const systemPrompt = `You are a resume expert. Analyze resumes and return ONLY valid JSON.
Return this exact structure:
{
  "overall_score": <0-100>,
  "strengths": [<3 specific strengths>],
  "weaknesses": [<2 specific issues>],
  "improvements": [<3 specific tips>],
  "skills_detected": [<skills found>],
  "experience_years": <number>,
  "job_titles_fit": [<matching jobs>],
  "keywords_missing": [<missing keywords>],
  "ats_compatibility_score": <0-100>
}
Be specific to THIS resume.`

  const userPrompt = `Analyze this resume:\n\n${resumeText.substring(0, 3000)}`
  
  const result = await callAI(systemPrompt, userPrompt, 1200)
  
  if (result.content) {
    const parsed = extractJsonFromResponse(result.content)
    if (parsed && parsed.overall_score) {
      return { analysis: parsed, aiUsed: true }
    }
  }
  
  return { analysis: generateSmartFallback(resumeText), aiUsed: false }
}

async function generateCoverLetter(job: any, userProfile: string): Promise<{ coverLetter: string; aiUsed: boolean }> {
  const result = await callAI(
    'Write professional cover letters.',
    `Write a 200-word cover letter for ${job.title} at ${job.company}.\nCandidate: ${userProfile.substring(0, 300)}`,
    400
  )
  
  if (result.content) {
    return { coverLetter: result.content, aiUsed: true }
  }
  
  return {
    coverLetter: `Dear Hiring Manager,

I am excited to apply for the ${job.title} position at ${job.company}. My experience aligns well with this role, and I am confident I can contribute effectively to your team.

I look forward to discussing my qualifications.

Sincerely,
[Your Name]`,
    aiUsed: false
  }
}

async function generateInterviewQuestions(job: any): Promise<{ questions: any[]; aiUsed: boolean }> {
  const result = await callAI(
    'Generate interview questions as JSON array.',
    `Generate 5 interview questions for ${job.title} at ${job.company}. Return: [{"question":"...", "category":"behavioral|technical", "difficulty":"easy|medium|hard", "tips":"..."}]`,
    800
  )
  
  if (result.content) {
    const parsed = extractJsonFromResponse(result.content)
    if (Array.isArray(parsed)) {
      return { questions: parsed, aiUsed: true }
    }
  }
  
  return {
    questions: [
      { question: `Why do you want to work at ${job.company}?`, category: 'behavioral', difficulty: 'easy', tips: 'Research the company first' },
      { question: 'Tell me about a challenging project.', category: 'behavioral', difficulty: 'medium', tips: 'Use STAR method' },
      { question: 'How do you handle deadlines?', category: 'situational', difficulty: 'medium', tips: 'Give a specific example' }
    ],
    aiUsed: false
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, job, userProfile, resumeText } = body

    console.log(`📩 AI API: ${action}`)

    switch (action) {
      case 'cover-letter':
        return NextResponse.json(await generateCoverLetter(job, userProfile))
      case 'analyze-resume':
        return NextResponse.json(await analyzeResume(resumeText))
      case 'interview-questions':
        return NextResponse.json(await generateInterviewQuestions(job))
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}