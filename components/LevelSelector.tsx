'use client';

import { UserLevel, USER_LEVELS } from '@/lib/types';

interface LevelSelectorProps {
  selectedLevel: UserLevel;
  onLevelChange: (level: UserLevel) => void;
}

export default function LevelSelector({ selectedLevel, onLevelChange }: LevelSelectorProps) {
  return (
    <div className="section-container">
      <h3 className="section-title">Select Your Knowledge Level</h3>
      <p style={{ color: 'var(--color-fg-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>
        Choose how the paper should be simplified for you
      </p>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '0.75rem'
      }}>
        {USER_LEVELS.map((level) => (
          <button
            key={level.value}
            type="button"
            onClick={() => onLevelChange(level.value)}
            className={`level-btn ${selectedLevel === level.value ? 'selected' : ''}`}
          >
            <div style={{ fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.9375rem' }}>
              {level.label}
            </div>
            <div style={{
              fontSize: '0.75rem',
              opacity: selectedLevel === level.value ? 0.9 : 0.7,
              lineHeight: 1.4
            }}>
              {level.description}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
