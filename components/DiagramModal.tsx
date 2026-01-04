'use client';

import { useState, useEffect, useRef } from 'react';

interface DiagramModalProps {
  chart: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function DiagramModal({ chart, isOpen, onClose }: DiagramModalProps) {
  const [zoom, setZoom] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Render diagram when modal opens
  useEffect(() => {
    const renderDiagram = async () => {
      if (!containerRef.current || !isOpen) return;

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
            fontSize: '16px',
            fontFamily: 'JetBrains Mono, monospace',
          },
        });

        const uniqueId = 'modal-diagram-' + Math.random().toString(36).substring(2, 11);
        const { svg } = await mermaid.render(uniqueId, chart);

        if (containerRef.current) {
          containerRef.current.innerHTML = svg;

          // Make SVG responsive - remove fixed width/height
          const svgElement = containerRef.current.querySelector('svg');
          if (svgElement) {
            svgElement.style.maxWidth = '100%';
            svgElement.style.height = 'auto';
          }
        }
      } catch (err) {
        console.error('Error rendering diagram in modal:', err);
        if (containerRef.current) {
          containerRef.current.innerHTML = '<div style="color: var(--color-fg-muted); padding: 2rem; text-align: center;">Failed to render diagram</div>';
        }
      }
    };

    if (isOpen) {
      renderDiagram();
    }
  }, [chart, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="diagram-modal-overlay" onClick={onClose}>
      <div className="diagram-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button
          className="diagram-modal-close"
          onClick={onClose}
          aria-label="Close diagram"
        >
          ×
        </button>

        {/* Zoom controls */}
        <div className="diagram-zoom-controls">
          <button
            onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}
            disabled={zoom <= 0.5}
            aria-label="Zoom out"
          >
            −
          </button>
          <span>{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom(z => Math.min(3, z + 0.25))}
            disabled={zoom >= 3}
            aria-label="Zoom in"
          >
            +
          </button>
          <button
            onClick={() => setZoom(1)}
            aria-label="Reset zoom"
          >
            Reset
          </button>
        </div>

        {/* Diagram with zoom */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          display: 'flex',
          alignItems: zoom === 1 ? 'center' : 'flex-start',
          justifyContent: zoom === 1 ? 'center' : 'flex-start',
          padding: '1rem'
        }}>
          <div
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'top left',
              transition: 'transform 0.2s ease',
              background: 'var(--color-bg-secondary)',
              borderRadius: '0.5rem',
              padding: '2rem',
              minWidth: '600px',
              // Add margin to create scrollable space when zoomed
              marginRight: zoom > 1 ? `${(zoom - 1) * 100}%` : '0',
              marginBottom: zoom > 1 ? `${(zoom - 1) * 100}%` : '0'
            }}
          >
            <div
              ref={containerRef}
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '300px'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
