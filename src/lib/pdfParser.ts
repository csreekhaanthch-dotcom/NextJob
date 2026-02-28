/**
 * PDF Parser Utility - OpenResume-Inspired Implementation
 * High-quality PDF text extraction for resume parsing
 * Combines pdf-parse with enhanced text cleaning and structure detection
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
 * Uses pdf-parse library with enhanced processing
 */
export async function extractPDFText(buffer: Buffer): Promise<PDFExtractionResult> {
  const warnings: string[] = []
  
  try {
    // Dynamic import for pdf-parse (ESM compatibility)
    const pdfParseImport = await import('pdf-parse')
    const pdfParse = (pdfParseImport as any).default || pdfParseImport
    
    // Configure pdf-parse options for better extraction
    const options = {
      pagerender: renderPage, // Custom page renderer for better text extraction
      max: 0, // No page limit
      version: 'v1.10.100' // PDF version
    }
    
    const data = await pdfParse(buffer, options)
    
    // Extract metadata
    const metadata = {
      title: data.info?.Title || undefined,
      author: data.info?.Author || undefined,
      creator: data.info?.Creator || undefined,
      producer: data.info?.Producer || undefined,
      creationDate: data.info?.CreationDate || undefined,
      modificationDate: data.info?.ModDate || undefined
    }
    
    // Process raw text
    const rawText = data.text || ''
    
    // Clean and structure the text
    const cleanedText = cleanResumeText(rawText)
    
    // Analyze document structure
    const structure = analyzeDocumentStructure(cleanedText, rawText)
    
    // Add warnings for potential issues
    if (cleanedText.length < 100) {
      warnings.push('Extracted text is very short. The PDF might be image-based or encrypted.')
    }
    
    if (structure.hasMultiColumnLayout) {
      warnings.push('Multi-column layout detected. Text order might need verification.')
    }
    
    return {
      text: cleanedText,
      rawText: rawText,
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
 * Custom page renderer for pdf-parse
 * Improves text extraction quality
 */
function renderPage(pageData: any): string {
  const renderOptions = {
    normalizeWhitespace: true,
    disableCombineTextItems: false
  }
  
  return pageData.getTextContent(renderOptions)
    .then((textContent: any) => {
      let lastY: number | null = null
      let lastX: number | null = null
      let text = ''
      
      // Sort items by position (top-to-bottom, left-to-right)
      const items = textContent.items.sort((a: any, b: any) => {
        const yDiff = b.transform[5] - a.transform[5]
        if (Math.abs(yDiff) > 5) return yDiff
        return a.transform[4] - b.transform[4]
      })
      
      for (const item of items) {
        if (item.str === undefined) continue
        
        const y = item.transform[5]
        const x = item.transform[4]
        
        // Detect line breaks (significant Y change)
        if (lastY !== null && Math.abs(y - lastY) > 5) {
          text += '\n'
          lastX = null
        }
        // Detect spaces (significant X gap on same line)
        else if (lastX !== null && x - lastX > 10) {
          text += ' '
        }
        
        text += item.str
        lastY = y
        lastX = x + item.width
      }
      
      return text
    })
}

/**
 * Clean extracted text specifically for resume parsing
 * OpenResume-inspired cleaning algorithm
 */
function cleanResumeText(text: string): string {
  if (!text) return ''
  
  let cleaned = text
  
  // Step 1: Normalize line endings
  cleaned = cleaned.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  
  // Step 2: Remove excessive spaces (but preserve indentation patterns)
  cleaned = cleaned.replace(/[ \t]+/g, ' ')
  
  // Step 3: Remove excessive newlines
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n')
  
  // Step 4: Fix common PDF extraction issues
  // - Joined words (e.g., "SoftwareEngineer" -> "Software Engineer")
  cleaned = fixJoinedWords(cleaned)
  
  // - Split words (e.g., "S o f t w a r e" -> "Software")
  cleaned = fixSplitWords(cleaned)
  
  // Step 5: Normalize bullet points
  cleaned = cleaned.replace(/[•●○◆◇▪▫]/g, '• ')
  cleaned = cleaned.replace(/^[\s]*[-*][\s]+/gm, '• ')
  
  // Step 6: Detect and preserve section headers
  cleaned = preserveSectionHeaders(cleaned)
  
  // Step 7: Clean up whitespace around punctuation
  cleaned = cleaned.replace(/\s+([.,;:!?])/g, '$1')
  cleaned = cleaned.replace(/\(\s+/g, '(')
  cleaned = cleaned.replace(/\s+\)/g, ')')
  
  // Step 8: Remove control characters except newlines and tabs
  cleaned = cleaned.replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/g, '')
  
  // Step 9: Trim each line
  cleaned = cleaned.split('\n').map(line => line.trim()).join('\n')
  
  // Step 10: Final cleanup
  cleaned = cleaned.trim()
  
  return cleaned
}

/**
 * Fix joined words (common PDF extraction issue)
 * Examples: "SoftwareEngineer" -> "Software Engineer"
 */
function fixJoinedWords(text: string): string {
  // Common patterns for joined words
  const patterns = [
    // Lowercase followed by uppercase (camelCase-like joins)
    /([a-z])([A-Z][a-z])/g,
    // Number followed by letter
    /(\d)([A-Za-z])/g,
    // Letter followed by number
    /([A-Za-z])(\d)/g
  ]
  
  let result = text
  
  // Only apply the lowercase-uppercase pattern for known cases
  // to avoid breaking legitimate camelCase in code
  const knownJoinedWords = [
    /SoftwareEngineer/gi,
    /FrontEnd/gi,
    /BackEnd/gi,
    /FullStack/gi,
    /MachineLearning/gi,
    /DeepLearning/gi,
    /ArtificialIntelligence/gi,
    /DataScience/gi,
    /ProjectManager/gi,
    /ProductManager/gi,
    /DevOps/gi,
    /SiteReliability/gi,
    /QualityAssurance/gi,
    /UserExperience/gi,
    /UserInterface/gi
  ]
  
  for (const pattern of knownJoinedWords) {
    result = result.replace(pattern, (match) => {
      // Insert space before capital letters (except first)
      return match.replace(/([a-z])([A-Z])/g, '$1 $2')
    })
  }
  
  return result
}

/**
 * Fix split words (common in PDFs with special formatting)
 * Examples: "S o f t w a r e" -> "Software"
 */
function fixSplitWords(text: string): string {
  // Pattern: single letters separated by spaces
  // But we need to be careful not to break initials like "J. R. R."
  const splitWordPattern = /\b([A-Za-z]\s+){2,}[A-Za-z]\b/g
  
  return text.replace(splitWordPattern, (match) => {
    // Check if this looks like initials (has periods)
    if (match.includes('.')) return match
    
    // Remove spaces between single letters
    return match.replace(/\s+/g, '')
  })
}

/**
 * Detect and preserve section headers
 * Makes parsing more reliable
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
  
  // Ensure section headers stand out
  for (const pattern of sectionPatterns) {
    result = result.replace(pattern, '\n\n$1\n')
  }
  
  return result
}

/**
 * Analyze document structure
 * Helps with parsing accuracy
 */
function analyzeDocumentStructure(cleanedText: string, rawText: string): {
  hasMultiColumnLayout: boolean
  estimatedReadingOrder: string[]
  detectedSections: string[]
} {
  // Detect potential multi-column layout
  // PDFs with columns often have text jumping between Y positions
  const lineCount = cleanedText.split('\n').length
  const avgLineLength = cleanedText.length / Math.max(1, lineCount)
  const hasMultiColumnLayout = avgLineLength < 50 && lineCount > 20
  
  // Detect sections
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
  
  // Estimate reading order based on detected sections
  const estimatedReadingOrder = detectedSections.sort((a, b) => {
    const indexA = upperText.indexOf(a)
    const indexB = upperText.indexOf(b)
    return indexA - indexB
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
  
  // Check minimum length
  if (text.length < 100) {
    issues.push('Text is too short to be a valid resume')
    confidence -= 50
  }
  
  // Check for common resume sections
  const hasExperience = /experience|employment|work history/i.test(text)
  const hasEducation = /education|university|college|degree/i.test(text)
  const hasSkills = /skills?|technologies|competencies/i.test(text)
  
  if (!hasExperience && !hasEducation && !hasSkills) {
    issues.push('No common resume sections detected')
    confidence -= 30
  }
  
  // Check for contact information
  const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text)
  const hasPhone = /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/.test(text)
  
  if (!hasEmail && !hasPhone) {
    issues.push('No contact information detected')
    confidence -= 20
  }
  
  // Check for common resume keywords
  const resumeKeywords = [
    'experience', 'education', 'skills', 'project', 'developer',
    'engineer', 'manager', 'analyst', 'university', 'college',
    'bachelor', 'master', 'certification', 'achievement'
  ]
  
  const keywordCount = resumeKeywords.filter(kw => 
    text.toLowerCase().includes(kw)
  ).length
  
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

// Export types
export type { PDFExtractionResult as PDFResult }
