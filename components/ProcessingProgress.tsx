'use client';

import { useEffect, useState } from 'react';

interface ProcessingProgressProps {
  show: boolean;
}

export default function ProcessingProgress({ show }: ProcessingProgressProps) {
  const [step, setStep] = useState(0);
  const [dots, setDots] = useState('');

  const steps = [
    'Analyzing paper structure',
    'Extracting key findings',
    'Simplifying sections',
    'Generating diagrams',
    'Finalizing results'
  ];

  useEffect(() => {
    if (!show) {
      setStep(0);
      return;
    }

    // Cycle through steps
    const stepInterval = setInterval(() => {
      setStep((prev) => (prev + 1) % steps.length);
    }, 3000);

    // Animate dots
    const dotsInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);

    return () => {
      clearInterval(stepInterval);
      clearInterval(dotsInterval);
    };
  }, [show]);

  if (!show) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100
    }}>
      <div style={{
        background: 'var(--color-bg)',
        border: '1px solid var(--color-border)',
        borderRadius: '0.5rem',
        padding: '2rem',
        minWidth: '320px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
      }}>
        {/* Spinner */}
        <div style={{
          width: '48px',
          height: '48px',
          margin: '0 auto 1.5rem',
          border: '3px solid var(--color-border)',
          borderTop: '3px solid var(--color-fg)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />

        {/* Status Text */}
        <div style={{
          textAlign: 'center',
          marginBottom: '1rem'
        }}>
          <div style={{
            fontSize: '0.9375rem',
            fontWeight: 500,
            color: 'var(--color-fg)',
            marginBottom: '0.5rem'
          }}>
            {steps[step]}{dots}
          </div>
          <div style={{
            fontSize: '0.8125rem',
            color: 'var(--color-fg-muted)'
          }}>
            This may take 30-60 seconds
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{
          height: '4px',
          background: 'var(--color-border)',
          borderRadius: '2px',
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            background: 'var(--color-fg)',
            width: `${((step + 1) / steps.length) * 100}%`,
            transition: 'width 0.3s ease'
          }} />
        </div>

        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}
