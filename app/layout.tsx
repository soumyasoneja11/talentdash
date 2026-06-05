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
        <nav className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-surface px-6">
          <Link href="/" className="text-lg font-bold text-airbnb">
            <span className="text-coral">T</span>alentDash
          </Link>

          <div className="flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-soft-dark hover:text-airbnb"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <Link
            href="/submit"
            className="rounded-lg bg-coral px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Submit Salary
          </Link>
        </nav>

        <main className="min-h-screen pt-14">{children}</main>
      </body>
    </html>
  );
}
