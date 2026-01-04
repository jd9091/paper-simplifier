import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromPDF, validatePDFSize } from '@/lib/pdf-processor';
import { extractMetadata } from '@/lib/claude-client';

export async function POST(request: NextRequest) {
  try {
    const startTime = Date.now();
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { success: false, error: 'File must be a PDF' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    console.log(`[Upload] Buffer created in ${Date.now() - startTime}ms`);

    if (!validatePDFSize(buffer)) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    const pdfStart = Date.now();
    const { text, metadata: pdfMetadata } = await extractTextFromPDF(buffer);
    console.log(`[Upload] PDF extraction took ${Date.now() - pdfStart}ms, extracted ${text.length} chars`);

    // Extract better metadata using Claude
    const metadataStart = Date.now();
    const metadata = await extractMetadata(text);
    console.log(`[Upload] Claude metadata extraction took ${Date.now() - metadataStart}ms`);

    console.log(`[Upload] Total upload time: ${Date.now() - startTime}ms`);

    return NextResponse.json({
      success: true,
      text,
      metadata: {
        ...pdfMetadata,
        ...metadata,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process PDF',
      },
      { status: 500 }
    );
  }
}
