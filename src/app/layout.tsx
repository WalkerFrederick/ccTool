import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SiteSettingsProvider } from '@/contexts/SiteSettingsContext';
import AlertHeader from '@/components/AlertHeader';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'ccTool',
  description: 'A powerful tool for your needs',
  keywords: ['tool', 'utility', 'web application'],
  authors: [{ name: 'ccTool Team' }],
  creator: 'ccTool',
  openGraph: {
    title: 'ccTool',
    description: 'A powerful tool for your needs',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary',
    title: 'ccTool',
    description: 'A powerful tool for your needs',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  var systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  var finalTheme = theme || systemTheme;
                  
                  if (finalTheme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <SiteSettingsProvider>
          <AlertHeader />
          <Navbar />
          <main className="flex flex-col min-h-screen">{children}</main>
          <Footer />
        </SiteSettingsProvider>
      </body>
    </html>
  );
}
