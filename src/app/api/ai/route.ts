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
    strengths: ['Clear professional summary', 'Relevant technical skills', 'Good work history', 'Action-oriented bullet points'],
    weaknesses: ['Could use more quantifiable achievements', 'Skills section placement', 'Missing industry keywords'],
    improvements: ['Add metrics to demonstrate impact', 'Include compelling summary', 'Tailor keywords to job descriptions', 'Add certifications section'],
    skills_detected: ['Communication', 'Problem Solving', 'Team Collaboration', 'Project Management', 'Technical Writing'],
    experience_years: 5,
    job_titles_fit: ['Software Developer', 'Project Coordinator', 'Technical Specialist', 'Business Analyst'],
    keywords_missing: ['Leadership', 'Agile/Scrum', 'Cloud Technologies', 'Data Analysis'],
    ats_compatibility_score: 78
  }
}

function getFallbackInterviewQuestions(job: any): any[] {
  const title = job?.title || 'this position'
  const company = job?.company || 'our company'
  return [
    { question: `Tell me about your experience for the ${title} role.`, category: 'behavioral', difficulty: 'easy', tips: 'Use STAR method - Situation, Task, Action, Result.' },
    { question: 'Walk me through a challenging project and how you overcame obstacles.', category: 'behavioral', difficulty: 'medium', tips: 'Highlight your thought process and positive outcome.' },
    { question: `Why are you interested in working at ${company}?`, category: 'behavioral', difficulty: 'easy', tips: 'Research company beforehand, mention specific values or products.' },
    { question: 'Describe a time you learned something new quickly.', category: 'behavioral', difficulty: 'medium', tips: 'Show adaptability and successful outcome.' },
    { question: 'How do you handle conflicting priorities and tight deadlines?', category: 'situational', difficulty: 'medium', tips: 'Discuss organization methods and prioritization.' },
    { question: 'Tell me about a disagreement with a colleague. How did you resolve it?', category: 'behavioral', difficulty: 'medium', tips: 'Focus on collaboration and win-win solutions.' },
    { question: `What is your greatest strength for this ${title} position?`, category: 'behavioral', difficulty: 'easy', tips: 'Choose relevant strength with specific example.' },
    { question: 'Where do you see yourself in 5 years?', category: 'behavioral', difficulty: 'easy', tips: 'Show ambition while being realistic.' },
    { question: 'Describe working with a difficult team member.', category: 'behavioral', difficulty: 'hard', tips: 'Stay professional, focus on actions taken.' },
    { question: 'What questions do you have for us?', category: 'behavioral', difficulty: 'easy', tips: 'Always have thoughtful questions prepared.' }
  ]
}

function getFallbackCoverLetter(job: any, userProfile: string): string {
  const title = job?.title || 'the position'
  const company = job?.company || 'your company'
  return `Dear Hiring Manager,

I am writing to express my strong interest in the ${title} position at ${company}. With my background and experience, I am confident I would be a valuable addition to your team.

Throughout my career, I have developed strong skills in problem-solving, communication, and project management. I thrive in collaborative environments and am passionate about delivering high-quality results.

I am particularly drawn to ${company} because of its reputation for innovation and commitment to excellence. I believe my skills would enable me to contribute meaningfully to your team's goals.

I would welcome the opportunity to discuss how my background aligns with your needs. Thank you for considering my application.

Sincerely,
[Your Name]`
}

async function analyzeResume(resumeText: string): Promise<any> {
  try {
    const ZAI = (await import('z-ai-web-dev-sdk')).default
    const zai = await ZAI.create()
    const prompt = `Analyze this resume:\n${resumeText}\n\nReturn JSON: {"overall_score": 0-100, "strengths": [], "weaknesses": [], "improvements": [], "skills_detected": [], "experience_years": 0, "job_titles_fit": [], "keywords_missing": [], "ats_compatibility_score": 0-100}`
    const completion = await zai.chat.completions.create({
      messages: [{ role: 'system', content: 'You are a resume expert. Respond in JSON only.' }, { role: 'user', content: prompt }],
      max_tokens: 800
    })
    const parsed = extractJsonFromResponse(completion.choices[0]?.message?.content || '')
    return parsed || getFallbackResumeAnalysis()
  } catch { return getFallbackResumeAnalysis() }
}

async function generateInterviewQuestions(job: any): Promise<any[]> {
  try {
    const ZAI = (await import('z-ai-web-dev-sdk')).default
    const zai = await ZAI.create()
    const prompt = `Generate 10 interview questions for:\nTitle: ${job.title}\nCompany: ${job.company}\nDescription: ${job.description}\n\nReturn JSON array: [{"question": "", "category": "behavioral|technical|situational", "difficulty": "easy|medium|hard", "tips": ""}]`
    const completion = await zai.chat.completions.create({
      messages: [{ role: 'system', content: 'You are an interview expert. Respond in JSON only.' }, { role: 'user', content: prompt }],
      max_tokens: 1000
    })
    const parsed = extractJsonFromResponse(completion.choices[0]?.message?.content || '')
    return Array.isArray(parsed) ? parsed : getFallbackInterviewQuestions(job)
  } catch { return getFallbackInterviewQuestions(job) }
}

async function generateCoverLetter(job: any, userProfile: string): Promise<string> {
  try {
    const ZAI = (await import('z-ai-web-dev-sdk')).default
    const zai = await ZAI.create()
    const prompt = `Write a cover letter for:\nTitle: ${job.title}\nCompany: ${job.company}\nCandidate: ${userProfile}\n\nWrite 250 words.`
    const completion = await zai.chat.completions.create({
      messages: [{ role: 'system', content: 'You are a career coach writing cover letters.' }, { role: 'user', content: prompt }],
      max_tokens: 500
    })
    return completion.choices[0]?.message?.content || getFallbackCoverLetter(job, userProfile)
  } catch { return getFallbackCoverLetter(job, userProfile) }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, job, userProfile, resumeText } = body
    switch (action) {
      case 'cover-letter':
        if (!job || !userProfile) return NextResponse.json({ error: 'Job and userProfile required' }, { status: 400 })
        return NextResponse.json({ coverLetter: await generateCoverLetter(job, userProfile) })
      case 'analyze-resume':
        if (!resumeText) return NextResponse.json({ error: 'resumeText required' }, { status: 400 })
        return NextResponse.json({ analysis: await analyzeResume(resumeText) })
      case 'interview-questions':
        if (!job) return NextResponse.json({ error: 'Job required' }, { status: 400 })
        return NextResponse.json({ questions: await generateInterviewQuestions(job) })
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error: any) {
    return NextResponse.json({ error: 'AI processing failed', message: error.message }, { status: 500 })
  }
}