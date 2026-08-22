import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeType = 'aura' | 'voltura' | 'tangerine' | 'indigo';

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (t: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeType>(() => {
    return (localStorage.getItem('dayflow_theme_preset') as ThemeType) || 'aura';
  });

  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme);
    localStorage.setItem('dayflow_theme_preset', newTheme);
  };

  useEffect(() => {
    document.body.classList.remove('theme-aura', 'theme-voltura', 'theme-tangerine', 'theme-indigo');
    document.body.classList.add(`theme-${theme}`);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
};
