'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { href: '/salaries', label: 'Salaries' },
  { href: '/companies', label: 'Companies' },
  { href: '/compare', label: 'Compare' },
  { href: '/tools', label: 'Tools' },
] as const;

const isLinkActive = (pathname: string, href: string): boolean => {
  if (href === '/') {
    return pathname === '/';
  }
  return pathname === href || pathname.startsWith(`${href}/`);
};

export const MainNav = (): React.ReactElement => {
  const pathname = usePathname();

  return (
    <header className="animate-fade-in fixed inset-x-0 top-0 z-50 border-b border-border/70 bg-surface/95 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 transition-opacity hover:opacity-80"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-coral text-sm font-bold text-white">
            T
          </span>
          <span className="text-base font-bold tracking-tight text-airbnb">
            TalentDash
          </span>
        </Link>

        <nav
          aria-label="Main navigation"
          className="flex min-w-0 flex-1 items-center justify-center gap-1 overflow-x-auto scrollbar-hide sm:gap-2"
        >
          {NAV_LINKS.map((link) => {
            const active = isLinkActive(pathname, link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? 'page' : undefined}
                className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
                  active
                    ? 'border border-coral/25 bg-coral-subtle text-coral shadow-sm'
                    : 'text-soft-dark hover:bg-hover hover:text-airbnb'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <Link
          href="/submit"
          className="shrink-0 rounded-full bg-coral px-4 py-2 text-sm font-bold text-white shadow-sm shadow-coral/20 transition-colors hover:bg-coral-dark"
        >
          Submit
        </Link>
      </div>
    </header>
  );
};
