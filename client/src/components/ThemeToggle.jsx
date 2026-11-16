import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export const ThemeToggle = ({ 
  variant = 'button', // 'button' | 'segmented' | 'switch'
  className = '',
  showLabel = false 
}) => {
  const { theme, isDark, toggleTheme, setTheme } = useTheme();

  // Segmented control (useful in Settings)
  if (variant === 'segmented') {
    return (
      <div className={`inline-flex items-center p-1 rounded-xl bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 ${className}`}>
        <button
          type="button"
          onClick={() => setTheme('light')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            theme === 'light'
              ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-xs'
              : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
          }`}
          title="Light theme"
        >
          <Sun size={14} className={theme === 'light' ? 'text-amber-500' : ''} />
          <span>Light</span>
        </button>

        <button
          type="button"
          onClick={() => setTheme('dark')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            theme === 'dark'
              ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-xs'
              : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
          }`}
          title="Dark theme"
        >
          <Moon size={14} className={theme === 'dark' ? 'text-indigo-400' : ''} />
          <span>Dark</span>
        </button>

        <button
          type="button"
          onClick={() => setTheme('system')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            theme === 'system'
              ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-xs'
              : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
          }`}
          title="Follow system preference"
        >
          <Monitor size={14} />
          <span>System</span>
        </button>
      </div>
    );
  }

  // Switch pill variant (e.g., inside mobile drawer)
  if (variant === 'switch') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700/80 bg-gray-50/80 dark:bg-slate-800/80 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700/80 transition-all ${className}`}
        aria-label="Toggle theme"
      >
        <div className="flex items-center gap-2.5 text-sm font-medium">
          {isDark ? (
            <Moon size={18} className="text-indigo-400" />
          ) : (
            <Sun size={18} className="text-amber-500" />
          )}
          <span>{isDark ? 'Dark Mode' : 'Light Mode'}</span>
        </div>
        <div className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${
          isDark ? 'bg-primary justify-end' : 'bg-gray-300 justify-start'
        }`}>
          <div className="w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-300" />
        </div>
      </button>
    );
  }

  // Default: Sleek icon button (for navbar)
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative inline-flex items-center justify-center p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 border border-transparent hover:border-gray-200 dark:hover:border-slate-700 transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer group ${className}`}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        {isDark ? (
          <Sun 
            className="w-5 h-5 text-amber-400 transform transition-transform duration-300 rotate-0 group-hover:rotate-45" 
          />
        ) : (
          <Moon 
            className="w-5 h-5 text-gray-600 dark:text-gray-300 transform transition-transform duration-300 rotate-0 group-hover:-rotate-12" 
          />
        )}
      </div>
      {showLabel && (
        <span className="ml-2 text-xs font-semibold">
          {isDark ? 'Light' : 'Dark'}
        </span>
      )}
    </button>
  );
};

export default ThemeToggle;
