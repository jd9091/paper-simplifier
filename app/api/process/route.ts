import { NextRequest } from 'next/server';
import { processPaper } from '@/lib/claude-client';
import { savePaper } from '@/lib/storage';
import { UserLevel, PaperMetadata } from '@/lib/types';

export const maxDuration = 300; // 5 minutes timeout (requires Vercel Pro for >60s)

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();

  const { text, metadata, userLevel } = await request.json();

  if (!text) {
    return new Response(
      JSON.stringify({ success: false, error: 'No text provided' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (!userLevel) {
    return new Response(
      JSON.stringify({ success: false, error: 'No user level provided' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Create a readable stream for Server-Sent Events
  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      try {
        // Progress callback that streams updates to client
        const onProgress = (message: string, step?: number, totalSteps?: number) => {
          sendEvent({ type: 'progress', message, step, totalSteps });
        };

        sendEvent({ type: 'progress', message: 'Starting paper processing...', step: 0, totalSteps: 5 });

        const result = await processPaper(
          text,
          userLevel as UserLevel,
          metadata as PaperMetadata | undefined,
          onProgress
        );

        sendEvent({ type: 'progress', message: 'Saving to database...', step: 5, totalSteps: 5 });

        const id = await savePaper({
          metadata: result.metadata,
          sections: result.sections,
          keyFindings: result.keyFindings,
          userLevel: userLevel as UserLevel,
        });

        sendEvent({ type: 'complete', id, success: true });
      } catch (error) {
        console.error('Process error:', error);
        sendEvent({
          type: 'error',
          success: false,
          error: error instanceof Error ? error.message : 'Failed to process paper',
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
