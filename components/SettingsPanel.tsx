'use client';

import { useState, useEffect } from 'react';
import { useTheme } from './ThemeProvider';

export default function SettingsPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, fontSize, setFontSize, resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const themes = [
    { value: 'light', label: 'Light', icon: '○' },
    { value: 'dark', label: 'Dark', icon: '●' },
    { value: 'system', label: 'System', icon: '◐' },
  ] as const;

  const fontSizes = [
    { value: 'small', label: 'S' },
    { value: 'medium', label: 'M' },
    { value: 'large', label: 'L' },
  ] as const;

  return (
    <>
      {/* Settings Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          left: '1.5rem',
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
          transition: 'all 0.15s ease',
          zIndex: 50,
          fontSize: '1.125rem'
        }}
        title="Settings"
      >
        {isOpen ? '×' : '⚙'}
      </button>

      {/* Settings Panel */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '5rem',
          left: '1.5rem',
          width: '220px',
          background: 'var(--color-bg)',
          border: '1px solid var(--color-border)',
          borderRadius: '0.5rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          zIndex: 50,
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            padding: '0.75rem 1rem',
            borderBottom: '1px solid var(--color-border)',
            background: 'var(--color-hover)'
          }}>
            <div style={{
              fontSize: '0.6875rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'var(--color-fg-muted)'
            }}>
              Settings
            </div>
          </div>

          <div style={{ padding: '1rem' }}>
            {/* Theme Selection */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{
                fontSize: '0.75rem',
                color: 'var(--color-fg-muted)',
                marginBottom: '0.5rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Theme
              </div>
              <div style={{
                display: 'flex',
                gap: '0.25rem',
                background: 'var(--color-hover)',
                padding: '0.25rem',
                borderRadius: '0.375rem'
              }}>
                {themes.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setTheme(t.value)}
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      background: theme === t.value ? 'var(--color-bg)' : 'transparent',
                      border: theme === t.value ? '1px solid var(--color-border)' : '1px solid transparent',
                      borderRadius: '0.25rem',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      color: theme === t.value ? 'var(--color-fg)' : 'var(--color-fg-muted)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.25rem',
                      transition: 'all 0.1s ease'
                    }}
                  >
                    <span style={{ fontSize: '0.875rem' }}>{t.icon}</span>
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size Selection */}
            <div>
              <div style={{
                fontSize: '0.75rem',
                color: 'var(--color-fg-muted)',
                marginBottom: '0.5rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Font Size
              </div>
              <div style={{
                display: 'flex',
                gap: '0.25rem',
                background: 'var(--color-hover)',
                padding: '0.25rem',
                borderRadius: '0.375rem'
              }}>
                {fontSizes.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setFontSize(f.value)}
                    style={{
                      flex: 1,
                      padding: '0.5rem 0.75rem',
                      background: fontSize === f.value ? 'var(--color-bg)' : 'transparent',
                      border: fontSize === f.value ? '1px solid var(--color-border)' : '1px solid transparent',
                      borderRadius: '0.25rem',
                      cursor: 'pointer',
                      fontSize: f.value === 'small' ? '0.6875rem' : f.value === 'large' ? '0.9375rem' : '0.8125rem',
                      fontWeight: 600,
                      color: fontSize === f.value ? 'var(--color-fg)' : 'var(--color-fg-muted)',
                      transition: 'all 0.1s ease'
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Current status */}
            <div style={{
              marginTop: '1rem',
              paddingTop: '1rem',
              borderTop: '1px solid var(--color-border)',
              fontSize: '0.6875rem',
              color: 'var(--color-fg-muted)',
              textAlign: 'center'
            }}>
              {resolvedTheme === 'dark' ? '●' : '○'} {resolvedTheme.charAt(0).toUpperCase() + resolvedTheme.slice(1)} mode
            </div>
          </div>
        </div>
      )}
    </>
  );
}
