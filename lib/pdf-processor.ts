
import { PaperMetadata } from './types';
import { createRequire } from 'module';
import { writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

const require = createRequire(import.meta.url);
const PDFParser = require('pdf2json');

export async function extractTextFromPDF(buffer: Buffer): Promise<{ text: string; metadata: PaperMetadata }> {
  return new Promise((resolve, reject) => {
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

      // Create a temporary file (pdf2json works with files)
      const tempPath = join(tmpdir(), `pdf-${Date.now()}-${Math.random().toString(36).substring(7)}.pdf`);
      writeFileSync(tempPath, buffer);

      const pdfParser = new PDFParser(null, true); // true = silent mode (suppress warnings)

      pdfParser.on('pdfParser_dataError', (errData: any) => {
        try {
          unlinkSync(tempPath);
        } catch (e) {
          // Ignore cleanup errors
        }
        reject(new Error(`PDF parsing error: ${errData.parserError}`));
      });

      pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
        try {
          // Extract text from all pages
          let text = '';
          if (pdfData.Pages) {
            for (const page of pdfData.Pages) {
              if (page.Texts) {
                // DO NOT SORT: Trust the PDF stream order (usually correct for columns)
                // Sorting by Y breaks multi-column layouts by interleaving lines.

                let lastY = -1;

                for (const textItem of page.Texts) {
                  // decode text runs and join with SPACE to avoid merging words (Fixes "Internetisone")
                  const itemText = textItem.R.map((run: any) => decodeURIComponent(run.T)).join(' ');

                  if (itemText.trim().length === 0) continue;

                  // Check for new line (if Y difference is significant)
                  // If Y difference is large (> 0.5), it's a new line OR new column
                  // If Y decreases significantly (e.g. -20), it's likely a new column starting at top
                  if (lastY !== -1 && Math.abs(textItem.y - lastY) > 0.5) {
                    text += '\n';
                    // Optional: If massive jump backwards, maybe double newline? 
                    // But single newline is safe for AI to parse.
                  } else if (text.length > 0 && !text.endsWith('\n')) {
                    // Same line, separate items (e.g. "Internet" ... "is")
                    text += ' ';
                  }

                  text += itemText;
                  lastY = textItem.y;
                }
              }
              text += '\n\n'; // Double newline between pages
            }
          }

          // Clean up temp file
          try {
            unlinkSync(tempPath);
          } catch (e) {
            // Ignore cleanup errors
          }

          if (!text || text.trim().length < 100) {
            throw new Error('PDF contains insufficient text content (may be image-based)');
          }

          // Extract metadata
          const metadata: PaperMetadata = {
            title: pdfData.Meta?.Title || 'Untitled Paper',
            authors: pdfData.Meta?.Author ? [pdfData.Meta.Author] : [],
          };

          resolve({
            text: text.trim(),
            metadata,
          });
        } catch (error) {
          try {
            unlinkSync(tempPath);
          } catch (e) {
            // Ignore cleanup errors
          }
          if (error instanceof Error) {
            reject(error);
          } else {
            reject(new Error('Failed to process PDF content'));
          }
        }
      });

      // Parse the PDF file
      pdfParser.loadPDF(tempPath);
    } catch (error) {
      console.error('Error parsing PDF:', error);
      if (error instanceof Error) {
        reject(error);
      } else {
        reject(new Error('Failed to parse PDF file - please ensure it is a valid, text-based PDF'));
      }
    }
  });
}

export function validatePDFSize(buffer: Buffer, maxSizeMB: number = 10): boolean {
  const sizeMB = buffer.length / (1024 * 1024);
  return sizeMB <= maxSizeMB;
}
