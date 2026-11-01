import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext(null);

const STORAGE_KEY = 'maalhub_theme';

export const ThemeProvider = ({ children }) => {
  // Theme can be 'light', 'dark', or 'system'
  const [theme, setThemeState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'dark' || saved === 'light' || saved === 'system') {
        return saved;
      }
    } catch (e) {
      // Ignore localStorage access issues
    }
    return 'light';
  });

  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'dark') return true;
      if (saved === 'light') return false;
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch (e) {
      return false;
    }
  });

  // Apply theme to DOM
  const applyTheme = useCallback((darkActive) => {
    const root = document.documentElement;
    if (darkActive) {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
  }, []);

  // Update DOM and state when theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const resolveIsDark = () => {
      if (theme === 'dark') return true;
      if (theme === 'light') return false;
      return mediaQuery.matches;
    };

    const currentDark = resolveIsDark();
    setIsDark(currentDark);
    applyTheme(currentDark);

    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {}

    const handleSystemChange = (e) => {
      if (theme === 'system') {
        setIsDark(e.matches);
        applyTheme(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleSystemChange);
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, [theme, applyTheme]);

  // Toggle between light and dark
  const toggleTheme = useCallback(() => {
    setThemeState((prevTheme) => {
      // If currently dark, switch to light; otherwise dark
      const nextTheme = isDark ? 'light' : 'dark';
      return nextTheme;
    });
  }, [isDark]);

  // Set specific theme: 'light' | 'dark' | 'system'
  const setTheme = useCallback((newTheme) => {
    if (newTheme === 'light' || newTheme === 'dark' || newTheme === 'system') {
      setThemeState(newTheme);
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
