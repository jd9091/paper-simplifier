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
                // Sort texts by Y then X to ensure correct reading order
                const texts = [...page.Texts].sort((a: any, b: any) => {
                  if (Math.abs(a.y - b.y) > 0.5) return a.y - b.y;
                  return a.x - b.x;
                });

                let lastY = -1;

                for (const textItem of texts) {
                  // decode text runs
                  const itemText = textItem.R.map((run: any) => decodeURIComponent(run.T)).join('');

                  if (itemText.trim().length === 0) continue;

                  // Check for new line (if Y difference is significant)
                  // pdf2json units are roughly 1 unit = ?? pixels, but typically line height is around 1ish
                  if (lastY !== -1 && Math.abs(textItem.y - lastY) > 0.5) {
                    text += '\n';
                  } else if (text.length > 0 && !text.endsWith('\n')) {
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
