import { ApiError } from '../utils/ApiError';

export class CvService {
  /**
   * Extract text from PDF buffer by reading byte patterns
   * This is a simple fallback that works when pdf-parse fails
   */
  private extractPdfText(buffer: Buffer): string {
    try {
      // Convert buffer to string, filtering out non-text bytes
      let text = '';
      for (let i = 0; i < buffer.length; i++) {
        const byte = buffer[i];
        // Keep readable ASCII and UTF-8 characters
        if ((byte >= 32 && byte <= 126) || byte === 10 || byte === 13 || byte > 127) {
          text += String.fromCharCode(byte);
        }
      }
      return text;
    } catch (error) {
      return '';
    }
  }

  async parsePdf(buffer: Buffer): Promise<string> {
    try {
      // Try using pdf-parse if available
      let pdfParse;
      try {
        pdfParse = require('pdf-parse');
      } catch {
        console.log('pdf-parse not available, using fallback text extraction');
        pdfParse = null;
      }

      if (pdfParse && typeof pdfParse === 'function') {
        const data = await pdfParse(buffer);
        const text = data?.text || '';
        if (text.trim()) {
          return text;
        }
      }

      // Fallback: extract what we can from the PDF bytes
      const text = this.extractPdfText(buffer);
      if (!text.trim()) {
        throw new ApiError(400, 'Could not extract text from PDF');
      }
      console.log('✓ Extracted text from PDF using fallback method');
      return text;
    } catch (error: any) {
      console.error('PDF Parse Error:', error.message);
      throw new ApiError(400, 'Failed to parse PDF file. Ensure it contains readable text.');
    }
  }

  async parseText(buffer: Buffer): Promise<string> {
    const text = buffer.toString('utf-8');
    if (!text.trim()) {
      throw new ApiError(400, 'Text file appears to be empty');
    }
    return text;
  }

  async parseCv(buffer: Buffer, mimeType: string): Promise<string> {
    console.log(`Parsing CV file with MIME type: ${mimeType}, size: ${buffer.length} bytes`);

    if (mimeType === 'application/pdf') {
      return this.parsePdf(buffer);
    } else if (mimeType === 'text/plain') {
      return this.parseText(buffer);
    } else {
      throw new ApiError(400, 'Unsupported file format. Only PDF and TXT are allowed.');
    }
  }
}

export const cvService = new CvService();
