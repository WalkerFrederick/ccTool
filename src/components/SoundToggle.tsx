'use client';

import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import { useSound } from '@/utils/sounds';
import Tooltip from './Tooltip';

export default function SoundToggle({
  tooltipAnchor = 'center',
}: {
  tooltipAnchor?: 'center' | 'left' | 'right';
}) {
  const { soundState, toggleSound } = useSiteSettings();
  const { playSoundOnUnmute } = useSound();

  const handleClick = () => {
    // Only play the sound when unmuting
    if (soundState === 'muted') {
      playSoundOnUnmute();
    }
    toggleSound();
  };

  const tooltipText = `${soundState === 'unmuted' ? 'Mute' : 'Unmute'} sound`;

  return (
    <Tooltip text={tooltipText} anchor={tooltipAnchor}>
      <button
        onClick={handleClick}
        className="w-6 h-6 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        aria-label={tooltipText}
      >
        {soundState === 'unmuted' ? (
          // Volume up icon for unmuted
          <svg
            className="w-4 h-4 mx-auto my-1 text-gray-700 dark:text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
            />
          </svg>
        ) : (
          // Volume off icon for muted
          <svg
            className="w-4 h-4 mx-auto my-1 text-gray-700 dark:text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
            />
          </svg>
        )}
      </button>
    </Tooltip>
  );
}
