// RSC — React Server Component. No client-side JavaScript.
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
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

const NAV_LINKS = [
  { href: '/salaries', label: 'Salaries' },
  { href: '/companies', label: 'Companies' },
  { href: '/compare', label: 'Compare' },
  { href: '/tools', label: 'Tools' },
] as const;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.ReactElement {
  return (
    <html lang="en" className={inter.className}>
      <body className="min-h-screen bg-app-bg">
        <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex h-12 w-[min(800px,100%-2rem)] items-center justify-between border border-border/60 bg-surface/90 backdrop-blur-md px-6 rounded-full shadow-md shadow-neutral/5 transition-all">
          <Link
            href="/"
            className="text-sm font-bold text-airbnb tracking-tight hover:opacity-80 transition-opacity"
          >
            <span className="text-coral">T</span>alentDash
          </Link>

          <div className="flex items-center gap-5">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs font-semibold text-soft-dark hover:text-airbnb transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <Link
            href="/submit"
            className="rounded-full bg-coral px-3.5 py-1.5 text-xs font-bold text-white shadow-sm shadow-coral/10 hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            Submit
          </Link>
        </nav>

        <main className="min-h-screen pt-24">{children}</main>
      </body>
    </html>
  );
}
