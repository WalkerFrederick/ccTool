'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import SoundToggle from './SoundToggle';

const navigationLinks = [
  { href: '/coming-soon', label: 'Features', key: 'features' },
  { href: '/coming-soon', label: 'About', key: 'about' },
  { href: '/coming-soon', label: 'Documentation', key: 'docs' },
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Prevent body scrolling when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to restore scrolling when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      <nav className="sticky top-0 z-40 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm supports-[backdrop-filter]:bg-white/60 supports-[backdrop-filter]:dark:bg-gray-900/60">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Left side - Site title/logo */}
            <div className="flex items-center">
              <Logo />
            </div>

            {/* Right side - Desktop Navigation links */}
            <div className="hidden md:flex items-center space-x-8">
              {navigationLinks.map(link => (
                <Link
                  key={link.key || link.href}
                  href={link.href}
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex items-center space-x-4">
                {/* Vertical divider */}
                <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
                <div className="flex items-center space-x-2">
                  <ThemeToggle tooltipAnchor="right" />
                  <SoundToggle tooltipAnchor="right" />
                </div>
              </div>
            </div>

            {/* Hamburger menu button - Mobile only */}
            <div className="md:hidden">
              <button
                onClick={toggleMenu}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none focus:text-gray-900 dark:focus:text-white"
                aria-label="Toggle menu"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile slideout menu - Only render on client */}
      {isMounted && (
        <div
          className={`fixed inset-0 z-50 md:hidden transition-opacity duration-300 ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        >
          {/* Backdrop */}
          <div
            className={`fixed inset-0 bg-black transition-opacity duration-300 ${isMenuOpen ? 'opacity-50' : 'opacity-0'}`}
            onClick={closeMenu}
          />

          {/* Slideout panel */}
          <div
            className={`fixed right-0 top-0 h-full w-5/6 max-w-sm bg-white dark:bg-gray-900 shadow-lg transform transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <Logo onClick={closeMenu} />
                <button
                  onClick={closeMenu}
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none"
                  aria-label="Close menu"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Navigation links */}
              <nav className="flex-1 p-4">
                <div className="space-y-4">
                  {navigationLinks.map(link => (
                    <Link
                      key={link.key || link.href}
                      href={link.href}
                      className="block text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors py-2"
                      onClick={closeMenu}
                    >
                      {link.label}
                    </Link>
                  ))}
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between py-2 mb-2">
                      <span className="text-gray-600 dark:text-gray-300">
                        Sound
                      </span>
                      <SoundToggle tooltipAnchor="right" />
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-gray-600 dark:text-gray-300">
                        Theme
                      </span>
                      <ThemeToggle tooltipAnchor="right" />
                    </div>
                  </div>
                </div>
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
