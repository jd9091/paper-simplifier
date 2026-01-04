
import { PaperMetadata } from './types';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

export async function extractTextFromPDF(buffer: Buffer): Promise<{ text: string; metadata: PaperMetadata }> {
  try {
    // Validate buffer
    if (!buffer || buffer.length === 0) {
      throw new Error('Invalid PDF file: empty buffer');
    }

    // Check if buffer starts with PDF magic bytes
    const header = buffer.toString('utf-8', 0, 5);
    if (!header.startsWith('%PDF-')) {
      throw new Error('Invalid PDF file: not a valid PDF format');
    }

    // Use pdf-parse to extract text
    // It handles layout preservation reasonably well by default
    const data = await pdf(buffer);

    let text = data.text;

    // Basic cleanup: merge hyphenated words at end of lines
    // e.g. "net-\nwork" -> "network"
    text = text.replace(/(\w+)-\n(\w+)/g, '$1$2');

    if (!text || text.trim().length < 100) {
      throw new Error('PDF contains insufficient text content (may be image-based)');
    }

    // Attempt to extract metadata
    // pdf-parse provides some metadata in data.info
    const metadata: PaperMetadata = {
      title: data.info?.Title || 'Untitled Paper',
      authors: data.info?.Author ? [data.info.Author] : [],
    };

    return {
      text: text.trim(),
      metadata,
    };

  } catch (error) {
    console.error('Error parsing PDF:', error);
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('Failed to parse PDF file - please ensure it is a valid, text-based PDF');
    }
  }
}

export function validatePDFSize(buffer: Buffer, maxSizeMB: number = 10): boolean {
  const sizeMB = buffer.length / (1024 * 1024);
  return sizeMB <= maxSizeMB;
}
