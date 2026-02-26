import { NextRequest, NextResponse } from 'next/server'

// OpenAI API configuration (free tier available)
const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'

async function callOpenAI(systemPrompt: string, userPrompt: string, maxTokens: number = 800): Promise<string | null> {
  if (!OPENAI_API_KEY) {
    console.log('OpenAI: No API key configured, using fallback')
    return null
  }

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: maxTokens,
        temperature: 0.7
      })
    })

    if (!response.ok) {
      console.error('OpenAI API error:', response.status)
      return null
    }

    const data = await response.json()
    return data.choices?.[0]?.message?.content || null
  } catch (error) {
    console.error('OpenAI fetch error:', error)
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
  const arrayMatch = content.match(/\[[\s\S]*\]/)
  if (arrayMatch) { try { return JSON.parse(arrayMatch[0]) } catch {} }
  return null
}

// Fallback data
function getFallbackResumeAnalysis(): any {
  return {
    overall_score: 72,
    strengths: ['Clear professional summary', 'Relevant technical skills listed', 'Good work history'],
    weaknesses: ['Could use more quantifiable achievements', 'Skills section could be more prominent'],
    improvements: ['Add specific metrics and numbers', 'Include a compelling summary', 'Tailor keywords to job descriptions'],
    skills_detected: ['Communication', 'Problem Solving', 'Team Collaboration'],
    experience_years: 5,
    job_titles_fit: ['Software Developer', 'Project Coordinator', 'Technical Specialist'],
    keywords_missing: ['Leadership', 'Agile/Scrum', 'Cloud Technologies'],
    ats_compatibility_score: 78
  }
}

function getFallbackInterviewQuestions(job: any): any[] {
  const title = job?.title || 'this position'
  const company = job?.company || 'our company'
  return [
    { question: `Tell me about your experience related to ${title}.`, category: 'behavioral', difficulty: 'easy', tips: 'Use the STAR method - Situation, Task, Action, Result.' },
    { question: 'Walk me through a challenging project and how you overcame obstacles.', category: 'behavioral', difficulty: 'medium', tips: 'Highlight your problem-solving approach and positive outcome.' },
    { question: `Why are you interested in working at ${company}?`, category: 'behavioral', difficulty: 'easy', tips: 'Research the company and mention specific values or products.' },
    { question: 'Describe a time you learned something new quickly.', category: 'behavioral', difficulty: 'medium', tips: 'Show your adaptability and successful outcome.' },
    { question: 'How do you handle tight deadlines and conflicting priorities?', category: 'situational', difficulty: 'medium', tips: 'Discuss your prioritization and organization methods.' },
    { question: 'Tell me about a disagreement with a colleague and how you resolved it.', category: 'behavioral', difficulty: 'medium', tips: 'Focus on collaboration and finding win-win solutions.' },
    { question: `What is your greatest strength for this ${title} position?`, category: 'behavioral', difficulty: 'easy', tips: 'Choose a relevant strength with a specific example.' },
    { question: 'Where do you see yourself in 5 years?', category: 'behavioral', difficulty: 'easy', tips: 'Show ambition while being realistic.' },
    { question: 'Describe working with a difficult team member.', category: 'behavioral', difficulty: 'hard', tips: 'Stay professional and focus on actions you took.' },
    { question: 'What questions do you have for us?', category: 'behavioral', difficulty: 'easy', tips: 'Always have thoughtful questions prepared.' }
  ]
}

function getFallbackCoverLetter(job: any, userProfile: string): string {
  const title = job?.title || 'the position'
  const company = job?.company || 'your company'
  return `Dear Hiring Manager,

I am writing to express my strong interest in the ${title} position at ${company}. With my background and experience, I am confident I would be a valuable addition to your team.

Throughout my career, I have developed strong skills in problem-solving, communication, and collaboration. I thrive in dynamic environments and am passionate about delivering high-quality results.

I am particularly drawn to ${company} because of its reputation for innovation and commitment to excellence. I believe my skills and enthusiasm would enable me to contribute meaningfully to your team's goals.

I would welcome the opportunity to discuss how my background aligns with your needs. Thank you for considering my application.

Sincerely,
[Your Name]`
}

// AI Functions
async function generateCoverLetter(job: any, userProfile: string): Promise<{ coverLetter: string; aiUsed: boolean }> {
  const systemPrompt = 'You are an expert career coach and professional writer. Write compelling, personalized cover letters.'
  const userPrompt = `Write a professional cover letter for:
  
Job Title: ${job.title}
Company: ${job.company}
Description: ${job.description}

Candidate Profile:
${userProfile}

Write about 250 words. Personal and professional tone.`

  const response = await callOpenAI(systemPrompt, userPrompt, 500)
  if (response) {
    return { coverLetter: response, aiUsed: true }
  }
  return { coverLetter: getFallbackCoverLetter(job, userProfile), aiUsed: false }
}

async function analyzeResume(resumeText: string): Promise<{ analysis: any; aiUsed: boolean }> {
  const systemPrompt = 'You are an expert resume reviewer. Analyze resumes and provide feedback in JSON format only.'
  const userPrompt = `Analyze this resume:

${resumeText}

Return JSON:
{
  "overall_score": 0-100,
  "strengths": [],
  "weaknesses": [],
  "improvements": [],
  "skills_detected": [],
  "experience_years": 0,
  "job_titles_fit": [],
  "keywords_missing": [],
  "ats_compatibility_score": 0-100
}`

  const response = await callOpenAI(systemPrompt, userPrompt, 800)
  if (response) {
    const parsed = extractJsonFromResponse(response)
    if (parsed) return { analysis: parsed, aiUsed: true }
  }
  return { analysis: getFallbackResumeAnalysis(), aiUsed: false }
}

async function generateInterviewQuestions(job: any): Promise<{ questions: any[]; aiUsed: boolean }> {
  const systemPrompt = 'You are an interview preparation expert. Generate questions in JSON array format only.'
  const userPrompt = `Generate 10 interview questions for:

Title: ${job.title}
Company: ${job.company}
Description: ${job.description}

Return JSON array:
[{"question": "", "category": "behavioral|technical|situational", "difficulty": "easy|medium|hard", "tips": ""}]`

  const response = await callOpenAI(systemPrompt, userPrompt, 1000)
  if (response) {
    const parsed = extractJsonFromResponse(response)
    if (Array.isArray(parsed)) return { questions: parsed, aiUsed: true }
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
        const letterResult = await generateCoverLetter(job, userProfile)
        return NextResponse.json(letterResult)

      case 'analyze-resume':
        if (!resumeText) {
          return NextResponse.json({ error: 'resumeText required' }, { status: 400 })
        }
        const resumeResult = await analyzeResume(resumeText)
        return NextResponse.json(resumeResult)

      case 'interview-questions':
        if (!job) {
          return NextResponse.json({ error: 'Job required' }, { status: 400 })
        }
        const questionsResult = await generateInterviewQuestions(job)
        return NextResponse.json(questionsResult)

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error: any) {
    console.error('AI API error:', error)
    return NextResponse.json({ error: 'Processing failed', message: error.message }, { status: 500 })
  }
}
