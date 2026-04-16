import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const ThemeToggle = () => {
  const [theme, setTheme] = useState(
    localStorage.getItem('theme') || 'light'
  );

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <button
      onClick={toggleTheme}
      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 ${
        theme === 'dark' ? 'bg-emerald-900 border border-emerald-700/50' : 'bg-slate-200 border border-slate-300'
      }`}
      aria-label="Toggle Dark Mode"
    >
      <span className="sr-only">Toggle theme</span>
      <motion.span
        initial={false}
        animate={{
          x: theme === 'dark' ? 24 : 4,
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="inline-flex h-6 w-6 transform items-center justify-center rounded-full bg-white shadow-sm ring-0 transition-transform"
      >
        {theme === 'dark' ? (
          <svg className="h-3.5 w-3.5 text-emerald-800" fill="currentColor" viewBox="0 0 20 20">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
          </svg>
        ) : (
          <svg className="h-3.5 w-3.5 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
              clipRule="evenodd"
            ></path>
          </svg>
        )}
      </motion.span>
    </button>
  );
};

export default ThemeToggle;
