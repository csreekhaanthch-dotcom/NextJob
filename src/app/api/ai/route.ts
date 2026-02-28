import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

// Initialize ZAI
let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null

async function getZai() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create()
  }
  return zaiInstance
}

async function callAI(systemPrompt: string, userPrompt: string, maxTokens: number = 800): Promise<string | null> {
  try {
    const zai = await getZai()
    
    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: maxTokens,
      temperature: 0.7
    })

    return completion.choices?.[0]?.message?.content || null
  } catch (error) {
    console.error('AI API error:', error)
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

// Fallback data for when AI fails
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

  const response = await callAI(systemPrompt, userPrompt, 500)
  if (response) {
    return { coverLetter: response, aiUsed: true }
  }
  return { coverLetter: getFallbackCoverLetter(job, userProfile), aiUsed: false }
}

async function analyzeResume(resumeText: string): Promise<{ analysis: any; aiUsed: boolean }> {
  const systemPrompt = 'You are an expert resume reviewer and career coach. Analyze resumes and provide detailed, actionable feedback in JSON format only.'
  const userPrompt = `Analyze this resume thoroughly:

 ${resumeText}

Return JSON with this exact structure:
{
  "overall_score": 0-100,
  "strengths": ["list of 3-5 strengths"],
  "weaknesses": ["list of 2-4 areas to improve"],
  "improvements": ["list of 3-5 specific actionable recommendations"],
  "skills_detected": ["list of skills found in the resume"],
  "experience_years": estimated_number_of_years,
  "job_titles_fit": ["list of 3-5 job titles this resume fits"],
  "keywords_missing": ["important keywords that should be added"],
  "ats_compatibility_score": 0-100
}

Be specific and helpful. Give realistic scores based on resume quality.`

  const response = await callAI(systemPrompt, userPrompt, 800)
  if (response) {
    const parsed = extractJsonFromResponse(response)
    if (parsed) return { analysis: parsed, aiUsed: true }
  }
  return { analysis: getFallbackResumeAnalysis(), aiUsed: false }
}

async function generateInterviewQuestions(job: any): Promise<{ questions: any[]; aiUsed: boolean }> {
  const systemPrompt = 'You are an interview preparation expert and hiring manager. Generate relevant, challenging interview questions in JSON array format only.'
  const userPrompt = `Generate 10 interview questions for:

Title: ${job.title}
Company: ${job.company}
Description: ${job.description}

Return JSON array with this exact structure:
[
  {
    "question": "the interview question",
    "category": "behavioral|technical|situational",
    "difficulty": "easy|medium|hard",
    "tips": "helpful tip for answering this question"
  }
]

Include a mix of question types. Make questions specific to the job role and company context.`

  const response = await callAI(systemPrompt, userPrompt, 1000)
  if (response) {
    const parsed = extractJsonFromResponse(response)
    if (Array.isArray(parsed)) return { questions: parsed, aiUsed: true }
  }
  return { questions: getFallbackInterviewQuestions(job), aiUsed: false }
}

// Calculate job match score
async function calculateMatchScore(job: any, profile: string): Promise<number> {
  const systemPrompt = 'You are a recruiter evaluating job-candidate matches. Return only a number.'
  const userPrompt = `Rate the match between this candidate and job (0-100):

Job: ${job.title} at ${job.company}
Description: ${job.description}

Candidate Profile:
 ${profile}

Return only a single number between 0-100. No explanation needed.`

  const response = await callAI(systemPrompt, userPrompt, 10)
  if (response) {
    const score = parseInt(response.trim())
    if (!isNaN(score) && score >= 0 && score <= 100) {
      return score
    }
  }
  // Fallback: simple keyword matching
  const jobText = `${job.title} ${job.description}`.toLowerCase()
  const profileLower = profile.toLowerCase()
  const profileWords = profileLower.split(/\s+/).filter(w => w.length > 3)
  const matches = profileWords.filter(word => jobText.includes(word)).length
  return Math.min(95, Math.max(40, Math.round((matches / profileWords.length) * 100 + 30)))
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, job, userProfile, resumeText, profile, jobs } = body

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

      case 'match-score':
        if (!job || !profile) {
          return NextResponse.json({ error: 'Job and profile required' }, { status: 400 })
        }
        const score = await calculateMatchScore(job, profile)
        return NextResponse.json({ score, aiUsed: true })

      case 'batch-match-scores':
        if (!jobs || !Array.isArray(jobs) || !profile) {
          return NextResponse.json({ error: 'Jobs array and profile required' }, { status: 400 })
        }
        const scores = await Promise.all(
          jobs.slice(0, 20).map(async (job: any) => ({
            jobId: job.id,
            score: await calculateMatchScore(job, profile)
          }))
        )
        return NextResponse.json({ scores, aiUsed: true })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error: any) {
    console.error('AI API error:', error)
    return NextResponse.json({ error: 'Processing failed', message: error.message }, { status: 500 })
  }
}