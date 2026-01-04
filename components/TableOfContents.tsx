'use client';

import { useState, useEffect } from 'react';
import { PaperSection } from '@/lib/types';

interface TableOfContentsProps {
  sections: PaperSection[];
  title: string;
}

export default function TableOfContents({ sections, title }: TableOfContentsProps) {
  const [activeSection, setActiveSection] = useState<string>('');

  useEffect(() => {
    const handleScroll = () => {
      const sectionElements = sections.map((_, index) =>
        document.getElementById(`section-${index}`)
      );

      const scrollPosition = window.scrollY + 100;

      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const element = sectionElements[i];
        if (element && element.offsetTop <= scrollPosition) {
          setActiveSection(`section-${i}`);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections]);

  const scrollToSection = (index: number) => {
    const element = document.getElementById(`section-${index}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <nav className="toc-container" style={{ padding: '1rem' }}>
      <div style={{
        fontSize: '0.6875rem',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        color: 'var(--color-fg-muted)',
        marginBottom: '0.75rem',
        fontWeight: 500
      }}>
        Contents
      </div>

      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`toc-item ${activeSection === '' ? 'active' : ''}`}
        style={{ width: '100%', textAlign: 'left', background: 'none', cursor: 'pointer' }}
      >
        {title.length > 40 ? title.substring(0, 40) + '...' : title}
      </button>

      {sections.map((section, index) => (
        <button
          key={index}
          onClick={() => scrollToSection(index)}
          className={`toc-item ${activeSection === `section-${index}` ? 'active' : ''}`}
          style={{ width: '100%', textAlign: 'left', background: 'none', cursor: 'pointer' }}
        >
          <span style={{ opacity: 0.5, marginRight: '0.5rem', fontSize: '0.75rem' }}>
            {String(index + 1).padStart(2, '0')}
          </span>
          {section.title.length > 30 ? section.title.substring(0, 30) + '...' : section.title}
        </button>
      ))}
    </nav>
  );
}
