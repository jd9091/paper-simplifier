'use client';

import { useEffect, useState, useRef } from 'react';

interface LogEntry {
  message: string;
  timestamp: Date;
}

interface ProcessingProgressProps {
  show: boolean;
  logs?: LogEntry[];
  currentStep?: number;
  totalSteps?: number;
}

export default function ProcessingProgress({ show, logs = [], currentStep = 0, totalSteps = 5 }: ProcessingProgressProps) {
  const [dots, setDots] = useState('');
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Calculate progress based on current step
  const progress = totalSteps > 0 ? Math.min((currentStep / totalSteps) * 100, 99) : 0;

  // Get current status from latest log
  const currentStatus = logs.length > 0 ? logs[logs.length - 1].message : 'Starting...';

  useEffect(() => {
    if (!show) return;

    // Animate dots
    const dotsInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);

    return () => {
      clearInterval(dotsInterval);
    };
  }, [show]);

  // Auto-scroll to bottom of logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

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
        minWidth: '400px',
        maxWidth: '500px',
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
            {currentStatus}{dots}
          </div>
          <div style={{
            fontSize: '0.8125rem',
            color: 'var(--color-fg-muted)'
          }}>
            Step {currentStep} of {totalSteps}
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{
          height: '4px',
          background: 'var(--color-border)',
          borderRadius: '2px',
          overflow: 'hidden',
          marginBottom: '1rem'
        }}>
          <div style={{
            height: '100%',
            background: 'var(--color-success)',
            width: `${progress}%`,
            transition: 'width 0.3s ease'
          }} />
        </div>

        {/* Live Logs */}
        {logs.length > 0 && (
          <div style={{
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border)',
            borderRadius: '0.375rem',
            padding: '0.75rem',
            maxHeight: '150px',
            overflowY: 'auto',
            fontFamily: 'monospace',
            fontSize: '0.75rem'
          }}>
            {logs.map((log, index) => (
              <div
                key={index}
                style={{
                  color: index === logs.length - 1 ? 'var(--color-fg)' : 'var(--color-fg-muted)',
                  marginBottom: '0.25rem',
                  lineHeight: 1.4
                }}
              >
                <span style={{ color: 'var(--color-fg-muted)', marginRight: '0.5rem' }}>
                  [{log.timestamp.toLocaleTimeString()}]
                </span>
                {log.message}
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        )}

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
