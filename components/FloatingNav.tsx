'use client';

import { useState, useEffect } from 'react';
import { PaperSection } from '@/lib/types';

interface FloatingNavProps {
  sections: PaperSection[];
  title: string;
}

export default function FloatingNav({ sections, title }: FloatingNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<number>(-1);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);

      // Find active section
      const sectionElements = sections.map((_, index) =>
        document.getElementById(`section-${index}`)
      );

      const scrollPosition = window.scrollY + 150;

      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const element = sectionElements[i];
        if (element && element.offsetTop <= scrollPosition) {
          setActiveSection(i);
          return;
        }
      }
      setActiveSection(-1);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections]);

  const scrollToSection = (index: number) => {
    const element = document.getElementById(`section-${index}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setIsOpen(false);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToOverview = () => {
    const element = document.getElementById('paper-overview');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Navigation Button */}
      <div style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        alignItems: 'flex-end'
      }}>
        {/* Back to Top */}
        {showBackToTop && (
          <button
            onClick={scrollToTop}
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: 'var(--color-bg)',
              border: '1px solid var(--color-border)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              transition: 'all 0.15s ease'
            }}
            title="Back to top"
          >
            ↑
          </button>
        )}

        {/* Navigation Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            background: 'var(--color-fg)',
            color: 'var(--color-bg)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.25rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            transition: 'all 0.15s ease'
          }}
          title="Navigate sections"
        >
          {isOpen ? '×' : '☰'}
        </button>
      </div>

      {/* Navigation Panel */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '6rem',
          right: '1.5rem',
          width: '280px',
          maxHeight: '60vh',
          background: 'var(--color-bg)',
          border: '1px solid var(--color-border)',
          borderRadius: '0.5rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          zIndex: 50,
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '1rem',
            borderBottom: '1px solid var(--color-border)',
            background: 'var(--color-hover)'
          }}>
            <div style={{
              fontSize: '0.6875rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'var(--color-fg-muted)',
              marginBottom: '0.25rem'
            }}>
              Navigate
            </div>
            <div style={{
              fontSize: '0.875rem',
              fontWeight: 500,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {title.length > 35 ? title.substring(0, 35) + '...' : title}
            </div>
          </div>

          <div style={{ maxHeight: 'calc(60vh - 80px)', overflowY: 'auto', padding: '0.5rem' }}>
            {/* Overview Link */}
            <button
              onClick={scrollToOverview}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '0.625rem 0.75rem',
                background: activeSection === -1 ? 'var(--color-hover)' : 'transparent',
                border: 'none',
                borderRadius: '0.25rem',
                cursor: 'pointer',
                fontSize: '0.8125rem',
                color: 'var(--color-fg)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'background 0.1s ease'
              }}
            >
              <span style={{ opacity: 0.5 }}>📊</span>
              Paper Overview
            </button>

            {/* Section Links */}
            {sections.map((section, index) => (
              <button
                key={index}
                onClick={() => scrollToSection(index)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '0.625rem 0.75rem',
                  background: activeSection === index ? 'var(--color-hover)' : 'transparent',
                  border: 'none',
                  borderLeft: activeSection === index ? '2px solid var(--color-fg)' : '2px solid transparent',
                  borderRadius: '0.25rem',
                  cursor: 'pointer',
                  fontSize: '0.8125rem',
                  color: activeSection === index ? 'var(--color-fg)' : 'var(--color-fg-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.1s ease'
                }}
              >
                <span style={{
                  fontSize: '0.6875rem',
                  opacity: 0.5,
                  minWidth: '1.25rem'
                }}>
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span style={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {section.title}
                </span>
                {section.diagram && (
                  <span style={{ fontSize: '0.625rem', opacity: 0.5 }}>📊</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
