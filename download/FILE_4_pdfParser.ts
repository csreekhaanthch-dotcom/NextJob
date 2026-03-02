/**
 * PDF Parser Utility
 * OpenResume-style PDF text extraction with enhanced parsing
 * Combines PDF parsing with resume analysis
 */

/**
 * Extract text from PDF buffer
 * OpenResume-style extraction with layout preservation
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<{
  text: string
  pages: number
  info: {
    title?: string
    author?: string
    creator?: string
    producer?: string
    creationDate?: string
  }
}> {
  try {
    // @ts-ignore - pdf-parse has dynamic import
    const pdfParse = (await import('pdf-parse')).default || (await import('pdf-parse'))
    
    const data = await pdfParse(buffer, {
      // OpenResume-style options for better text extraction
      pagerender: renderPage,
      max: 0, // Parse all pages
      version: 'v1.10.100'
    })

    // Clean and normalize text
    const cleanedText = cleanExtractedText(data.text)

    return {
      text: cleanedText,
      pages: data.numpages,
      info: {
        title: data.info?.Title,
        author: data.info?.Author,
        creator: data.info?.Creator,
        producer: data.info?.Producer,
        creationDate: data.info?.CreationDate
      }
    }
  } catch (error) {
    console.error('PDF parsing error:', error)
    throw new Error('Failed to parse PDF. Please ensure the file is a valid PDF document.')
  }
}

/**
 * Custom page renderer for better text extraction
 * Preserves layout and structure
 */
function renderPage(pageData: any): Promise<string> {
  const renderOptions = {
    normalizeWhitespace: true,
    disableCombineTextItems: false
  }

  return pageData.getTextContent(renderOptions)
    .then((textContent: any) => {
      let lastY: number | null = null
      let text = ''
      
      // Sort items by position for better layout
      const items = textContent.items.sort((a: any, b: any) => {
        if (a.transform[5] !== b.transform[5]) {
          return b.transform[5] - a.transform[5] // Sort by Y position (top to bottom)
        }
        return a.transform[4] - b.transform[4] // Sort by X position (left to right)
      })
      
      for (const item of items) {
        if (item.str) {
          const currentY = item.transform[5]
          
          // Add newline if Y position changed significantly (new line)
          if (lastY !== null && Math.abs(currentY - lastY) > 5) {
            text += '\n'
          } else if (lastY !== null && Math.abs(currentY - lastY) > 1) {
            text += ' '
          }
          
          text += item.str
          lastY = currentY
        }
      }
      
      return text
    })
}

/**
 * Clean and normalize extracted text
 * OpenResume-style text cleaning
 */
function cleanExtractedText(text: string): string {
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
    // Remove common PDF artifacts
    .replace(/[^\x20-\x7E\n]/g, '') // Keep only printable ASCII
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
 * Extract text from various file formats
 * Currently supports PDF, can be extended for DOCX, etc.
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
    
    case 'docx':
      // For DOCX, we would need mammoth.js
      // For now, return error
      throw new Error('DOCX support coming soon. Please convert to PDF first.')
    
    default:
      throw new Error(`Unsupported file format: ${extension}. Please upload a PDF file.`)
  }
}

/**
 * Quick PDF info extraction
 * Fast metadata check without full parsing
 */
export async function getPDFInfo(buffer: Buffer): Promise<{
  isEncrypted: boolean
  isImageBased: boolean
  estimatedPages: number
}> {
  try {
    // Quick check for encryption
    const header = buffer.slice(0, 1024).toString('binary')
    const isEncrypted = header.includes('/Encrypt')
    
    // Estimate pages from PDF structure
    const pageMatches = header.match(/\/Type\s*\/Page[^s]/g)
    const estimatedPages = pageMatches ? pageMatches.length : 1
    
    // Check if it might be image-based (scanned document)
    const imageCount = (header.match(/\/Image/g) || []).length
    const textObjCount = (header.match(/\/Text/g) || []).length
    const isImageBased = imageCount > textObjCount * 2
    
    return {
      isEncrypted,
      isImageBased,
      estimatedPages
    }
  } catch {
    return {
      isEncrypted: false,
      isImageBased: false,
      estimatedPages: 1
    }
  }
}

/**
 * Check if PDF contains extractable text
 * Warns if the PDF might be image-based
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
    
    if (textLength < 500) {
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
      warning: 'Could not extract text from PDF. Please ensure the file is not corrupted.'
    }
  }
}

export default {
  extractTextFromPDF,
  validatePDF,
  extractTextFromFile,
  getPDFInfo,
  checkPDFQuality
}
