'use client';

interface ProcessingStateProps {
  status: string;
}

export default function ProcessingState({ status }: ProcessingStateProps) {
  return (
    <div className="section-container text-center">
      <div className="animate-pulse space-y-4">
        <div className="text-6xl">⚙️</div>
        <div>
          <div className="font-semibold mb-2">Processing Paper</div>
          <div className="text-sm text-accent">{status}</div>
        </div>
        <div className="flex justify-center space-x-2">
          <div className="w-2 h-2 bg-foreground rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
}
