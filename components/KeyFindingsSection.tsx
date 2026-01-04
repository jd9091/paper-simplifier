'use client';

import { KeyFindings } from '@/lib/types';

interface KeyFindingsSectionProps {
  findings: KeyFindings;
}

export default function KeyFindingsSection({ findings }: KeyFindingsSectionProps) {
  return (
    <div id="key-findings" className="section-anchor" style={{ marginBottom: '2rem' }}>
      <div className="section-container">
        <div className="section-title">Key Findings & Results</div>
        <h2 style={{ marginBottom: '1.5rem' }}>Research Outcomes</h2>

        {/* Research Question */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--color-fg-muted)',
            marginBottom: '0.5rem'
          }}>
            Research Question
          </div>
          <p style={{
            fontSize: '0.9375rem',
            lineHeight: 1.7,
            color: 'var(--color-fg)',
            padding: '1rem',
            background: 'var(--color-hover)',
            borderLeft: '3px solid var(--color-fg)',
            borderRadius: '0.25rem',
            margin: 0
          }}>
            {findings.research_question}
          </p>
        </div>

        {/* Key Findings */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--color-fg-muted)',
            marginBottom: '0.75rem'
          }}>
            Main Findings
          </div>
          <div style={{
            display: 'grid',
            gap: '1rem'
          }}>
            {findings.key_findings.map((finding, index) => (
              <div
                key={index}
                className="card"
                style={{
                  borderLeft: '3px solid var(--color-accent)',
                  background: 'var(--color-bg-secondary)'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                    <div style={{ fontSize: '1.5rem' }}>
                      {index === 0 ? '🎯' : index === 1 ? '📊' : '💡'}
                    </div>
                    <span style={{
                      minWidth: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: 'var(--color-fg)',
                      color: 'var(--color-bg)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 'calc(0.875rem * var(--font-scale))',
                      fontWeight: 600
                    }}>
                      {index + 1}
                    </span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{
                      fontSize: '0.9375rem',
                      fontWeight: 500,
                      lineHeight: 1.6,
                      marginBottom: '0.5rem',
                      color: 'var(--color-fg)'
                    }}>
                      {finding.finding}
                    </p>
                    <div style={{
                      fontSize: '0.875rem',
                      lineHeight: 1.6,
                      color: 'var(--color-fg-muted)',
                      marginBottom: '0.5rem'
                    }}>
                      <strong>Evidence:</strong> {finding.evidence}
                    </div>
                    <div style={{
                      fontSize: '0.8125rem',
                      color: 'var(--color-accent)',
                      padding: '0.375rem 0.625rem',
                      background: 'var(--color-hover)',
                      borderRadius: '0.25rem',
                      display: 'inline-block'
                    }}>
                      {finding.significance}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Conclusion */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--color-fg-muted)',
            marginBottom: '0.5rem'
          }}>
            Main Conclusion
          </div>
          <p style={{
            fontSize: '0.9375rem',
            lineHeight: 1.7,
            color: 'var(--color-fg)',
            padding: '1rem 1.25rem',
            background: 'var(--color-bg-secondary)',
            borderRadius: '0.375rem',
            margin: 0
          }}>
            {findings.main_conclusion}
          </p>
        </div>

        {/* Limitations and Implications */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1rem'
        }}>
          {/* Limitations */}
          <div>
            <div style={{
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--color-fg-muted)',
              marginBottom: '0.75rem'
            }}>
              Limitations
            </div>
            <ul style={{
              margin: 0,
              paddingLeft: '1.25rem',
              fontSize: '0.875rem',
              lineHeight: 1.7,
              color: 'var(--color-fg-muted)'
            }}>
              {findings.limitations.map((limitation, index) => (
                <li key={index} style={{ marginBottom: '0.5rem' }}>
                  {limitation}
                </li>
              ))}
            </ul>
          </div>

          {/* Implications */}
          <div>
            <div style={{
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--color-fg-muted)',
              marginBottom: '0.75rem'
            }}>
              Implications
            </div>
            <p style={{
              fontSize: '0.875rem',
              lineHeight: 1.7,
              color: 'var(--color-fg)',
              margin: 0
            }}>
              {findings.implications}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
