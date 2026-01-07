import { PaperMetadata } from './types';
import { extractText, getDocumentProxy } from 'unpdf';

export async function extractTextFromPDF(buffer: Buffer): Promise<{ text: string; metadata: PaperMetadata }> {
  // Validate buffer
  if (!buffer || buffer.length === 0) {
    throw new Error('Invalid PDF file: empty buffer');
  }

  // Check if buffer starts with PDF magic bytes
  const header = buffer.toString('utf-8', 0, 5);
  if (!header.startsWith('%PDF-')) {
    throw new Error('Invalid PDF file: not a valid PDF format');
  }

  try {
    // Convert Buffer to Uint8Array for unpdf
    const uint8Array = new Uint8Array(buffer);

    // Extract text using unpdf
    const { text, totalPages } = await extractText(uint8Array, { mergePages: true });

    console.log(`[PDF] Extracted text from ${totalPages} pages`);

    if (!text || text.trim().length < 100) {
      throw new Error('PDF contains insufficient text content (may be image-based)');
    }

    // Try to get metadata
    let metadata: PaperMetadata = {
      title: 'Untitled Paper',
      authors: [],
    };

    try {
      const pdf = await getDocumentProxy(uint8Array);
      const pdfMetadata = await pdf.getMetadata();
      if (pdfMetadata?.info) {
        const info = pdfMetadata.info as Record<string, unknown>;
        if (info.Title && typeof info.Title === 'string') {
          metadata.title = info.Title;
        }
        if (info.Author && typeof info.Author === 'string') {
          metadata.authors = [info.Author];
        }
      }
    } catch (metaError) {
      // Ignore metadata extraction errors
      console.log('[PDF] Could not extract metadata, using defaults');
    }

    return {
      text: text.trim(),
      metadata,
    };
  } catch (error) {
    console.error('Error parsing PDF:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to parse PDF file - please ensure it is a valid, text-based PDF');
  }
}

export function validatePDFSize(buffer: Buffer, maxSizeMB: number = 10): boolean {
  const sizeMB = buffer.length / (1024 * 1024);
  return sizeMB <= maxSizeMB;
}
