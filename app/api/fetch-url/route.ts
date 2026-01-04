import { NextRequest, NextResponse } from 'next/server';
import { fetchPaperFromURL } from '@/lib/url-fetcher';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'No URL provided' },
        { status: 400 }
      );
    }

    const { text, metadata } = await fetchPaperFromURL(url);

    if (!text || text.length < 100) {
      return NextResponse.json(
        { success: false, error: 'Could not extract sufficient text from URL' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      text,
      metadata,
    });
  } catch (error) {
    console.error('Fetch URL error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch URL',
      },
      { status: 500 }
    );
  }
}
