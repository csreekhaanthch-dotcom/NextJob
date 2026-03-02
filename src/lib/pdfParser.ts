/**
 * PDF Parser Utility
 * OpenResume-style PDF text extraction with enhanced parsing
 * Combines PDF parsing with resume analysis
 * 
 * This uses pdf-parse for server-side extraction
 */

/**
 * Clean and normalize extracted text
 * OpenResume-style text cleaning
 */
function cleanExtractedText(text: string): string {
  if (!text) return ''
  
  return text
    // Remove excessive whitespace
    .replace(/[ \t]+/g, ' ')
    // Normalize line breaks
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Remove multiple consecutive newlines (keep max 2)
    .replace(/\n{3,}/g, '\n\n')
    // Remove leading/trailing whitespace from lines
    .split('\n')
    .map(line => line.trim())
    .join('\n')
    // Remove non-printable characters but keep accented characters
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
    .trim()
}

/**
 * Validate PDF file
 */
export function validatePDF(file: File): { valid: boolean; error?: string } {
  const MAX_SIZE = 10 * 1024 * 1024 // 10MB
  const ALLOWED_TYPES = ['application/pdf']
  
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: 'Please upload a PDF file' }
  }
  
  if (file.size > MAX_SIZE) {
    return { valid: false, error: 'File size must be less than 10MB' }
  }
  
  if (file.size < 100) {
    return { valid: false, error: 'File appears to be corrupted or empty' }
  }
  
  return { valid: true }
}

/**
 * Extract text from PDF buffer
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<{
  text: string
  pages: number
  info: Record<string, any>
}> {
  try {
    // Dynamic import for pdf-parse (ESM compatibility)
    // @ts-ignore - pdf-parse has complex ESM/CJS interop
    const pdfParseModule = await import('pdf-parse')
    // @ts-ignore
    const pdfParse = pdfParseModule.default || pdfParseModule
    
    const data = await pdfParse(buffer)

    // Clean and normalize text
    const cleanedText = cleanExtractedText(data.text || '')

    return {
      text: cleanedText,
      pages: data.numpages || 1,
      info: data.info || {}
    }
  } catch (error: any) {
    console.error('PDF parsing error:', error)
    throw new Error('Failed to parse PDF. Please ensure the file is a valid PDF document.')
  }
}

/**
 * Check if PDF has extractable text
 */
export async function checkPDFQuality(buffer: Buffer): Promise<{
  hasExtractableText: boolean
  warning?: string
}> {
  try {
    const result = await extractTextFromPDF(buffer)
    const textLength = result.text.trim().length
    
    if (textLength < 100) {
      return {
        hasExtractableText: false,
        warning: 'This PDF appears to contain very little text. It may be a scanned document. For best results, please upload a text-based PDF resume.'
      }
    }
    
    if (textLength < 300) {
      return {
        hasExtractableText: true,
        warning: 'Limited text detected. Some information may be missing from the analysis.'
      }
    }
    
    return {
      hasExtractableText: true
    }
  } catch (error) {
    return {
      hasExtractableText: false,
      warning: 'Could not extract text from PDF. Please ensure the file is not corrupted or password-protected.'
    }
  }
}

/**
 * Extract text from various file formats
 */
export async function extractTextFromFile(
  buffer: Buffer, 
  filename: string
): Promise<{ text: string; pages?: number; format: string }> {
  const extension = filename.toLowerCase().split('.').pop()
  
  switch (extension) {
    case 'pdf':
      const pdfResult = await extractTextFromPDF(buffer)
      return {
        text: pdfResult.text,
        pages: pdfResult.pages,
        format: 'pdf'
      }
    
    case 'txt':
      return {
        text: buffer.toString('utf-8'),
        format: 'txt'
      }
    
    default:
      throw new Error(`Unsupported file format: ${extension}. Please upload a PDF file.`)
  }
}

export default {
  extractTextFromPDF,
  validatePDF,
  checkPDFQuality,
  extractTextFromFile
}
