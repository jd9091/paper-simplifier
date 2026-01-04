import { NextRequest, NextResponse } from 'next/server';
import { processPaper } from '@/lib/claude-client';
import { savePaper } from '@/lib/storage';
import { UserLevel, PaperMetadata } from '@/lib/types';

export const maxDuration = 300; // 5 minutes timeout (requires Vercel Pro for >60s)

export async function POST(request: NextRequest) {
  try {
    const { text, metadata, userLevel } = await request.json();

    if (!text) {
      return NextResponse.json(
        { success: false, error: 'No text provided' },
        { status: 400 }
      );
    }

    if (!userLevel) {
      return NextResponse.json(
        { success: false, error: 'No user level provided' },
        { status: 400 }
      );
    }

    const result = await processPaper(
      text,
      userLevel as UserLevel,
      metadata as PaperMetadata | undefined
    );

    const id = await savePaper({
      metadata: result.metadata,
      sections: result.sections,
      keyFindings: result.keyFindings,
      userLevel: userLevel as UserLevel,
    });

    return NextResponse.json({
      success: true,
      id,
    });
  } catch (error) {
    console.error('Process error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process paper',
      },
      { status: 500 }
    );
  }
}
