'use client';

import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import { useSound } from '@/utils/sounds';
import Tooltip from './Tooltip';

export default function ThemeToggle({
  tooltipAnchor = 'center',
}: {
  tooltipAnchor?: 'center' | 'left' | 'right';
}) {
  const { theme, toggleTheme } = useSiteSettings();
  const { playClickSound } = useSound();

  const handleClick = () => {
    playClickSound();
    toggleTheme();
  };

  const tooltipText = `Switch to ${theme === 'light' ? 'dark' : 'light'} mode`;

  return (
    <Tooltip text={tooltipText} anchor={tooltipAnchor}>
      <button
        onClick={handleClick}
        className="w-6 h-6 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        aria-label={tooltipText}
      >
        {theme === 'light' ? (
          // Moon icon for dark mode
          <svg
            className="w-4 h-4 mx-auto my-1 text-gray-700"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
        ) : (
          // Sun icon for light mode
          <svg
            className="w-4 h-4 mx-auto my-1 text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        )}
      </button>
    </Tooltip>
  );
}
