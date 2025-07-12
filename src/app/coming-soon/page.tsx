import PageWrapper from '@/components/PageWrapper';

export default function ComingSoonPage() {
  return (
    <PageWrapper>
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Coming Soon
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 text-center max-w-md">
          This page is under construction. Check back soon for updates!
        </p>
      </div>
    </PageWrapper>
  );
}
