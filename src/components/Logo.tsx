import Link from 'next/link';

interface LogoProps {
  className?: string;
  onClick?: () => void;
}

export default function Logo({ className = '', onClick }: LogoProps) {
  return (
    <Link
      href="/"
      className={`text-xl font-bold text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300 transition-colors ${className}`}
      onClick={onClick}
    >
      ccTool
    </Link>
  );
}
