import { NextRequest, NextResponse } from 'next/server'

// OpenAI API configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'

async function callOpenAI(systemPrompt: string, userPrompt: string, maxTokens: number = 800): Promise<string | null> {
  if (!OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY not found in environment')
    return null
  }

  try {
    console.log('🔵 Calling OpenAI API...')
    
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
      const errorData = await response.json().catch(() => ({}))
      console.error('❌ OpenAI API error:', response.status, errorData)
      return null
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || null
    console.log('✅ OpenAI response received')
    return content
  } catch (error: any) {
    console.error('❌ OpenAI fetch error:', error.message)
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
  const systemPrompt = 'You are an expert resume reviewer with 15+ years of HR experience. Analyze resumes and provide personalized, specific feedback. Always respond in valid JSON format only.'
  
  const userPrompt = `Analyze this resume thoroughly and provide detailed, personalized feedback:

RESUME CONTENT:
 ${resumeText}

Provide your analysis in this exact JSON format:
{
  "overall_score": <number 0-100 based on resume quality>,
  "strengths": ["specific strengths you found in this resume", "another strength"],
  "weaknesses": ["specific weaknesses you identified", "another weakness"],
  "improvements": ["specific actionable improvements for this resume", "another improvement"],
  "skills_detected": ["actual skills mentioned or implied in the resume", "more skills"],
  "experience_years": <estimated total years of experience from the resume>,
  "job_titles_fit": ["job titles that would fit this candidate based on their experience"],
  "keywords_missing": ["important industry keywords missing from this resume"],
  "ats_compatibility_score": <number 0-100>
}

IMPORTANT: 
- Be specific to THIS resume, not generic advice
- Respond ONLY with valid JSON, no other text
- Extract actual skills from the resume content`

  try {
    const response = await callOpenAI(systemPrompt, userPrompt, 800)
    
    if (response) {
      const parsed = extractJsonFromResponse(response)
      if (parsed) {
        return { analysis: parsed, aiUsed: true }
      }
    }
    
    return { analysis: getFallbackResumeAnalysis(), aiUsed: false, error: 'Failed to parse AI response' }
  } catch (error: any) {
    return { analysis: getFallbackResumeAnalysis(), aiUsed: false, error: error.message }
  }
}

async function generateInterviewQuestions(job: any): Promise<{ questions: any[]; aiUsed: boolean; error?: string }> {
  const systemPrompt = 'You are an expert interview coach. Generate relevant, job-specific interview questions. Always respond in valid JSON array format only.'
  
  const userPrompt = `Generate 10 interview questions tailored for this specific job:

JOB TITLE: ${job.title}
COMPANY: ${job.company}
JOB DESCRIPTION: ${job.description}

Generate questions in this exact JSON array format:
[
  {
    "question": "specific question relevant to this job",
    "category": "technical|behavioral|situational",
    "difficulty": "easy|medium|hard",
    "tips": "specific tips for answering this question"
  }
]

IMPORTANT:
- Include technical questions related to the job requirements
- Make questions specific to this role and company
- Respond ONLY with valid JSON array, no other text`

  try {
    const response = await callOpenAI(systemPrompt, userPrompt, 1000)
    
    if (response) {
      const parsed = extractJsonFromResponse(response)
      if (Array.isArray(parsed)) {
        return { questions: parsed, aiUsed: true }
      }
    }
    
    return { questions: getFallbackInterviewQuestions(job), aiUsed: false, error: 'Failed to parse AI response' }
  } catch (error: any) {
    return { questions: getFallbackInterviewQuestions(job), aiUsed: false, error: error.message }
  }
}

async function generateCoverLetter(job: any, userProfile: string): Promise<{ coverLetter: string; aiUsed: boolean; error?: string }> {
  const systemPrompt = 'You are an expert career coach and professional writer. Write compelling, personalized cover letters that highlight relevant experience.'
  
  const userPrompt = `Write a professional cover letter for this job application:

JOB DETAILS:
- Title: ${job.title}
- Company: ${job.company}
- Description: ${job.description}

CANDIDATE PROFILE:
 ${userProfile}

Write a personalized cover letter that:
1. Highlights relevant experience from the candidate profile
2. Connects the candidate's skills to the job requirements
3. Shows enthusiasm for this specific company and role
4. Is professional and concise (about 250-300 words)

Do not include placeholders - write as if ready to send.`

  try {
    const response = await callOpenAI(systemPrompt, userPrompt, 500)
    
    if (response) {
      return { coverLetter: response, aiUsed: true }
    }
    
    return { coverLetter: getFallbackCoverLetter(job, userProfile), aiUsed: false, error: 'No response from AI' }
  } catch (error: any) {
    return { coverLetter: getFallbackCoverLetter(job, userProfile), aiUsed: false, error: error.message }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, job, userProfile, resumeText } = body
    
    console.log(`📥 API Request: ${action}`)
    
    switch (action) {
      case 'cover-letter': {
        if (!job || !userProfile) {
          return NextResponse.json({ error: 'Job and userProfile required' }, { status: 400 })
        }
        const result = await generateCoverLetter(job, userProfile)
        return NextResponse.json(result)
      }
      
      case 'analyze-resume': {
        if (!resumeText) {
          return NextResponse.json({ error: 'resumeText required' }, { status: 400 })
        }
        const result = await analyzeResume(resumeText)
        return NextResponse.json(result)
      }
      
      case 'interview-questions': {
        if (!job) {
          return NextResponse.json({ error: 'Job required' }, { status: 400 })
        }
        const result = await generateInterviewQuestions(job)
        return NextResponse.json(result)
      }
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error: any) {
    console.error('❌ API Error:', error)
    return NextResponse.json({ error: 'Processing failed', message: error.message }, { status: 500 })
  }
}