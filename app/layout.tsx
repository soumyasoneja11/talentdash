// RSC — React Server Component. No client-side JavaScript.
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Footer } from '@/components/Footer';
import { MainNav } from '@/components/MainNav';
import { RevealObserver } from '@/components/RevealObserver';
import { ScrollToTop } from '@/components/ScrollToTop';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'TalentDash',
  description: 'Salary transparency and compensation insights',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.ReactElement {
  return (
    <html lang="en" className={inter.className}>
      <body className="flex min-h-screen flex-col bg-app-bg">
        <MainNav />

        <main className="flex-1 pt-16">{children}</main>
        <Footer />
        <ScrollToTop />
        <RevealObserver />
      </body>
    </html>
  );
}
