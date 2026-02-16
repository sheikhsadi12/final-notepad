import React, { createContext, useContext, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Theme, AccentColor, ThemeContextType, VoiceName } from '../types';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useLocalStorage<Theme>('stn-theme', 'dark');
  const [accent, setAccent] = useLocalStorage<AccentColor>('stn-accent', 'emerald');
  const [voice, setVoice] = useLocalStorage<VoiceName>('stn-voice', 'Kore');

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const getAccentColorClass = (type: 'text' | 'bg' | 'border' | 'ring' | 'hover-bg' | 'hover-text') => {
    const map: Record<AccentColor, Record<string, string>> = {
      emerald: {
        text: 'text-emerald-500',
        bg: 'bg-emerald-500',
        border: 'border-emerald-500',
        ring: 'ring-emerald-500',
        'hover-bg': 'hover:bg-emerald-600',
        'hover-text': 'hover:text-emerald-400',
      },
      blue: {
        text: 'text-blue-500',
        bg: 'bg-blue-500',
        border: 'border-blue-500',
        ring: 'ring-blue-500',
        'hover-bg': 'hover:bg-blue-600',
        'hover-text': 'hover:text-blue-400',
      },
      rose: {
        text: 'text-rose-500',
        bg: 'bg-rose-500',
        border: 'border-rose-500',
        ring: 'ring-rose-500',
        'hover-bg': 'hover:bg-rose-600',
        'hover-text': 'hover:text-rose-400',
      },
    };
    return map[accent][type];
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, accent, setAccent, getAccentColorClass, voice, setVoice }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};