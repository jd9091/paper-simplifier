'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';
type FontSize = 'small' | 'medium' | 'large';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  resolvedTheme: 'light' | 'dark';
}

// Default context value for SSR
const defaultContextValue: ThemeContextType = {
  theme: 'system',
  setTheme: () => {},
  fontSize: 'medium',
  setFontSize: () => {},
  resolvedTheme: 'light',
};

const ThemeContext = createContext<ThemeContextType>(defaultContextValue);

export function useTheme() {
  const context = useContext(ThemeContext);
  return context;
}

interface ThemeProviderProps {
  children: ReactNode;
}

export default function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [fontSize, setFontSizeState] = useState<FontSize>('medium');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  // Load saved preferences on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const savedFontSize = localStorage.getItem('fontSize') as FontSize | null;

    if (savedTheme) setThemeState(savedTheme);
    if (savedFontSize) setFontSizeState(savedFontSize);

    setMounted(true);
  }, []);

  // Handle theme changes
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;

    const getResolvedTheme = (): 'light' | 'dark' => {
      if (theme === 'system') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      return theme;
    };

    const applyTheme = () => {
      const resolved = getResolvedTheme();
      setResolvedTheme(resolved);
      root.setAttribute('data-theme', resolved);
    };

    applyTheme();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme();
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, mounted]);

  // Handle font size changes
  useEffect(() => {
    if (!mounted) return;
    document.documentElement.setAttribute('data-font-size', fontSize);
  }, [fontSize, mounted]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const setFontSize = (newSize: FontSize) => {
    setFontSizeState(newSize);
    localStorage.setItem('fontSize', newSize);
  };

  // Prevent flash of unstyled content
  if (!mounted) {
    return (
      <div style={{ visibility: 'hidden' }}>
        {children}
      </div>
    );
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, fontSize, setFontSize, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
