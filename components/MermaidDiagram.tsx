'use client';

import { useEffect, useRef, useState } from 'react';

interface MermaidDiagramProps {
  chart: string;
}

export default function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const renderDiagram = async () => {
      if (!containerRef.current) return;

      try {
        const mermaid = (await import('mermaid')).default;

        mermaid.initialize({
          startOnLoad: false,
          theme: 'base',
          themeVariables: {
            primaryColor: '#fafafa',
            primaryTextColor: '#1a1a1a',
            primaryBorderColor: '#1a1a1a',
            lineColor: '#404040',
            secondaryColor: '#f5f5f5',
            tertiaryColor: '#fff',
            fontSize: '14px',
            fontFamily: 'JetBrains Mono, monospace',
          },
        });

        // Generate valid CSS ID (no periods allowed)
        const uniqueId = 'mermaid-' + Math.random().toString(36).substring(2, 11);
        const { svg } = await mermaid.render(uniqueId, chart);
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      } catch (err) {
        console.error('Error rendering mermaid diagram:', err);
        setError('Failed to render diagram');
      }
    };

    renderDiagram();
  }, [chart]);

  if (error) {
    return (
      <div className="border border-border rounded-sm p-4 text-sm text-accent">
        {error}
      </div>
    );
  }

  return (
    <div className="diagram-container">
      <div ref={containerRef} style={{ display: 'flex', justifyContent: 'center', minHeight: '200px' }}></div>
    </div>
  );
}
