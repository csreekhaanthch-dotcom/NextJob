import { NextRequest, NextResponse } from 'next/server'

function extractJsonFromResponse(content: string): any {
  if (!content) return null
  try { return JSON.parse(content) } catch {}
  const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (jsonMatch) { try { return JSON.parse(jsonMatch[1].trim()) } catch {} }
  const objectMatch = content.match(/\{[\s\S]*\}/)
  if (objectMatch) { try { return JSON.parse(objectMatch[0]) } catch {} }
  const arrayMatch = content.match(/\[[\s\S]*\]/)
  if (arrayMatch) { try { return JSON.parse(arrayMatch[0]) } catch {} }
  return null
}

function getFallbackResumeAnalysis(): any {
  return {
    overall_score: 72,
    strengths: ['Clear professional summary', 'Relevant technical skills', 'Good work history'],
    weaknesses: ['Could use more quantifiable achievements', 'Skills section placement'],
    improvements: ['Add metrics to demonstrate impact', 'Include compelling summary'],
    skills_detected: ['Communication', 'Problem Solving', 'Team Collaboration'],
    experience_years: 5,
    job_titles_fit: ['Software Developer', 'Project Coordinator'],
    keywords_missing: ['Leadership', 'Agile/Scrum'],
    ats_compatibility_score: 78
  }
}

function getFallbackInterviewQuestions(job: any): any[] {
  const title = job?.title || 'this position'
  const company = job?.company || 'our company'
  return [
    { question: `Tell me about your experience for the ${title} role.`, category: 'behavioral', difficulty: 'easy', tips: 'Use STAR method.' },
    { question: 'Walk me through a challenging project.', category: 'behavioral', difficulty: 'medium', tips: 'Highlight your thought process.' },
    { question: `Why are you interested in ${company}?`, category: 'behavioral', difficulty: 'easy', tips: 'Research the company.' },
    { question: 'Describe learning something new quickly.', category: 'behavioral', difficulty: 'medium', tips: 'Show adaptability.' },
    { question: 'How do you handle tight deadlines?', category: 'situational', difficulty: 'medium', tips: 'Discuss prioritization.' },
    { question: 'Tell me about a disagreement with a colleague.', category: 'behavioral', difficulty: 'medium', tips: 'Focus on collaboration.' },
    { question: `What is your greatest strength for ${title}?`, category: 'behavioral', difficulty: 'easy', tips: 'Give a specific example.' },
    { question: 'Where do you see yourself in 5 years?', category: 'behavioral', difficulty: 'easy', tips: 'Be realistic.' },
    { question: 'Describe working with a difficult team member.', category: 'behavioral', difficulty: 'hard', tips: 'Stay professional.' },
    { question: 'What questions do you have for us?', category: 'behavioral', difficulty: 'easy', tips: 'Be prepared.' }
  ]
}

function getFallbackCoverLetter(job: any, userProfile: string): string {
  const title = job?.title || 'the position'
  const company = job?.company || 'your company'
  return `Dear Hiring Manager,

I am writing to express my strong interest in the ${title} position at ${company}. With my background and experience, I am confident I would be a valuable addition to your team.

I thrive in collaborative environments and am passionate about delivering high-quality results.

I would welcome the opportunity to discuss how my background aligns with your needs.

Sincerely,
[Your Name]`
}

async function analyzeResume(resumeText: string): Promise<{ analysis: any; aiUsed: boolean; error?: string }> {
  try {
    const ZAI = (await import('z-ai-web-dev-sdk')).default
    const zai = await ZAI.create()
    
    const prompt = `Analyze this resume:\n\n${resumeText}\n\nReturn JSON only:\n{"overall_score": 0-100, "strengths": [], "weaknesses": [], "improvements": [], "skills_detected": [], "experience_years": 0, "job_titles_fit": [], "keywords_missing": [], "ats_compatibility_score": 0-100}`
    
    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a resume expert. Respond in JSON only.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 800
    })
    
    const content = completion.choices[0]?.message?.content || ''
    const parsed = extractJsonFromResponse(content)
    
    if (parsed) {
      return { analysis: parsed, aiUsed: true }
    }
    return { analysis: getFallbackResumeAnalysis(), aiUsed: false, error: 'Failed to parse AI response' }
  } catch (error: any) {
    return { analysis: getFallbackResumeAnalysis(), aiUsed: false, error: error.message }
  }
}

async function generateInterviewQuestions(job: any): Promise<{ questions: any[]; aiUsed: boolean; error?: string }> {
  try {
    const ZAI = (await import('z-ai-web-dev-sdk')).default
    const zai = await ZAI.create()
    
    const prompt = `Generate 10 interview questions for:\nTitle: ${job.title}\nCompany: ${job.company}\nDescription: ${job.description}\n\nReturn JSON array: [{"question": "", "category": "behavioral|technical|situational", "difficulty": "easy|medium|hard", "tips": ""}]`
    
    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are an interview expert. Respond in JSON only.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 1000
    })
    
    const content = completion.choices[0]?.message?.content || ''
    const parsed = extractJsonFromResponse(content)
    
    if (Array.isArray(parsed)) {
      return { questions: parsed, aiUsed: true }
    }
    return { questions: getFallbackInterviewQuestions(job), aiUsed: false, error: 'Failed to parse' }
  } catch (error: any) {
    return { questions: getFallbackInterviewQuestions(job), aiUsed: false, error: error.message }
  }
}

async function generateCoverLetter(job: any, userProfile: string): Promise<{ coverLetter: string; aiUsed: boolean; error?: string }> {
  try {
    const ZAI = (await import('z-ai-web-dev-sdk')).default
    const zai = await ZAI.create()
    
    const prompt = `Write a cover letter for:\nTitle: ${job.title}\nCompany: ${job.company}\nCandidate: ${userProfile}\n\n250 words.`
    
    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a career coach.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 500
    })
    
    const content = completion.choices[0]?.message?.content
    if (content) {
      return { coverLetter: content, aiUsed: true }
    }
    return { coverLetter: getFallbackCoverLetter(job, userProfile), aiUsed: false }
  } catch (error: any) {
    return { coverLetter: getFallbackCoverLetter(job, userProfile), aiUsed: false, error: error.message }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, job, userProfile, resumeText } = body
    
    switch (action) {
      case 'cover-letter': {
        if (!job || !userProfile) return NextResponse.json({ error: 'Job and userProfile required' }, { status: 400 })
        const result = await generateCoverLetter(job, userProfile)
        return NextResponse.json(result)
      }
      case 'analyze-resume': {
        if (!resumeText) return NextResponse.json({ error: 'resumeText required' }, { status: 400 })
        const result = await analyzeResume(resumeText)
        return NextResponse.json(result)
      }
      case 'interview-questions': {
        if (!job) return NextResponse.json({ error: 'Job required' }, { status: 400 })
        const result = await generateInterviewQuestions(job)
        return NextResponse.json(result)
      }
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error: any) {
    return NextResponse.json({ error: 'AI processing failed', message: error.message }, { status: 500 })
  }
}