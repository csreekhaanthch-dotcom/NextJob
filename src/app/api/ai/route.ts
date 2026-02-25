import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

// AI Cover Letter Generator
async function generateCoverLetter(job: any, userProfile: string): Promise<string> {
  const zai = await ZAI.create()
  
  const prompt = `Write a professional, personalized cover letter for the following job application:

JOB DETAILS:
- Title: ${job.title}
- Company: ${job.company}
- Description: ${job.description}
- Location: ${job.location}
- Type: ${job.job_type}

CANDIDATE PROFILE:
 ${userProfile}

Write a compelling cover letter that:
1. Opens with a strong hook showing enthusiasm for the role
2. Highlights relevant skills and experience from the candidate's profile
3. Shows knowledge of the company and role
4. Demonstrates value the candidate can bring
5. Closes with a call to action

Keep it professional, concise (around 300 words), and tailored to this specific role.`

  const completion = await zai.chat.completions.create({
    messages: [
      { 
        role: 'system', 
        content: 'You are an expert career coach and professional writer. Write compelling, personalized cover letters that help candidates stand out.' 
      },
      { role: 'user', content: prompt }
    ],
    max_tokens: 500
  })
  
  return completion.choices[0]?.message?.content || ''
}

// Helper function to extract JSON from AI response
function extractJsonFromResponse(content: string): any {
  if (!content) return null
  
  // Try to parse directly first
  try {
    return JSON.parse(content)
  } catch {
    // Continue to other methods
  }
  
  // Try to extract JSON from markdown code blocks
  const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[1].trim())
    } catch {
      // Continue
    }
  }
  
  // Try to find JSON object or array in the content
  const objectMatch = content.match(/\{[\s\S]*\}/)
  const arrayMatch = content.match(/\[[\s\S]*\]/)
  
  if (objectMatch) {
    try {
      return JSON.parse(objectMatch[0])
    } catch {
      // Continue
    }
  }
  
  if (arrayMatch) {
    try {
      return JSON.parse(arrayMatch[0])
    } catch {
      // Continue
    }
  }
  
  return null
}

// AI Resume Analyzer
async function analyzeResume(resumeText: string): Promise<any> {
  const zai = await ZAI.create()
  
  const prompt = `Analyze this resume and provide detailed feedback:

RESUME:
 ${resumeText}

Provide analysis in the following JSON format:
{
  "overall_score": <number 0-100>,
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2"],
  "improvements": ["improvement1", "improvement2", "improvement3"],
  "skills_detected": ["skill1", "skill2", "skill3"],
  "experience_years": <estimated number>,
  "job_titles_fit": ["title1", "title2", "title3"],
  "keywords_missing": ["keyword1", "keyword2"],
  "ats_compatibility_score": <number 0-100>
}

IMPORTANT: Respond ONLY with valid JSON, no markdown formatting or explanations.`

  const completion = await zai.chat.completions.create({
    messages: [
      { 
        role: 'system', 
        content: 'You are an expert resume reviewer and career coach. Provide detailed, actionable feedback to help candidates improve their resumes. Always respond in valid JSON format only, no markdown code blocks.' 
      },
      { role: 'user', content: prompt }
    ],
    max_tokens: 800
  })
  
  const content = completion.choices[0]?.message?.content || ''
  const parsed = extractJsonFromResponse(content)
  
  if (parsed) {
    return parsed
  }
  
  // Return a default analysis if parsing fails
  return {
    overall_score: 65,
    strengths: ['Clear work history', 'Relevant experience'],
    weaknesses: ['Could use more quantifiable achievements', 'Skills section could be more prominent'],
    improvements: ['Add metrics to demonstrate impact', 'Include a professional summary', 'Highlight key technologies more clearly'],
    skills_detected: ['Communication', 'Problem Solving'],
    experience_years: 3,
    job_titles_fit: ['Professional', 'Specialist'],
    keywords_missing: ['Leadership', 'Project Management'],
    ats_compatibility_score: 70
  }
}

// AI Job Match Explainer
async function explainJobMatch(job: any, userProfile: string): Promise<any> {
  const zai = await ZAI.create()
  
  const prompt = `Analyze how well this candidate matches the job:

JOB:
- Title: ${job.title}
- Company: ${job.company}
- Description: ${job.description}
- Tags: ${job.tags?.join(', ')}

CANDIDATE PROFILE:
 ${userProfile}

Provide analysis in JSON format:
{
  "match_score": <number 0-100>,
  "matched_skills": ["skill1", "skill2"],
  "missing_skills": ["skill1", "skill2"],
  "strengths": ["strength1", "strength2"],
  "gaps": ["gap1", "gap2"],
  "recommendations": ["rec1", "rec2"],
  "interview_prep_tips": ["tip1", "tip2"]
}

IMPORTANT: Respond ONLY with valid JSON, no markdown formatting or explanations.`

  const completion = await zai.chat.completions.create({
    messages: [
      { 
        role: 'system', 
        content: 'You are a career matching expert. Provide detailed analysis of how well candidates match jobs. Always respond in valid JSON format only.' 
      },
      { role: 'user', content: prompt }
    ],
    max_tokens: 600
  })
  
  const content = completion.choices[0]?.message?.content || ''
  const parsed = extractJsonFromResponse(content)
  
  if (parsed) {
    return parsed
  }
  
  // Return default if parsing fails
  return {
    match_score: 50,
    matched_skills: ['Communication'],
    missing_skills: ['Technical skills'],
    strengths: ['Relevant background'],
    gaps: ['Specific experience'],
    recommendations: ['Highlight relevant projects'],
    interview_prep_tips: ['Research the company']
  }
}

// AI Interview Questions Generator
async function generateInterviewQuestions(job: any): Promise<any[]> {
  const zai = await ZAI.create()
  
  const prompt = `Generate interview questions for this job:

JOB:
- Title: ${job.title}
- Company: ${job.company}
- Description: ${job.description}
- Tags: ${job.tags?.join(', ')}

Generate 10 interview questions in JSON format:
[
  {
    "question": "the question text",
    "category": "technical|behavioral|situational|coding",
    "difficulty": "easy|medium|hard",
    "tips": "tips for answering"
  }
]

IMPORTANT: Respond ONLY with valid JSON array, no markdown formatting or explanations.`

  const completion = await zai.chat.completions.create({
    messages: [
      { 
        role: 'system', 
        content: 'You are an interview preparation expert. Generate realistic interview questions that candidates might face. Always respond in valid JSON format only.' 
      },
      { role: 'user', content: prompt }
    ],
    max_tokens: 1000
  })
  
  const content = completion.choices[0]?.message?.content || ''
  const parsed = extractJsonFromResponse(content)
  
  if (Array.isArray(parsed)) {
    return parsed
  }
  
  // Return default questions if parsing fails
  return [
    {
      question: `Tell me about your experience relevant to ${job.title}`,
      category: 'behavioral',
      difficulty: 'easy',
      tips: 'Focus on specific achievements and quantify your impact'
    },
    {
      question: 'Walk me through a challenging project you worked on',
      category: 'behavioral',
      difficulty: 'medium',
      tips: 'Use the STAR method: Situation, Task, Action, Result'
    },
    {
      question: `What interests you about the ${job.title} role at ${job.company}?`,
      category: 'behavioral',
      difficulty: 'easy',
      tips: 'Research the company and connect your goals with theirs'
    },
    {
      question: 'Describe a time you had to learn something new quickly',
      category: 'behavioral',
      difficulty: 'medium',
      tips: 'Highlight your adaptability and learning process'
    },
    {
      question: 'How do you handle conflicting priorities and deadlines?',
      category: 'situational',
      difficulty: 'medium',
      tips: 'Discuss your organization methods and communication skills'
    }
  ]
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
        const coverLetter = await generateCoverLetter(job, userProfile)
        return NextResponse.json({ coverLetter })
      
      case 'analyze-resume':
        if (!resumeText) {
          return NextResponse.json({ error: 'resumeText required' }, { status: 400 })
        }
        const analysis = await analyzeResume(resumeText)
        return NextResponse.json({ analysis })
      
      case 'explain-match':
        if (!job || !userProfile) {
          return NextResponse.json({ error: 'Job and userProfile required' }, { status: 400 })
        }
        const matchAnalysis = await explainJobMatch(job, userProfile)
        return NextResponse.json({ matchAnalysis })
      
      case 'interview-questions':
        if (!job) {
          return NextResponse.json({ error: 'Job required' }, { status: 400 })
        }
        const questions = await generateInterviewQuestions(job)
        return NextResponse.json({ questions })
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error: any) {
    console.error('AI API error:', error)
    return NextResponse.json(
      { error: 'AI processing failed', message: error.message },
      { status: 500 }
    )
  }
}