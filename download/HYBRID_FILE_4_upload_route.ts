import { NextRequest, NextResponse } from 'next/server'
import { parseResume, ParsedResume } from '@/lib/resumeParser'
import { extractPDFText, validateResumeText, extractSection, PDFExtractionResult } from '@/lib/pdfParser'

export const runtime = 'nodejs'
export const maxDuration = 60

/**
 * Validate uploaded file
 */
function validateFile(file: File): { valid: boolean; error?: string } {
  const MAX_SIZE = 10 * 1024 * 1024 // 10MB
  const ALLOWED_TYPES = ['application/pdf', 'application/x-pdf']
  
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: 'Please upload a PDF file. Other formats are not supported.' }
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
 * Main upload handler
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const options = formData.get('options') as string | null // JSON options
    
    // Parse options if provided
    const parsedOptions = options ? JSON.parse(options) : {
      extractSections: true,
      validateContent: true,
      includeRawText: false
    }
    
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

    // Extract text from PDF using our hybrid parser
    let pdfResult: PDFExtractionResult
    
    try {
      pdfResult = await extractPDFText(buffer)
    } catch (error: any) {
      return NextResponse.json(
        { 
          error: 'Failed to parse PDF file. Please ensure the file is a valid PDF document.',
          details: error.message
        },
        { status: 400 }
      )
    }
    
    // Validate extracted text
    if (!pdfResult.text || pdfResult.text.trim().length < 50) {
      return NextResponse.json(
        { 
          error: 'Could not extract sufficient text from the PDF. This might be because:',
          possibleReasons: [
            'The PDF is a scanned image (not text-based)',
            'The PDF is password protected',
            'The PDF uses special encoding',
            'The file might be corrupted'
          ],
          suggestions: [
            'Try uploading a text-based PDF resume',
            'If your resume is a scanned image, please convert it to text first',
            'Ensure your PDF is not password protected'
          ],
          extractedLength: pdfResult.text?.length || 0
        },
        { status: 400 }
      )
    }

    // Validate if this looks like a resume
    if (parsedOptions.validateContent) {
      const resumeValidation = validateResumeText(pdfResult.text)
      
      if (!resumeValidation.isValid) {
        return NextResponse.json(
          { 
            error: 'The uploaded file does not appear to be a valid resume.',
            issues: resumeValidation.issues,
            confidence: resumeValidation.confidence,
            suggestions: [
              'Ensure the document contains work experience, education, or skills sections',
              'Check if the PDF is a resume or CV document'
            ]
          },
          { status: 400 }
        )
      }
    }

    // Parse the extracted text using our comprehensive resume parser
    const parsedResume: ParsedResume = parseResume(pdfResult.text, 'pdf')
    
    // Extract specific sections if requested
    let sections: Record<string, string | null> = {}
    if (parsedOptions.extractSections) {
      sections = {
        summary: extractSection(pdfResult.text, 'summary'),
        experience: extractSection(pdfResult.text, 'experience'),
        education: extractSection(pdfResult.text, 'education'),
        skills: extractSection(pdfResult.text, 'skills'),
        projects: extractSection(pdfResult.text, 'projects'),
        certifications: extractSection(pdfResult.text, 'certifications')
      }
    }

    // Build response
    const response: any = {
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
        extractionQuality: parsedResume.extractionQuality,
        structure: pdfResult.structure
      }
    }
    
    // Include raw text if requested
    if (parsedOptions.includeRawText) {
      response.rawText = pdfResult.rawText
    }
    
    // Include warnings if any
    if (pdfResult.warnings.length > 0) {
      response.warnings = pdfResult.warnings
    }

    return NextResponse.json(response)

  } catch (error: any) {
    console.error('Upload processing error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to process file',
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

/**
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'Resume Upload API',
    supportedFormats: ['PDF'],
    maxFileSize: '10MB',
    features: [
      'PDF text extraction',
      'Resume parsing',
      'Section detection',
      'Skills extraction',
      'ATS scoring'
    ]
  })
}
