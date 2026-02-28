import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'
import { 
  parseResume, 
  calculateJobMatch,
  ParsedResume 
} from '@/lib/resumeParser'

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

// Enhanced fallback resume analysis using the parser
function generateFallbackAnalysis(parsed: ParsedResume): any {
  let score = 50
  
  if (parsed.email) score += 5
  if (parsed.phone) score += 5
  if (parsed.linkedin) score += 3
  if (parsed.github) score += 3
  
  score += Math.min(15, parsed.technicalSkills.length)
  score += Math.min(10, parsed.experienceYears * 2)
  
  if (parsed.education.length > 0) score += 5
  score += Math.min(5, parsed.certifications.length)
  
  score = Math.round((score + parsed.atsScore) / 2)
  
  const strengths: string[] = []
  if (parsed.technicalSkills.length >= 10) {
    strengths.push(`Strong technical skill set with ${parsed.technicalSkills.length} relevant skills`)
  } else if (parsed.technicalSkills.length >= 5) {
    strengths.push(`Good foundation with ${parsed.technicalSkills.length} technical skills`)
  }
  if (parsed.experienceYears >= 5) {
    strengths.push(`${parsed.experienceYears}+ years of professional experience`)
  } else if (parsed.experienceYears >= 2) {
    strengths.push(`${parsed.experienceYears}+ years of relevant experience`)
  }
  if (parsed.hasQuantifiableResults) strengths.push('Includes quantifiable achievements')
  if (parsed.actionVerbsUsed.length >= 5) strengths.push('Uses strong action verbs effectively')
  if (parsed.certifications.length > 0) {
    strengths.push(`Professional certifications: ${parsed.certifications.slice(0, 2).join(', ')}`)
  }
  if (parsed.education.length > 0) strengths.push('Clear educational background')
  if (parsed.linkedin || parsed.github) strengths.push('Professional online presence')
  if (strengths.length < 3) strengths.push('Clear resume structure')
  
  const weaknesses = [...parsed.atsIssues].slice(0, 4)
  if (weaknesses.length === 0) weaknesses.push('Could include more industry-specific keywords')
  
  const improvements = [...parsed.atsSuggestions].slice(0, 5)
  
  const jobTitlesFit = parsed.recommendedJobTitles.length > 0 
    ? parsed.recommendedJobTitles 
    : ['Software Developer', 'Technical Specialist', 'IT Professional']
  
  const keywordsMissing: string[] = []
  const hasCloud = parsed.technicalSkills.some(s => 
    ['AWS', 'Azure', 'GCP', 'Cloud'].some(c => s.includes(c))
  )
  const hasCI = parsed.technicalSkills.some(s => 
    ['CI/CD', 'Jenkins', 'GitHub Actions', 'Docker'].some(c => s.includes(c))
  )
  
  if (!hasCloud) keywordsMissing.push('Cloud Technologies (AWS/Azure/GCP)')
  if (!hasCI) keywordsMissing.push('CI/CD Pipeline')
  if (!parsed.technicalSkills.some(s => s.includes('Agile'))) {
    keywordsMissing.push('Agile/Scrum methodology')
  }
  if (!parsed.technicalSkills.some(s => s.includes('Test'))) {
    keywordsMissing.push('Testing frameworks')
  }
  
  return {
    overall_score: Math.min(100, score),
    strengths: strengths.slice(0, 5),
    weaknesses: weaknesses.slice(0, 4),
    improvements: improvements.slice(0, 5),
    skills_detected: parsed.technicalSkills,
    soft_skills: parsed.softSkills,
    skills_by_category: parsed.skillsByCategory,
    experience_years: parsed.experienceYears,
    experience_level: parsed.experienceLevel,
    job_titles_fit: jobTitlesFit,
    keywords_missing: keywordsMissing.slice(0, 5),
    ats_compatibility_score: parsed.atsScore,
    contact_info: {
      email: parsed.email,
      phone: parsed.phone,
      linkedin: parsed.linkedin,
      github: parsed.github
    },
    sections_found: parsed.sections,
    action_verbs_used: parsed.actionVerbsUsed,
    has_quantifiable_results: parsed.hasQuantifiableResults,
    certifications: parsed.certifications,
    education: parsed.education,
    word_count: parsed.wordCount,
    ai_powered: false
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
  const parsed = parseResume(resumeText)
  
  const systemPrompt = `You are an expert resume reviewer and career coach with 15+ years of experience in recruitment. 
Analyze resumes and provide detailed, actionable feedback in JSON format.
Be specific, realistic, and helpful. Focus on both content and presentation.`
  
  const userPrompt = `Analyze this resume thoroughly:

 ${resumeText}

PARSED DATA (for reference):
- Technical Skills Found: ${parsed.technicalSkills.join(', ')}
- Experience Years: ${parsed.experienceYears}
- Experience Level: ${parsed.experienceLevel}
- ATS Score: ${parsed.atsScore}
- Sections Found: ${parsed.sections.join(', ')}

Return JSON with this exact structure:
{
  "overall_score": 0-100,
  "strengths": ["list of 3-5 specific strengths with details"],
  "weaknesses": ["list of 2-4 specific areas to improve"],
  "improvements": ["list of 3-5 specific actionable recommendations"],
  "skills_detected": ["list of all skills found"],
  "experience_years": estimated_number,
  "job_titles_fit": ["list of 3-5 job titles this resume fits best"],
  "keywords_missing": ["important keywords that should be added for better visibility"],
  "ats_compatibility_score": 0-100,
  "summary_feedback": "2-3 sentence overall feedback",
  "formatting_tips": ["list of 2-3 formatting improvements"],
  "content_suggestions": ["list of 2-3 content improvements"]
}

Be specific about what's good and what needs improvement. Give realistic scores.`

  const response = await callAI(systemPrompt, userPrompt, 1000)
  if (response) {
    const parsedAI = extractJsonFromResponse(response)
    if (parsedAI) {
      return { 
        analysis: {
          ...parsedAI,
          skills_by_category: parsed.skillsByCategory,
          soft_skills: parsed.softSkills,
          experience_level: parsed.experienceLevel,
          contact_info: {
            email: parsed.email,
            phone: parsed.phone,
            linkedin: parsed.linkedin,
            github: parsed.github
          },
          sections_found: parsed.sections,
          action_verbs_used: parsed.actionVerbsUsed,
          has_quantifiable_results: parsed.hasQuantifiableResults,
          certifications: parsed.certifications,
          education: parsed.education,
          word_count: parsed.wordCount,
          ai_powered: true
        }, 
        aiUsed: true 
      }
    }
  }
  
  return { analysis: generateFallbackAnalysis(parsed), aiUsed: false }
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
    "tips": "helpful tip for answering this question",
    "sample_answer": "brief sample answer or key points to include"
  }
]

Include a mix of question types. Make questions specific to the job role and company context.`

  const response = await callAI(systemPrompt, userPrompt, 1200)
  if (response) {
    const parsed = extractJsonFromResponse(response)
    if (Array.isArray(parsed)) return { questions: parsed, aiUsed: true }
  }
  return { questions: getFallbackInterviewQuestions(job), aiUsed: false }
}

async function calculateMatchScore(job: any, profile: string): Promise<{ score: number; matchedSkills: string[]; missingSkills: string[]; recommendations: string[] }> {
  const localMatch = calculateJobMatch(profile, job.description || '')
  
  const systemPrompt = 'You are a recruiter evaluating job-candidate matches. Return only a JSON object.'
  const userPrompt = `Rate the match between this candidate and job:

Job: ${job.title} at ${job.company}
Description: ${job.description}

Candidate Profile:
 ${profile}

Return JSON with this structure:
{
  "score": 0-100,
  "matched_skills": ["skills that match"],
  "missing_skills": ["skills that are missing"],
  "recommendations": ["2-3 quick tips to improve the resume for this job"]
}`

  const response = await callAI(systemPrompt, userPrompt, 300)
  if (response) {
    const parsed = extractJsonFromResponse(response)
    if (parsed && typeof parsed.score === 'number') {
      return {
        score: parsed.score,
        matchedSkills: parsed.matched_skills || localMatch.matchedSkills,
        missingSkills: parsed.missing_skills || localMatch.missingSkills,
        recommendations: parsed.recommendations || localMatch.recommendations
      }
    }
  }
  
  return localMatch
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
        const matchResult = await calculateMatchScore(job, profile)
        return NextResponse.json({ ...matchResult, aiUsed: true })

      case 'batch-match-scores':
        if (!jobs || !Array.isArray(jobs) || !profile) {
          return NextResponse.json({ error: 'Jobs array and profile required' }, { status: 400 })
        }
        const scores = await Promise.all(
          jobs.slice(0, 20).map(async (job: any) => {
            const match = await calculateMatchScore(job, profile)
            return {
              jobId: job.id,
              score: match.score,
              matchedSkills: match.matchedSkills,
              missingSkills: match.missingSkills
            }
          })
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