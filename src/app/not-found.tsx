import Link from 'next/link';
import PageWrapper from '@/components/PageWrapper';

export default function NotFound() {
  return (
    <div>
      <PageWrapper>
        <div className="text-center py-12">
          <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">
            404
          </h1>
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Page Not Found
          </h2>
          <Link
            href="/"
            className="inline-block bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-3 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
          >
            Go back home
          </Link>
        </div>
      </PageWrapper>
    </div>
  );
}
