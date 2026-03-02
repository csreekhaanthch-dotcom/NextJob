import { NextRequest, NextResponse } from 'next/server'
import { parseResume, ParsedResume } from '@/lib/resumeParser'

export const runtime = 'nodejs'
export const maxDuration = 30

/**
 * Validate uploaded file
 */
function validateFile(file: File): { valid: boolean; error?: string } {
  const MAX_SIZE = 10 * 1024 * 1024 // 10MB
  
  if (file.type !== 'application/pdf') {
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
 * Extract text from PDF using pdf-parse
 */
async function extractPDFText(buffer: Buffer): Promise<{
  text: string
  pages: number
  info: Record<string, any>
}> {
  try {
    // Dynamic import for pdf-parse (ESM compatibility)
    // @ts-ignore - pdf-parse has complex ESM/CJS interop
    const pdfParseImport = await import('pdf-parse')
    // @ts-ignore
    const pdfParse = pdfParseImport.default || pdfParseImport
    
    const data = await pdfParse(buffer)

    // Clean extracted text
    const text = cleanText(data.text || '')

    return {
      text,
      pages: data.numpages || 1,
      info: data.info || {}
    }
  } catch (error: any) {
    console.error('PDF extraction error:', error)
    throw new Error('Failed to parse PDF. Please ensure the file is a valid PDF document.')
  }
}

/**
 * Clean extracted text
 */
function cleanText(text: string): string {
  return text
    .replace(/[ \t]+/g, ' ')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .split('\n')
    .map(line => line.trim())
    .join('\n')
    .trim()
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file
    const validation = validateFile(file)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Extract text from PDF
    const pdfResult = await extractPDFText(buffer)
    
    if (!pdfResult.text || pdfResult.text.trim().length < 50) {
      return NextResponse.json(
        { 
          error: 'Could not extract sufficient text from the PDF. Please ensure it\'s a text-based resume (not a scanned image).',
          extractedLength: pdfResult.text?.length || 0
        },
        { status: 400 }
      )
    }

    // Parse the extracted text using our resume parser
    const parsedResume: ParsedResume = parseResume(pdfResult.text)

    return NextResponse.json({
      success: true,
      text: pdfResult.text,
      pages: pdfResult.pages,
      parsed: parsedResume,
      metadata: {
        filename: file.name,
        size: file.size,
        type: file.type,
        pdfInfo: pdfResult.info
      }
    })

  } catch (error: any) {
    console.error('Upload processing error:', error)
    return NextResponse.json(
      { 
        error: error.message || 'Failed to process file',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
