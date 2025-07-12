import PageWrapper from './PageWrapper';
import Link from 'next/link';

export default function HeroHeader() {
  return (
    <div className="relative z-10 w-full">
      <PageWrapper>
        <div className="p-8 border border-gray-200 dark:border-gray-700 rounded-lg text-center">
          <div className="flex flex-col md:flex-row md:gap-8 lg:gap-8 items-stretch">
            {/* Left column: text content */}
            <div className="md:w-1/2 lg:w-3/5 w-full mt-10 mb-10 text-center md:text-left">
              <h1 className="text-4xl lg:text-6xl font-black text-gray-900 dark:text-white mb-4">
                Welcome to ccTool
              </h1>
              <p className="text-3xl font-bold text-gray-700 dark:text-gray-200 mb-4 max-w-2xl mx-auto md:mx-0">
                The Unofficial Centuri Carbon Companion!
              </p>
              <p className="text-lg text-gray-700 dark:text-gray-200 max-w-xl mx-auto md:mx-0 mb-4">
                A powerful and modern tool built with Next.js, React, and TypeScript.
              </p>
              <p className="text-lg text-gray-700 dark:text-gray-200 max-w-xl mx-auto md:mx-0">
                Start building your amazing application with this clean, scalable foundation.
              </p>
              {/* CTA Button */}
              <div className="mt-8">
                <Link
                  href="/coming-soon"
                  className="bg-[var(--color-purple-500)] hover:bg-[var(--color-purple-600)] text-white dark:bg-[var(--color-purple-400)] dark:hover:bg-[var(--color-purple-300)] dark:text-gray-900 px-6 py-3 rounded-lg transition-colors font-semibold cursor-pointer"
                >
                  Get Started
                </Link>
              </div>
            </div>
            {/* Right column: placeholder */}
            <div className="hidden md:w-1/2 lg:w-2/5 w-full mt-12 md:mt-0 flex-1">
              {/* Placeholder for future content (image, illustration, etc.) */}
              <div className="w-full h-full bg-gray-100 dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-400">
                Right Side
              </div>
            </div>
          </div>
        </div>
      </PageWrapper>
    </div>
  );
}
