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
        <nav className="animate-fade-in fixed top-4 left-1/2 -translate-x-1/2 z-50 flex h-12 w-[min(800px,100%-2rem)] items-center justify-between border border-teal-brand/20 bg-surface/95 backdrop-blur-md px-6 rounded-full shadow-md shadow-neutral/5 transition-all">
          <Link
            href="/"
            className="text-sm font-bold text-airbnb tracking-tight hover:opacity-80 transition-opacity"
          >
            <span className="text-teal-brand">T</span>alentDash
          </Link>

          <div className="flex items-center gap-5">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="animated-link text-xs font-semibold text-soft-dark hover:text-airbnb transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <Link
            href="/submit"
            className="rounded-full bg-teal-brand px-3.5 py-1.5 text-xs font-bold text-white shadow-sm shadow-teal-brand/20 hover:bg-deep-teal transition-colors duration-200 whitespace-nowrap"
          >
            Submit
          </Link>
        </nav>

        <main className="min-h-screen pt-24">{children}</main>

        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            var io = new IntersectionObserver(function(entries) {
              entries.forEach(function(e) {
                if (e.isIntersecting) {
                  e.target.classList.add('revealed');
                  io.unobserve(e.target);
                }
              });
            }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
            function observe() {
              document.querySelectorAll('.reveal').forEach(function(el) { io.observe(el); });
            }
            if (document.readyState === 'loading') {
              document.addEventListener('DOMContentLoaded', observe);
            } else {
              observe();
            }
          })();
        ` }} />
      </body>
    </html>
  );
}
