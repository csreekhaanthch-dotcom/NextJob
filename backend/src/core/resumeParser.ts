import pdf from 'pdf-parse';
import mammoth from 'mammoth';

class ResumeParser {
  /**
   * Parse resume from different file formats
   */
  async parse(fileBuffer: Buffer, fileType: string): Promise<string> {
    switch (fileType.toLowerCase()) {
      case 'pdf':
        return await this.parsePdf(fileBuffer);
      case 'docx':
        return await this.parseDocx(fileBuffer);
      case 'txt':
      case 'text':
        return fileBuffer.toString('utf8');
      default:
        throw new Error(`Unsupported file type: ${fileType}`);
    }
  }

  /**
   * Parse PDF resume
   */
  private async parsePdf(buffer: Buffer): Promise<string> {
    try {
      const data = await pdf(buffer);
      return data.text;
    } catch (error) {
      throw new Error(`Failed to parse PDF: ${error}`);
    }
  }

  /**
   * Parse DOCX resume
   */
  private async parseDocx(buffer: Buffer): Promise<string> {
    try {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } catch (error) {
      throw new Error(`Failed to parse DOCX: ${error}`);
    }
  }

  /**
   * Normalize text for processing
   */
  normalizeText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
}

export const resumeParser = new ResumeParser();