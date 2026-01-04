'use client';

import { useEffect, useState } from 'react';

export default function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight - windowHeight;
      const scrolled = window.scrollY;
      const progress = documentHeight > 0 ? (scrolled / documentHeight) * 100 : 0;
      setProgress(Math.min(100, Math.max(0, progress)));
    };

    // Initial calculation
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '3px',
      background: 'var(--color-border)',
      zIndex: 100
    }}>
      <div style={{
        height: '100%',
        background: 'var(--color-success)',
        width: `${progress}%`,
        transition: 'width 0.1s ease',
        boxShadow: progress > 0 ? '0 0 10px var(--color-success)' : 'none'
      }} />
    </div>
  );
}
