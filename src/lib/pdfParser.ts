/**
 * PDF Parser Utility
 * Server-side PDF text extraction for resume parsing
 */

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
  }
  structure: {
    hasMultiColumnLayout: boolean
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
    // Use require for CommonJS compatibility
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require('pdf-parse')
    
    const data = await pdfParse(buffer)
    
    const metadata = {
      title: data.info?.Title || undefined,
      author: data.info?.Author || undefined,
      creator: data.info?.Creator || undefined,
      producer: data.info?.Producer || undefined,
    }
    
    const rawText = data.text || ''
    const cleanedText = cleanResumeText(rawText)
    const structure = analyzeDocumentStructure(cleanedText)
    
    if (cleanedText.length < 100) {
      warnings.push('Extracted text is very short. The PDF might be image-based.')
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
 * Clean extracted text for resume parsing
 */
function cleanResumeText(text: string): string {
  if (!text) return ''
  
  let cleaned = text
  cleaned = cleaned.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  cleaned = cleaned.replace(/[ \t]+/g, ' ')
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n')
  cleaned = fixJoinedWords(cleaned)
  cleaned = cleaned.replace(/[•●○◆◇▪▫]/g, '• ')
  cleaned = cleaned.replace(/^[\s]*[-*][\s]+/gm, '• ')
  cleaned = preserveSectionHeaders(cleaned)
  cleaned = cleaned.replace(/\s+([.,;:!?])/g, '$1')
  cleaned = cleaned.replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/g, '')
  cleaned = cleaned.split('\n').map(line => line.trim()).join('\n').trim()
  
  return cleaned
}

function fixJoinedWords(text: string): string {
  const patterns = [
    /SoftwareEngineer/gi, /FrontEnd/gi, /BackEnd/gi, /FullStack/gi,
    /MachineLearning/gi, /DeepLearning/gi, /DataScience/gi, /DevOps/gi
  ]
  let result = text
  for (const pattern of patterns) {
    result = result.replace(pattern, m => m.replace(/([a-z])([A-Z])/g, '$1 $2'))
  }
  return result
}

function preserveSectionHeaders(text: string): string {
  const patterns = [
    /^(SUMMARY|PROFILE|OBJECTIVE)/gim,
    /^(EXPERIENCE|WORK EXPERIENCE|EMPLOYMENT)/gim,
    /^(EDUCATION|ACADEMIC)/gim,
    /^(SKILLS|TECHNICAL SKILLS)/gim,
    /^(PROJECTS|PORTFOLIO)/gim,
    /^(CERTIFICATIONS|CERTIFICATES)/gim,
    /^(AWARDS|ACHIEVEMENTS)/gim,
  ]
  let result = text
  for (const pattern of patterns) {
    result = result.replace(pattern, '\n\n$1\n')
  }
  return result
}

function analyzeDocumentStructure(text: string): { hasMultiColumnLayout: boolean; detectedSections: string[] } {
  const lines = text.split('\n')
  const avgLineLength = text.length / Math.max(1, lines.length)
  
  const sections = ['SUMMARY', 'EXPERIENCE', 'EDUCATION', 'SKILLS', 'PROJECTS', 'CERTIFICATIONS']
  const detected: string[] = []
  const upper = text.toUpperCase()
  for (const s of sections) {
    if (upper.includes(s)) detected.push(s)
  }
  
  return {
    hasMultiColumnLayout: avgLineLength < 50 && lines.length > 20,
    detectedSections: detected
  }
}

export function extractSection(text: string, name: string): string | null {
  const patterns: Record<string, RegExp> = {
    summary: /(?:SUMMARY|PROFILE|OBJECTIVE)\s*\n([\s\S]*?)(?=\n\s*(?:EXPERIENCE|EDUCATION|SKILLS)|$)/i,
    experience: /(?:EXPERIENCE|EMPLOYMENT)\s*\n([\s\S]*?)(?=\n\s*(?:EDUCATION|SKILLS|PROJECTS)|$)/i,
    education: /(?:EDUCATION|ACADEMIC)\s*\n([\s\S]*?)(?=\n\s*(?:SKILLS|PROJECTS|EXPERIENCE)|$)/i,
    skills: /(?:SKILLS|TECHNICAL SKILLS)\s*\n([\s\S]*?)(?=\n\s*(?:EXPERIENCE|EDUCATION|PROJECTS)|$)/i,
  }
  const pattern = patterns[name.toLowerCase()]
  if (!pattern) return null
  const match = text.match(pattern)
  return match ? match[1].trim() : null
}

export function validateResumeText(text: string): { isValid: boolean; confidence: number; issues: string[] } {
  const issues: string[] = []
  let confidence = 100
  
  if (text.length < 100) { issues.push('Text is too short'); confidence -= 50 }
  if (!/experience|employment|work history/i.test(text) && !/education|degree/i.test(text) && !/skills?/i.test(text)) {
    issues.push('No common resume sections'); confidence -= 30
  }
  if (!/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text) && !/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/.test(text)) {
    issues.push('No contact information'); confidence -= 20
  }
  
  return { isValid: confidence >= 40, confidence: Math.max(0, confidence), issues }
}

export type { PDFExtractionResult as PDFResult }
