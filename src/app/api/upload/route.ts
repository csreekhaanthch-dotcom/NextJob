import { NextRequest, NextResponse } from 'next/server'
import { parseResume, ParsedResume } from '@/lib/resumeParser'
import { extractPDFText, validateResumeText, extractSection } from '@/lib/pdfParser'

export const runtime = 'nodejs'
export const maxDuration = 60

function validateFile(file: File): { valid: boolean; error?: string } {
  const MAX_SIZE = 10 * 1024 * 1024
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

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const validation = validateFile(file)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    let pdfResult
    try {
      pdfResult = await extractPDFText(buffer)
    } catch (error: any) {
      return NextResponse.json({ 
        error: 'Failed to parse PDF file', 
        details: error.message 
      }, { status: 400 })
    }
    
    if (!pdfResult.text || pdfResult.text.trim().length < 50) {
      return NextResponse.json({ 
        error: 'Could not extract text from PDF',
        possibleReasons: [
          'The PDF is a scanned image (not text-based)',
          'The PDF is password protected',
          'The file might be corrupted'
        ],
        extractedLength: pdfResult.text?.length || 0
      }, { status: 400 })
    }

    const resumeValidation = validateResumeText(pdfResult.text)
    if (!resumeValidation.isValid) {
      return NextResponse.json({ 
        error: 'File does not appear to be a valid resume',
        issues: resumeValidation.issues,
        confidence: resumeValidation.confidence
      }, { status: 400 })
    }

    const parsedResume: ParsedResume = parseResume(pdfResult.text, 'pdf')
    
    const sections = {
      summary: extractSection(pdfResult.text, 'summary'),
      experience: extractSection(pdfResult.text, 'experience'),
      education: extractSection(pdfResult.text, 'education'),
      skills: extractSection(pdfResult.text, 'skills'),
    }

    return NextResponse.json({
      success: true,
      text: pdfResult.text,
      pages: pdfResult.pages,
      parsed: parsedResume,
      sections,
      metadata: {
        filename: file.name,
        size: file.size,
        type: file.type,
        pdfInfo: pdfResult.metadata,
        structure: pdfResult.structure
      },
      warnings: pdfResult.warnings
    })

  } catch (error: any) {
    console.error('Upload processing error:', error)
    return NextResponse.json({ 
      error: 'Failed to process file',
      message: error.message 
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'Resume Upload API',
    supportedFormats: ['PDF'],
    maxFileSize: '10MB'
  })
}
