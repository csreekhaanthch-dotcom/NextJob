/**
 * PDF Parser Utility - Server-only module
 * Uses 'server-only' to ensure this runs only on the server
 */
import 'server-only'

export interface PDFExtractionResult {
  text: string
  rawText: string
  pages: number
  info: Record<string, any>
  metadata: {
    title?: string
    author?: string
    creator?: string
    producer?: string
    creationDate?: string
    modificationDate?: string
  }
  structure: {
    hasMultiColumnLayout: boolean
    estimatedReadingOrder: string[]
    detectedSections: string[]
  }
  warnings: string[]
}

/**
 * Main PDF text extraction function
 */
export async function extractPDFText(buffer: Buffer): Promise<PDFExtractionResult> {
  const warnings: string[] = []
  
  try {
    // Dynamic import for pdf-parse (server-side only)
    const pdfParse = (await import('pdf-parse')).default
    
    const data = await pdfParse(buffer)
    
    const metadata = {
      title: data.info?.Title || undefined,
      author: data.info?.Author || undefined,
      creator: data.info?.Creator || undefined,
      producer: data.info?.Producer || undefined,
      creationDate: data.info?.CreationDate || undefined,
      modificationDate: data.info?.ModDate || undefined
    }
    
    const rawText = data.text || ''
    const cleanedText = cleanResumeText(rawText)
    const structure = analyzeDocumentStructure(cleanedText, rawText)
    
    if (cleanedText.length < 100) {
      warnings.push('Extracted text is very short. The PDF might be image-based or encrypted.')
    }
    
    if (structure.hasMultiColumnLayout) {
      warnings.push('Multi-column layout detected. Text order might need verification.')
    }
    
    return {
      text: cleanedText,
      rawText,
      pages: data.numpages || 1,
      info: data.info || {},
      metadata,
      structure,
      warnings
    }
    
  } catch (error: any) {
    console.error('PDF extraction error:', error)
    throw new Error(`Failed to parse PDF: ${error.message}`)
  }
}

/**
 * Clean extracted text specifically for resume parsing
 */
function cleanResumeText(text: string): string {
  if (!text) return ''
  
  let cleaned = text
  
  cleaned = cleaned.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  cleaned = cleaned.replace(/[ \t]+/g, ' ')
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n')
  cleaned = fixJoinedWords(cleaned)
  cleaned = fixSplitWords(cleaned)
  cleaned = cleaned.replace(/[•●○◆◇▪▫]/g, '• ')
  cleaned = cleaned.replace(/^[\s]*[-*][\s]+/gm, '• ')
  cleaned = preserveSectionHeaders(cleaned)
  cleaned = cleaned.replace(/\s+([.,;:!?])/g, '$1')
  cleaned = cleaned.replace(/\(\s+/g, '(')
  cleaned = cleaned.replace(/\s+\)/g, ')')
  cleaned = cleaned.replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/g, '')
  cleaned = cleaned.split('\n').map(line => line.trim()).join('\n')
  cleaned = cleaned.trim()
  
  return cleaned
}

/**
 * Fix joined words
 */
function fixJoinedWords(text: string): string {
  let result = text
  
  const knownJoinedWords = [
    /SoftwareEngineer/gi, /FrontEnd/gi, /BackEnd/gi, /FullStack/gi,
    /MachineLearning/gi, /DeepLearning/gi, /ArtificialIntelligence/gi,
    /DataScience/gi, /ProjectManager/gi, /ProductManager/gi, /DevOps/gi,
    /SiteReliability/gi, /QualityAssurance/gi, /UserExperience/gi, /UserInterface/gi
  ]
  
  for (const pattern of knownJoinedWords) {
    result = result.replace(pattern, (match) => {
      return match.replace(/([a-z])([A-Z])/g, '$1 $2')
    })
  }
  
  return result
}

/**
 * Fix split words
 */
function fixSplitWords(text: string): string {
  const splitWordPattern = /\b([A-Za-z]\s+){2,}[A-Za-z]\b/g
  
  return text.replace(splitWordPattern, (match) => {
    if (match.includes('.')) return match
    return match.replace(/\s+/g, '')
  })
}

/**
 * Preserve section headers
 */
function preserveSectionHeaders(text: string): string {
  const sectionPatterns = [
    /^(SUMMARY|PROFESSIONAL SUMMARY|PROFILE|OBJECTIVE|ABOUT ME)/gim,
    /^(EXPERIENCE|WORK EXPERIENCE|PROFESSIONAL EXPERIENCE|EMPLOYMENT|WORK HISTORY)/gim,
    /^(EDUCATION|ACADEMIC BACKGROUND|ACADEMIC HISTORY)/gim,
    /^(SKILLS|TECHNICAL SKILLS|COMPETENCIES|EXPERTISE)/gim,
    /^(PROJECTS|PORTFOLIO|KEY PROJECTS)/gim,
    /^(CERTIFICATIONS|CERTIFICATES|LICENSES)/gim,
    /^(AWARDS|HONORS|ACHIEVEMENTS|RECOGNITION)/gim,
    /^(LANGUAGES|LANGUAGE SKILLS)/gim,
    /^(INTERESTS|HOBBIES|ACTIVITIES)/gim,
    /^(PUBLICATIONS|RESEARCH)/gim,
    /^(VOLUNTEER|VOLUNTEERING|COMMUNITY SERVICE)/gim,
    /^(REFERENCES)/gim
  ]
  
  let result = text
  
  for (const pattern of sectionPatterns) {
    result = result.replace(pattern, '\n\n$1\n')
  }
  
  return result
}

/**
 * Analyze document structure
 */
function analyzeDocumentStructure(cleanedText: string, rawText: string): {
  hasMultiColumnLayout: boolean
  estimatedReadingOrder: string[]
  detectedSections: string[]
} {
  const lineCount = cleanedText.split('\n').length
  const avgLineLength = cleanedText.length / Math.max(1, lineCount)
  const hasMultiColumnLayout = avgLineLength < 50 && lineCount > 20
  
  const sectionHeaders = [
    'SUMMARY', 'EXPERIENCE', 'EDUCATION', 'SKILLS', 'PROJECTS',
    'CERTIFICATIONS', 'AWARDS', 'LANGUAGES', 'INTERESTS',
    'PROFILE', 'OBJECTIVE', 'EMPLOYMENT', 'WORK HISTORY',
    'PORTFOLIO', 'ACHIEVEMENTS', 'REFERENCES'
  ]
  
  const detectedSections: string[] = []
  const upperText = cleanedText.toUpperCase()
  
  for (const section of sectionHeaders) {
    if (upperText.includes(section)) {
      detectedSections.push(section)
    }
  }
  
  const estimatedReadingOrder = detectedSections.sort((a, b) => {
    return upperText.indexOf(a) - upperText.indexOf(b)
  })
  
  return {
    hasMultiColumnLayout,
    estimatedReadingOrder,
    detectedSections
  }
}

/**
 * Extract specific sections from text
 */
export function extractSection(text: string, sectionName: string): string | null {
  const sectionPatterns: Record<string, RegExp> = {
    summary: /(?:SUMMARY|PROFILE|OBJECTIVE|ABOUT)\s*\n([\s\S]*?)(?=\n\s*(?:EXPERIENCE|EDUCATION|SKILLS|PROJECTS|CERTIFICATIONS)|$)/i,
    experience: /(?:EXPERIENCE|EMPLOYMENT|WORK HISTORY)\s*\n([\s\S]*?)(?=\n\s*(?:EDUCATION|SKILLS|PROJECTS|CERTIFICATIONS|AWARDS|LANGUAGES)|$)/i,
    education: /(?:EDUCATION|ACADEMIC)\s*\n([\s\S]*?)(?=\n\s*(?:SKILLS|PROJECTS|CERTIFICATIONS|AWARDS|LANGUAGES|INTERESTS|EXPERIENCE)|$)/i,
    skills: /(?:SKILLS|TECHNICAL SKILLS|COMPETENCIES|EXPERTISE)\s*\n([\s\S]*?)(?=\n\s*(?:EXPERIENCE|EDUCATION|PROJECTS|CERTIFICATIONS|AWARDS|LANGUAGES|INTERESTS)|$)/i,
    projects: /(?:PROJECTS|PORTFOLIO)\s*\n([\s\S]*?)(?=\n\s*(?:EXPERIENCE|EDUCATION|SKILLS|CERTIFICATIONS|AWARDS|LANGUAGES|INTERESTS)|$)/i,
    certifications: /(?:CERTIFICATIONS|CERTIFICATES|LICENSES)\s*\n([\s\S]*?)(?=\n\s*(?:EXPERIENCE|EDUCATION|SKILLS|PROJECTS|AWARDS|LANGUAGES|INTERESTS)|$)/i
  }
  
  const pattern = sectionPatterns[sectionName.toLowerCase()]
  if (!pattern) return null
  
  const match = text.match(pattern)
  return match ? match[1].trim() : null
}

/**
 * Validate if extracted text is likely a resume
 */
export function validateResumeText(text: string): { isValid: boolean; confidence: number; issues: string[] } {
  const issues: string[] = []
  let confidence = 100
  
  if (text.length < 100) {
    issues.push('Text is too short to be a valid resume')
    confidence -= 50
  }
  
  const hasExperience = /experience|employment|work history/i.test(text)
  const hasEducation = /education|university|college|degree/i.test(text)
  const hasSkills = /skills?|technologies|competencies/i.test(text)
  
  if (!hasExperience && !hasEducation && !hasSkills) {
    issues.push('No common resume sections detected')
    confidence -= 30
  }
  
  const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text)
  const hasPhone = /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/.test(text)
  
  if (!hasEmail && !hasPhone) {
    issues.push('No contact information detected')
    confidence -= 20
  }
  
  const resumeKeywords = [
    'experience', 'education', 'skills', 'project', 'developer',
    'engineer', 'manager', 'analyst', 'university', 'college',
    'bachelor', 'master', 'certification', 'achievement'
  ]
  
  const keywordCount = resumeKeywords.filter(kw => text.toLowerCase().includes(kw)).length
  
  if (keywordCount < 3) {
    issues.push('Few resume-related keywords detected')
    confidence -= 15
  }
  
  return {
    isValid: confidence >= 40,
    confidence: Math.max(0, confidence),
    issues
  }
}

export type { PDFExtractionResult as PDFResult }
