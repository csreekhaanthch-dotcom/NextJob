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

async function analyzeResume(resumeText: string): Promise<{ analysis: any; aiUsed: boolean; error?: string }> {
  try {
    console.log('=== Starting Resume Analysis ===')
    
    // Dynamic import to see if SDK is available
    let ZAI
    try {
      ZAI = (await import('z-ai-web-dev-sdk')).default
      console.log('✅ z-ai-web-dev-sdk imported successfully')
    } catch (importError: any) {
      console.error('❌ Failed to import z-ai-web-dev-sdk:', importError.message)
      return { analysis: getFallbackResumeAnalysis(), aiUsed: false, error: 'SDK not installed: ' + importError.message }
    }
    
    console.log('Creating ZAI instance...')
    const zai = await ZAI.create()
    console.log('✅ ZAI instance created')
    
    const prompt = `Analyze this resume and provide detailed feedback:

RESUME:
 ${resumeText}

Provide analysis in the following JSON format:
{
  "overall_score": <number 0-100 based on resume quality>,
  "strengths": ["actual strengths found in resume"],
  "weaknesses": ["actual weaknesses found"],
  "improvements": ["specific improvements for this resume"],
  "skills_detected": ["skills actually mentioned in the resume"],
  "experience_years": <estimated years from resume>,
  "job_titles_fit": ["job titles that fit this person's experience"],
  "keywords_missing": ["important keywords missing from this resume"],
  "ats_compatibility_score": <number 0-100>
}

IMPORTANT: Respond ONLY with valid JSON, no markdown formatting. Analyze the actual content of the resume.`

    console.log('Calling AI API...')
    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are an expert resume reviewer. Analyze resumes and provide personalized feedback. Always respond in valid JSON format only.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 800
    })
    
    const content = completion.choices[0]?.message?.content || ''
    console.log('AI Response received, length:', content.length)
    console.log('AI Response preview:', content.substring(0, 200))
    
    const parsed = extractJsonFromResponse(content)
    
    if (parsed) {
      console.log('✅ Successfully parsed AI response')
      return { analysis: parsed, aiUsed: true }
    } else {
      console.log('❌ Failed to parse AI response')
      return { analysis: getFallbackResumeAnalysis(), aiUsed: false, error: 'Failed to parse AI response' }
    }
  } catch (error: any) {
    console.error('❌ Resume analysis error:', error)
    return { analysis: getFallbackResumeAnalysis(), aiUsed: false, error: error.message }
  }
}

async function generateInterviewQuestions(job: any): Promise<{ questions: any[]; aiUsed: boolean; error?: string }> {
  try {
    console.log('=== Starting Interview Questions Generation ===')
    
    let ZAI
    try {
      ZAI = (await import('z-ai-web-dev-sdk')).default
      console.log('✅ z-ai-web-dev-sdk imported successfully')
    } catch (importError: any) {
      console.error('❌ Failed to import z-ai-web-dev-sdk:', importError.message)
      return { questions: getFallbackInterviewQuestions(job), aiUsed: false, error: 'SDK not installed: ' + importError.message }
    }
    
    const zai = await ZAI.create()
    console.log('✅ ZAI instance created')
    
    const prompt = `Generate interview questions for this specific job:

JOB TITLE: ${job.title}
COMPANY: ${job.company}
JOB DESCRIPTION: ${job.description}

Generate 10 interview questions tailored to this specific job. Include technical questions related to the job requirements.

Return JSON array:
[
  {
    "question": "specific question for this job",
    "category": "technical|behavioral|situational",
    "difficulty": "easy|medium|hard",
    "tips": "specific tips for this question"
  }
]

IMPORTANT: Respond ONLY with valid JSON array. Make questions specific to the job description.`

    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are an interview preparation expert. Generate relevant, job-specific questions. Always respond in valid JSON format only.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 1000
    })
    
    const content = completion.choices[0]?.message?.content || ''
    console.log('AI Response received')
    
    const parsed = extractJsonFromResponse(content)
    
    if (Array.isArray(parsed)) {
      console.log('✅ Successfully parsed interview questions')
      return { questions: parsed, aiUsed: true }
    } else {
      return { questions: getFallbackInterviewQuestions(job), aiUsed: false, error: 'Failed to parse AI response' }
    }
  } catch (error: any) {
    console.error('❌ Interview questions error:', error)
    return { questions: getFallbackInterviewQuestions(job), aiUsed: false, error: error.message }
  }
}

async function generateCoverLetter(job: any, userProfile: string): Promise<{ coverLetter: string; aiUsed: boolean; error?: string }> {
  try {
    console.log('=== Starting Cover Letter Generation ===')
    
    let ZAI
    try {
      ZAI = (await import('z-ai-web-dev-sdk')).default
      console.log('✅ z-ai-web-dev-sdk imported successfully')
    } catch (importError: any) {
      console.error('❌ Failed to import z-ai-web-dev-sdk:', importError.message)
      return { coverLetter: getFallbackCoverLetter(job, userProfile), aiUsed: false, error: 'SDK not installed: ' + importError.message }
    }
    
    const zai = await ZAI.create()
    
    const prompt = `Write a personalized cover letter for:

JOB TITLE: ${job.title}
COMPANY: ${job.company}
JOB DESCRIPTION: ${job.description}

CANDIDATE PROFILE:
 ${userProfile}

Write a professional cover letter that highlights the candidate's relevant experience for this specific job. Make it personal and tailored to both the candidate and the job. About 250 words.`

    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are an expert career coach. Write compelling, personalized cover letters.' },
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
    console.error('❌ Cover letter error:', error)
    return { coverLetter: getFallbackCoverLetter(job, userProfile), aiUsed: false, error: error.message }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, job, userProfile, resumeText } = body
    
    switch (action) {
      case 'cover-letter': {
        if (!job || !userProfile) {
          return NextResponse.json({ error: 'Job and userProfile required' }, { status: 400 })
        }
        const result = await generateCoverLetter(job, userProfile)
        return NextResponse.json({ 
          coverLetter: result.coverLetter,
          aiUsed: result.aiUsed,
          error: result.error 
        })
      }
      
      case 'analyze-resume': {
        if (!resumeText) {
          return NextResponse.json({ error: 'resumeText required' }, { status: 400 })
        }
        const result = await analyzeResume(resumeText)
        return NextResponse.json({ 
          analysis: result.analysis,
          aiUsed: result.aiUsed,
          error: result.error 
        })
      }
      
      case 'interview-questions': {
        if (!job) {
          return NextResponse.json({ error: 'Job required' }, { status: 400 })
        }
        const result = await generateInterviewQuestions(job)
        return NextResponse.json({ 
          questions: result.questions,
          aiUsed: result.aiUsed,
          error: result.error 
        })
      }
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error: any) {
    console.error('❌ API Error:', error)
    return NextResponse.json({ error: 'AI processing failed', message: error.message }, { status: 500 })
  }
}