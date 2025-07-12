import { ReactNode } from 'react';

interface PageWrapperProps {
  children: ReactNode;
  className?: string;
}

export default function PageWrapper({
  children,
  className = '',
}: PageWrapperProps) {
  return (
    <div className={`max-w-6xl mx-auto px-4 py-8 ${className}`}>{children}</div>
  );
}
