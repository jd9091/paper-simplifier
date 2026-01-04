'use client';

import { useState } from 'react';
import { PaperSection, PaperMetadata } from '@/lib/types';
import MermaidDiagram from './MermaidDiagram';
import DiagramModal from './DiagramModal';

interface PaperOverviewProps {
  metadata: PaperMetadata;
  sections: PaperSection[];
}

export default function PaperOverview({ metadata, sections }: PaperOverviewProps) {
  const [diagramModalOpen, setDiagramModalOpen] = useState(false);

  // Generate a flow diagram showing the paper structure
  const generateStructureDiagram = (): string => {
    const sectionNodes = sections.map((section, index) => {
      const id = String.fromCharCode(65 + index); // A, B, C, etc.
      // Remove quotes and other special characters that might break Mermaid syntax
      const sanitizedTitle = section.title.replace(/["']/g, '');
      return `    ${id}["${sanitizedTitle}"]`;
    });

    // Create connections between sections
    const connections = sections.map((_, index) => {
      if (index === 0) return '';
      const prev = String.fromCharCode(65 + index - 1);
      const curr = String.fromCharCode(65 + index);
      return `    ${prev} --> ${curr}`;
    }).filter(Boolean);

    // Don't apply inline styles - let theme CSS handle it
    return `flowchart TD
    subgraph Paper["Paper Structure"]
${sectionNodes.join('\n')}
    end
${connections.join('\n')}`;
  };

  const scrollToSection = (index: number) => {
    const element = document.getElementById(`section-${index}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Extract key points from sections (first sentence of each simplified content)
  const getKeyPoints = () => {
    return sections.slice(0, 4).map(section => {
      const firstSentence = section.simplifiedContent.split(/[.!?]/)[0];
      return {
        title: section.title,
        point: firstSentence.length > 150 ? firstSentence.substring(0, 150) + '...' : firstSentence + '.'
      };
    });
  };

  const keyPoints = getKeyPoints();

  return (
    <div id="paper-overview" className="section-anchor" style={{ marginBottom: '2rem' }}>
      <div className="section-container">
        <div className="section-title">Paper Overview</div>
        <h2 style={{ marginBottom: '1.5rem' }}>At a Glance</h2>

        {/* Structure Diagram */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--color-fg-muted)',
            marginBottom: '0.75rem'
          }}>
            Paper Flow
          </div>
          <div
            onClick={() => setDiagramModalOpen(true)}
            style={{
              cursor: 'pointer',
              position: 'relative',
              transition: 'opacity 0.15s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.opacity = '0.8';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            <div style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: 'var(--color-bg-secondary)',
              padding: '0.5rem 0.75rem',
              borderRadius: '0.25rem',
              fontSize: 'calc(0.75rem * var(--font-scale))',
              opacity: 0.7,
              pointerEvents: 'none',
              border: '1px solid var(--color-border)',
              zIndex: 1
            }}>
              🔍 Click to enlarge
            </div>
            <div className="diagram-container">
              <MermaidDiagram chart={generateStructureDiagram()} />
            </div>
          </div>
        </div>

        <DiagramModal
          chart={generateStructureDiagram()}
          isOpen={diagramModalOpen}
          onClose={() => setDiagramModalOpen(false)}
        />

        {/* Quick Section Navigation */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--color-fg-muted)',
            marginBottom: '0.75rem'
          }}>
            Jump to Section
          </div>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem'
          }}>
            {sections.map((section, index) => (
              <button
                key={index}
                onClick={() => scrollToSection(index)}
                style={{
                  padding: '0.5rem 0.875rem',
                  background: 'var(--color-hover)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '9999px',
                  cursor: 'pointer',
                  fontSize: '0.8125rem',
                  color: 'var(--color-fg)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  transition: 'all 0.15s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-fg)';
                  e.currentTarget.style.background = 'var(--color-bg)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-border)';
                  e.currentTarget.style.background = 'var(--color-hover)';
                }}
              >
                <span style={{ opacity: 0.5, fontSize: '0.6875rem' }}>
                  {String(index + 1).padStart(2, '0')}
                </span>
                {section.title.length > 25 ? section.title.substring(0, 25) + '...' : section.title}
                {section.diagram && <span style={{ fontSize: '0.625rem' }}>📊</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Key Points */}
        <div>
          <div style={{
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--color-fg-muted)',
            marginBottom: '0.75rem'
          }}>
            Key Points
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1rem'
          }}>
            {keyPoints.map((point, index) => (
              <div
                key={index}
                className="card"
                style={{ cursor: 'pointer' }}
                onClick={() => scrollToSection(index)}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.5rem'
                }}>
                  <span style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: 'var(--color-fg)',
                    color: 'var(--color-bg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 600
                  }}>
                    {index + 1}
                  </span>
                  <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>
                    {point.title}
                  </span>
                </div>
                <p style={{
                  fontSize: '0.8125rem',
                  color: 'var(--color-fg-muted)',
                  lineHeight: 1.5,
                  margin: 0
                }}>
                  {point.point}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
