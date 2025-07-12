'use client';

import { useState, ReactNode } from 'react';

interface TooltipProps {
  children: ReactNode;
  text: string;
  className?: string;
  anchor?: 'center' | 'left' | 'right';
}

export default function Tooltip({
  children,
  text,
  className = '',
  anchor = 'center',
}: TooltipProps) {
  const [isHovered, setIsHovered] = useState(false);

  // We only want to show tooltips on devices that support hover (i.e., not touch screens)
  // This is a simple check, more robust solutions might be needed for edge cases
  const canHover =
    typeof window !== 'undefined' &&
    !window.matchMedia('(hover: none)').matches;

  if (!canHover) {
    return <>{children}</>;
  }

  const positionClasses = {
    center: 'left-1/2 -translate-x-1/2',
    left: 'left-0',
    right: 'right-0',
  };

  const arrowClasses = {
    center: 'left-1/2 -translate-x-1/2',
    left: 'left-2',
    right: 'right-2',
  };

  return (
    <div
      className={`relative flex items-center ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      {isHovered && (
        <div
          className={`absolute top-full z-10 mt-2 whitespace-nowrap rounded-md bg-gray-800 px-2 py-1 text-xs text-white shadow-lg dark:bg-gray-700 dark:text-gray-200 ${positionClasses[anchor]}`}
        >
          {text}
          <div
            className={`absolute -top-1 h-0 w-0 border-x-4 border-x-transparent border-b-4 border-b-gray-800 dark:border-b-gray-700 ${arrowClasses[anchor]}`}
          ></div>
        </div>
      )}
    </div>
  );
}
