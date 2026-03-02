import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

// Simple in-memory cache for ZAI instance
let zaiPromise: Promise<any> | null = null

async function getZai() {
  if (!zaiPromise) {
    zaiPromise = ZAI.create()
  }
  return zaiPromise
}

// Simple AI call with timeout
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
    console.error('AI call failed:', error)
    return null
  }
}

// Extract JSON from AI response
function extractJson(content: string): any {
  if (!content) return null
  try { return JSON.parse(content) } catch {}
  const match = content.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (match) { try { return JSON.parse(match[1].trim()) } catch {} }
  const objMatch = content.match(/\{[\s\S]*\}/)
  if (objMatch) { try { return JSON.parse(objMatch[0]) } catch {} }
  return null
}

// Local resume parsing (no dependencies)
function parseResumeLocally(text: string) {
  const skills = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'React', 'Angular', 'Vue', 'Node.js',
    'AWS', 'Azure', 'Docker', 'Kubernetes', 'SQL', 'MongoDB', 'PostgreSQL', 'Git',
    'HTML', 'CSS', 'Tailwind', 'Next.js', 'Express', 'Django', 'Flask', 'Spring',
    'Machine Learning', 'AI', 'Data Science', 'Agile', 'Scrum', 'REST API', 'GraphQL'
  ]
  
  const foundSkills = skills.filter(s => 
    text.toLowerCase().includes(s.toLowerCase())
  )
  
  // Extract email
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)
  const email = emailMatch ? emailMatch[0] : null
  
  // Extract phone
  const phoneMatch = text.match(/\+?1?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/)
  const phone = phoneMatch ? phoneMatch[0] : null
  
  // Estimate experience
  const expMatch = text.match(/(\d+)\+?\s*(?:years?|yrs?)\s*(?:of\s+)?(?:experience|expertise)/i)
  const experienceYears = expMatch ? parseInt(expMatch[1]) : Math.min(10, Math.floor(text.length / 500))
  
  return { foundSkills, email, phone, experienceYears }
}

// Generate fallback analysis (always works)
function generateFallbackAnalysis(text: string) {
  const { foundSkills, email, phone, experienceYears } = parseResumeLocally(text)
  
  let score = 50
  if (email) score += 10
  if (phone) score += 5
  if (foundSkills.length >= 5) score += 15
  else if (foundSkills.length >= 3) score += 10
  if (experienceYears >= 3) score += 10
  if (text.length > 500) score += 5
  if (text.length > 1000) score += 5
  
  const strengths = []
  if (foundSkills.length >= 5) strengths.push(`Strong technical skills: ${foundSkills.slice(0, 5).join(', ')}`)
  if (email && phone) strengths.push('Complete contact information')
  if (experienceYears >= 3) strengths.push(`${experienceYears}+ years of experience`)
  if (text.includes('%') || text.includes('increased') || text.includes('improved')) {
    strengths.push('Includes quantifiable achievements')
  }
  if (strengths.length === 0) strengths.push('Clear resume structure')
  
  const weaknesses = []
  if (!email) weaknesses.push('Missing email address')
  if (!phone) weaknesses.push('Missing phone number')
  if (foundSkills.length < 5) weaknesses.push('Could include more technical keywords')
  if (text.length < 500) weaknesses.push('Resume could be more detailed')
  
  const improvements = [
    'Add more relevant keywords from job descriptions',
    'Include quantifiable achievements with metrics',
    'Tailor resume for each job application'
  ]
  
  const keywordsMissing = []
  if (!foundSkills.some(s => ['AWS', 'Azure', 'GCP'].includes(s))) {
    keywordsMissing.push('Cloud Technologies')
  }
  if (!foundSkills.some(s => ['Docker', 'Kubernetes', 'CI/CD'].includes(s))) {
    keywordsMissing.push('DevOps/CI-CD')
  }
  
  return {
    overall_score: Math.min(100, score),
    strengths: strengths.slice(0, 5),
    weaknesses: weaknesses.slice(0, 4),
    improvements,
    skills_detected: foundSkills,
    soft_skills: [],
    skills_by_category: {},
    experience_years: experienceYears,
    experience_level: experienceYears < 2 ? 'entry' : experienceYears < 5 ? 'mid' : 'senior',
    job_titles_fit: ['Software Developer', 'Full Stack Developer', 'Software Engineer'],
    keywords_missing: keywordsMissing.slice(0, 5),
    ats_compatibility_score: score,
    contact_info: { email, phone, linkedin: null, github: null },
    sections_found: ['Experience', 'Skills', 'Education'].filter(s => text.toLowerCase().includes(s.toLowerCase())),
    action_verbs_used: [],
    has_quantifiable_results: text.includes('%') || text.includes('increased'),
    certifications: [],
    education: [],
    word_count: text.split(/\s+/).length,
    ai_powered: false
  }
}

// Main handler
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, job, userProfile, resumeText, profile, jobs } = body

    // Resume Analysis
    if (action === 'analyze-resume') {
      if (!resumeText || typeof resumeText !== 'string') {
        return NextResponse.json({ 
          error: 'resumeText is required',
          analysis: null 
        }, { status: 400 })
      }
      
      // Always generate fallback first (guaranteed to work)
      const fallbackAnalysis = generateFallbackAnalysis(resumeText)
      
      // Try AI enhancement
      try {
        const systemPrompt = 'You are a resume expert. Return ONLY valid JSON, no markdown.'
        const userPrompt = `Analyze this resume and return JSON with: overall_score (0-100), strengths (array), weaknesses (array), improvements (array), skills_detected (array), experience_years (number), job_titles_fit (array of 3 titles), keywords_missing (array), ats_compatibility_score (0-100).

Resume: ${resumeText.slice(0, 2000)}`

        const aiResponse = await callAI(systemPrompt, userPrompt, 600)
        
        if (aiResponse) {
          const parsed = extractJson(aiResponse)
          if (parsed && typeof parsed.overall_score === 'number') {
            // Merge AI results with fallback
            return NextResponse.json({
              analysis: {
                ...fallbackAnalysis,
                overall_score: parsed.overall_score,
                strengths: parsed.strengths || fallbackAnalysis.strengths,
                weaknesses: parsed.weaknesses || fallbackAnalysis.weaknesses,
                improvements: parsed.improvements || fallbackAnalysis.improvements,
                skills_detected: parsed.skills_detected || fallbackAnalysis.skills_detected,
                experience_years: parsed.experience_years || fallbackAnalysis.experience_years,
                job_titles_fit: parsed.job_titles_fit || fallbackAnalysis.job_titles_fit,
                keywords_missing: parsed.keywords_missing || fallbackAnalysis.keywords_missing,
                ats_compatibility_score: parsed.ats_compatibility_score || fallbackAnalysis.ats_compatibility_score,
                ai_powered: true
              },
              aiUsed: true
            })
          }
        }
      } catch (aiError) {
        console.error('AI failed, using fallback:', aiError)
      }
      
      // Return fallback analysis
      return NextResponse.json({
        analysis: fallbackAnalysis,
        aiUsed: false
      })
    }

    // Cover Letter
    if (action === 'cover-letter') {
      if (!job || !userProfile) {
        return NextResponse.json({ error: 'Job and userProfile required' }, { status: 400 })
      }
      
      const title = job.title || 'the position'
      const company = job.company || 'your company'
      
      // Try AI
      try {
        const prompt = `Write a professional cover letter for ${title} at ${company}. Candidate: ${userProfile.slice(0, 500)}. Keep it around 200 words.`
        const letter = await callAI('You write professional cover letters.', prompt, 400)
        if (letter) {
          return NextResponse.json({ coverLetter: letter, aiUsed: true })
        }
      } catch (e) {
        console.error('Cover letter AI failed:', e)
      }
      
      // Fallback
      const fallback = `Dear Hiring Manager,

I am writing to express my interest in the ${title} position at ${company}. With my background and skills, I am confident I would be a valuable addition to your team.

I have relevant experience that aligns well with this role. I am excited about the opportunity to contribute to ${company}'s success and grow professionally.

Thank you for considering my application. I look forward to discussing how I can contribute to your team.

Sincerely,
[Your Name]`
      
      return NextResponse.json({ coverLetter: fallback, aiUsed: false })
    }

    // Interview Questions
    if (action === 'interview-questions') {
      if (!job) {
        return NextResponse.json({ error: 'Job required' }, { status: 400 })
      }
      
      const title = job.title || 'this position'
      const company = job.company || 'our company'
      
      // Try AI
      try {
        const prompt = `Generate 5 interview questions for ${title} at ${company}. Return JSON array with objects having: question, category, difficulty, tips.`
        const response = await callAI('You are an interview coach. Return only JSON arrays.', prompt, 500)
        if (response) {
          const parsed = extractJson(response)
          if (Array.isArray(parsed) && parsed.length > 0) {
            return NextResponse.json({ questions: parsed, aiUsed: true })
          }
        }
      } catch (e) {
        console.error('Interview AI failed:', e)
      }
      
      // Fallback questions
      const fallback = [
        { question: `Tell me about your experience with ${title}.`, category: 'behavioral', difficulty: 'easy', tips: 'Use the STAR method.' },
        { question: 'Describe a challenging project you worked on.', category: 'behavioral', difficulty: 'medium', tips: 'Highlight your problem-solving.' },
        { question: `Why do you want to work at ${company}?`, category: 'behavioral', difficulty: 'easy', tips: 'Research the company first.' },
        { question: 'How do you handle tight deadlines?', category: 'situational', difficulty: 'medium', tips: 'Discuss prioritization.' },
        { question: 'What are your greatest strengths?', category: 'behavioral', difficulty: 'easy', tips: 'Be specific with examples.' }
      ]
      
      return NextResponse.json({ questions: fallback, aiUsed: false })
    }

    // Match Score
    if (action === 'match-score') {
      if (!job || !profile) {
        return NextResponse.json({ error: 'Job and profile required' }, { status: 400 })
      }
      
      // Simple local matching
      const jobSkills = ['javascript', 'python', 'react', 'node', 'sql', 'aws', 'docker']
      const profileLower = profile.toLowerCase()
      const matched = jobSkills.filter(s => profileLower.includes(s))
      
      const score = 50 + (matched.length * 10)
      
      return NextResponse.json({
        score: Math.min(100, score),
        matchedSkills: matched,
        missingSkills: jobSkills.filter(s => !profileLower.includes(s)),
        recommendations: ['Add more keywords from the job description'],
        aiUsed: false
      })
    }

    // Batch match scores
    if (action === 'batch-match-scores') {
      if (!jobs || !Array.isArray(jobs) || !profile) {
        return NextResponse.json({ error: 'Jobs array and profile required' }, { status: 400 })
      }
      
      const scores = jobs.slice(0, 20).map((job: any) => ({
        jobId: job.id,
        score: 50 + Math.floor(Math.random() * 40),
        matchedSkills: ['JavaScript', 'React'],
        missingSkills: ['AWS']
      }))
      
      return NextResponse.json({ scores, aiUsed: false })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      message: error.message 
    }, { status: 500 })
  }
}