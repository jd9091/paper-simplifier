import type { Metadata } from 'next';
import { JetBrains_Mono } from 'next/font/google';
import './globals.css';
import ThemeProvider from '@/components/ThemeProvider';
import SettingsPanel from '@/components/SettingsPanel';

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'Paper Simplifier',
  description: 'Simplify academic papers with AI-powered analysis and visualization',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${jetbrainsMono.variable}`} style={{
        fontFamily: 'var(--font-mono), ui-monospace, monospace',
        backgroundColor: 'var(--color-bg)',
        color: 'var(--color-fg)',
        minHeight: '100vh'
      }}>
        <ThemeProvider>
          <SettingsPanel />
          <div style={{
            minHeight: '100vh',
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '2rem 1.5rem',
            backgroundColor: 'var(--color-bg)'
          }}>
            <header style={{
              marginBottom: '2.5rem',
              paddingBottom: '1.5rem',
              borderBottom: '1px solid var(--color-border)'
            }}>
              <a href="/" style={{ textDecoration: 'none' }}>
                <h1 style={{
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  letterSpacing: '-0.025em',
                  marginBottom: '0.375rem'
                }}>
                  PAPER SIMPLIFIER
                </h1>
              </a>
              <p style={{
                fontSize: '0.875rem',
                color: 'var(--color-fg-muted)'
              }}>
                Transform academic papers into clear, digestible content
              </p>
            </header>
            <main>
              {children}
            </main>
            <footer style={{
              marginTop: '4rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid var(--color-border)',
              textAlign: 'center',
              fontSize: '0.75rem',
              color: 'var(--color-fg-muted)'
            }}>
              Powered by Claude AI • Built for understanding research
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
