'use client';

import { useState } from 'react';
import MermaidDiagram from './MermaidDiagram';
import DiagramModal from './DiagramModal';
import MarkdownContent from './MarkdownContent';
import { PaperSection as PaperSectionType } from '@/lib/types';

interface PaperSectionProps {
  section: PaperSectionType;
  index: number;
}

// Helper function to categorize section type
function getSectionType(title: string): string {
  const lower = title.toLowerCase();
  if (lower.includes('abstract')) return 'summary';
  if (lower.includes('intro')) return 'overview';
  if (lower.includes('method')) return 'approach';
  if (lower.includes('result')) return 'findings';
  if (lower.includes('discussion')) return 'analysis';
  if (lower.includes('conclusion')) return 'conclusion';
  return 'section';
}

// Helper function to estimate reading time
function estimateReadingTime(text: string): string {
  const wordsPerMinute = 200;
  const words = text.split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min read`;
}

// Helper function to extract first sentence for TL;DR
function extractFirstSentence(text: string): string {
  const firstSentence = text.split(/[.!?]/)[0];
  return firstSentence.length > 200 ? firstSentence.substring(0, 200) + '...' : firstSentence + '.';
}

// Helper function to add anchors to individual references in References section
function addReferenceAnchors(content: string): string {
  // Match [number] at the start of lines or after newlines in reference lists
  // Add an invisible anchor span before each reference number
  return content.replace(/\[(\d+)\]/g, '<span id="ref-$1" class="reference-anchor"></span>[$1]');
}

// Helper function to extract short summary (3-5 sentences)
function extractShortSummary(content: string): string {
  // Split content into lines
  const lines = content.split('\n').filter(line => line.trim().length > 0);

  // Collect all sentences from paragraphs (skip headers, lists, etc.)
  const allSentences: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip markdown headers
    if (trimmed.match(/^#{1,6}\s/)) continue;

    // Skip list items
    if (trimmed.match(/^[-*•]\s/) || trimmed.match(/^\d+\.\s/)) continue;

    // Skip lines that are too short (likely not full sentences)
    if (trimmed.length < 30) continue;

    // Skip lines with markdown formatting indicators only
    if (trimmed.match(/^\*\*[^*]+\*\*:?$/)) continue;

    // Extract sentences from this line
    const sentences = trimmed.match(/[^.!?]+[.!?]+/g);
    if (sentences) {
      allSentences.push(...sentences.map(s => s.trim()));
    }

    // Stop once we have enough sentences
    if (allSentences.length >= 5) break;
  }

  // If we didn't find enough sentences, fall back to original content
  if (allSentences.length === 0) {
    return content.substring(0, 500) + '...';
  }

  // Take 3-5 sentences (or whatever we found)
  const numSentences = Math.min(Math.max(3, allSentences.length), 5);
  const summary = allSentences.slice(0, numSentences).join(' ');

  return summary;
}

export default function PaperSection({ section, index }: PaperSectionProps) {
  // Check if this is the References section - needs to be determined first
  const isReferencesSection = section.title.toLowerCase().includes('reference') ||
                               section.title.toLowerCase().includes('bibliography');

  const [isExpanded, setIsExpanded] = useState(true);
  // References section always shows original content (no simplification needed for citations)
  const [showOriginal, setShowOriginal] = useState(isReferencesSection);
  const [contentMode, setContentMode] = useState<'short' | 'long'>('short');
  const [diagramModalOpen, setDiagramModalOpen] = useState(false);

  const shortSummary = extractShortSummary(section.simplifiedContent);

  // Check if this section has meaningful content for short/long toggle
  // Skip toggle for very short sections like References, Acknowledgments
  const hasSubstantialContent = section.simplifiedContent.length > 200 &&
                                 !isReferencesSection &&
                                 !section.title.toLowerCase().includes('acknowledgment');

  const sectionNumber = String(index + 1).padStart(2, '0');

  const copyLink = () => {
    const url = `${window.location.href.split('#')[0]}#section-${index}`;
    navigator.clipboard.writeText(url);
  };

  return (
    <div
      id={isReferencesSection ? 'references' : `section-${index}`}
      className="section-anchor"
      style={{ marginBottom: '2rem' }}
    >
      <div className="section-container" style={{ position: 'relative' }}>
        {/* Section Header */}
        <div
          className="collapsible-header"
          onClick={() => setIsExpanded(!isExpanded)}
          style={{ marginBottom: isExpanded ? '1rem' : 0 }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', flex: 1 }}>
            <span style={{
              fontSize: '0.75rem',
              color: 'var(--color-fg-muted)',
              fontWeight: 500
            }}>
              {sectionNumber}
            </span>
            <span className="badge">{getSectionType(section.title)}</span>
            <h3 style={{ margin: 0, fontSize: 'calc(1.125rem * var(--font-scale))' }}>{section.title}</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{
              fontSize: 'calc(0.75rem * var(--font-scale))',
              color: 'var(--color-fg-muted)'
            }}>
              {estimateReadingTime(section.simplifiedContent)}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                copyLink();
              }}
              title="Copy link to section"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.25rem',
                opacity: 0.5,
                fontSize: '0.875rem'
              }}
            >
              #
            </button>
            <span style={{
              fontSize: '1.25rem',
              opacity: 0.5,
              transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
              transition: 'transform 0.2s ease'
            }}>
              ▼
            </span>
          </div>
        </div>

        {isExpanded && (
          <div style={{ animation: 'fadeIn 0.2s ease' }}>
            {/* Toggle between simplified and original - hide for References */}
            {!isReferencesSection && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem',
              paddingBottom: '0.75rem',
              borderBottom: '1px solid var(--color-border)',
              flexWrap: 'wrap',
              gap: '0.75rem'
            }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setShowOriginal(false)}
                  style={{
                    padding: '0.375rem 0.75rem',
                    fontSize: '0.75rem',
                    borderRadius: '0.25rem',
                    border: 'none',
                    cursor: 'pointer',
                    background: !showOriginal ? 'var(--color-fg)' : 'var(--color-hover)',
                    color: !showOriginal ? 'var(--color-bg)' : 'var(--color-fg)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  Simplified
                </button>
                <button
                  onClick={() => setShowOriginal(true)}
                  style={{
                    padding: '0.375rem 0.75rem',
                    fontSize: '0.75rem',
                    borderRadius: '0.25rem',
                    border: 'none',
                    cursor: 'pointer',
                    background: showOriginal ? 'var(--color-fg)' : 'var(--color-hover)',
                    color: showOriginal ? 'var(--color-bg)' : 'var(--color-fg)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  Original
                </button>

                {/* Detail Level Toggle - Only show for simplified content with substantial text */}
                {!showOriginal && hasSubstantialContent && (
                  <>
                    <div style={{
                      height: '1.25rem',
                      width: '1px',
                      background: 'var(--color-border)',
                      margin: '0 0.25rem'
                    }} />
                    <span style={{
                      fontSize: 'calc(0.75rem * var(--font-scale))',
                      color: 'var(--color-fg-muted)'
                    }}>
                      Detail:
                    </span>
                    <button
                      onClick={() => setContentMode('short')}
                      style={{
                        padding: '0.375rem 0.75rem',
                        fontSize: '0.75rem',
                        borderRadius: '0.25rem',
                        border: '1px solid var(--color-border)',
                        cursor: 'pointer',
                        background: contentMode === 'short' ? 'var(--color-fg)' : 'transparent',
                        color: contentMode === 'short' ? 'var(--color-bg)' : 'var(--color-fg)',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      Short
                    </button>
                    <button
                      onClick={() => setContentMode('long')}
                      style={{
                      padding: '0.375rem 0.75rem',
                        fontSize: '0.75rem',
                        borderRadius: '0.25rem',
                        border: '1px solid var(--color-border)',
                        cursor: 'pointer',
                        background: contentMode === 'long' ? 'var(--color-fg)' : 'transparent',
                        color: contentMode === 'long' ? 'var(--color-bg)' : 'var(--color-fg)',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      Full
                    </button>
                  </>
                )}
              </div>
              {section.diagram && (
                <span className="badge">Has Diagram</span>
              )}
            </div>
            )}

            {/* TL;DR for key sections - hide for References */}
            {!isReferencesSection && !showOriginal && ['Method', 'Result', 'Discussion'].some(keyword => section.title.includes(keyword)) && (
              <div style={{
                background: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-border)',
                borderRadius: '0.375rem',
                padding: '1rem',
                marginBottom: '1rem'
              }}>
                <div style={{
                  fontSize: 'calc(0.6875rem * var(--font-scale))',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontWeight: 600,
                  marginBottom: '0.5rem',
                  color: 'var(--color-fg-muted)'
                }}>
                  TL;DR
                </div>
                <div style={{ fontSize: 'calc(0.875rem * var(--font-scale))' }}>
                  {extractFirstSentence(section.simplifiedContent)}
                </div>
              </div>
            )}

            {/* Content */}
            <div style={{ marginBottom: section.diagram ? '1.5rem' : 0 }}>
              {showOriginal ? (
                <div className="original-content">
                  {isReferencesSection ? (
                    <div dangerouslySetInnerHTML={{ __html: addReferenceAnchors(section.originalContent.replace(/\n/g, '<br/>')) }} />
                  ) : (
                    section.originalContent
                  )}
                </div>
              ) : contentMode === 'short' && hasSubstantialContent ? (
                <div className="short-summary">
                  <MarkdownContent content={shortSummary} />
                  <button
                    onClick={() => setContentMode('long')}
                    className="expand-button"
                  >
                    Read full explanation →
                  </button>
                </div>
              ) : (
                <MarkdownContent content={isReferencesSection ? addReferenceAnchors(section.simplifiedContent) : section.simplifiedContent} />
              )}
            </div>

            {/* Diagram */}
            {section.diagram && (
              <>
                <div>
                  <div style={{
                    fontSize: '0.6875rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: 'var(--color-fg-muted)',
                    marginBottom: '0.75rem',
                    fontWeight: 500
                  }}>
                    Visual Overview
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
                      border: '1px solid var(--color-border)'
                    }}>
                      🔍 Click to enlarge
                    </div>
                    <MermaidDiagram chart={section.diagram} />
                  </div>
                </div>

                <DiagramModal
                  chart={section.diagram}
                  isOpen={diagramModalOpen}
                  onClose={() => setDiagramModalOpen(false)}
                />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
