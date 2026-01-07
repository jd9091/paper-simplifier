import { getPaper } from '@/lib/storage';
import { notFound } from 'next/navigation';
import PaperSection from '@/components/PaperSection';
import FloatingNav from '@/components/FloatingNav';
import PaperOverview from '@/components/PaperOverview';
import KeyFindingsSection from '@/components/KeyFindingsSection';
import ReadingProgress from '@/components/ReadingProgress';
import Link from 'next/link';
import { USER_LEVELS } from '@/lib/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SharePage({ params }: PageProps) {
  const resolvedParams = await params;
  const paper = await getPaper(resolvedParams.id);

  if (!paper) {
    notFound();
  }

  const levelInfo = USER_LEVELS.find(l => l.value === paper.userLevel);

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Reading Progress Bar */}
      <ReadingProgress />

      {/* Floating Navigation */}
      <FloatingNav sections={paper.sections} title={paper.metadata.title} />

      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem'
      }}>
        <Link
          href="/"
          style={{
            fontSize: '0.875rem',
            color: 'var(--color-fg-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem'
          }}
        >
          ← Create Your Own
        </Link>
        <span className="badge">Shared Paper</span>
      </div>

      {/* Paper Header */}
      <div className="section-container">
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
          marginBottom: '1rem'
        }}>
          <span className="badge">Paper</span>
          {levelInfo && (
            <span className="badge" style={{ background: 'var(--color-fg)', color: 'var(--color-bg)' }}>
              {levelInfo.label}
            </span>
          )}
          <span className="badge">{paper.sections.length} Sections</span>
          <span className="badge">{paper.sections.filter(s => s.diagram).length} Diagrams</span>
        </div>

        <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem', lineHeight: 1.3 }}>
          {paper.metadata.title}
        </h1>

        {paper.metadata.authors && paper.metadata.authors.length > 0 && (
          <div style={{ marginBottom: '0.75rem' }}>
            <span style={{ color: 'var(--color-fg-muted)', fontSize: '0.875rem' }}>Authors: </span>
            <span style={{ fontSize: '0.875rem' }}>{paper.metadata.authors.join(', ')}</span>
          </div>
        )}

        {paper.metadata.abstract && (
          <div style={{
            marginTop: '1.25rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--color-border)'
          }}>
            <div className="section-title">Abstract</div>
            <p style={{
              fontSize: '0.9375rem',
              lineHeight: 1.7,
              color: 'var(--color-fg)'
            }}>
              {paper.metadata.abstract}
            </p>
          </div>
        )}
      </div>

      {/* Paper Overview with Structure Diagram */}
      <PaperOverview metadata={paper.metadata} sections={paper.sections} />

      {/* Key Findings (if available) */}
      {paper.keyFindings && (
        <KeyFindingsSection findings={paper.keyFindings} />
      )}

      {/* Sections */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem'
        }}>
          <h2 style={{ margin: 0 }}>Detailed Sections</h2>
          <span style={{
            fontSize: '0.75rem',
            color: 'var(--color-fg-muted)'
          }}>
            Click headers to expand/collapse • Use ☰ button to navigate
          </span>
        </div>

        {paper.sections.map((section, index) => (
          <PaperSection key={index} section={section} index={index} />
        ))}
      </div>

      {/* CTA */}
      <div style={{
        textAlign: 'center',
        padding: '2rem',
        borderTop: '1px solid var(--color-border)'
      }}>
        <p style={{
          fontSize: '0.9375rem',
          color: 'var(--color-fg-muted)',
          marginBottom: '1rem'
        }}>
          Want to simplify your own academic papers?
        </p>
        <Link href="/" className="btn-primary">
          Try Paper Simplifier
        </Link>
      </div>
    </div>
  );
}
