// RSC — React Server Component. No client-side JavaScript.
import Link from 'next/link';

const EXPLORE_LINKS = [
  { href: '/salaries', label: 'Salaries' },
  { href: '/companies', label: 'Companies' },
  { href: '/compare', label: 'Compare' },
  { href: '/tools', label: 'Tools' },
] as const;

const TOOL_LINKS = [
  { href: '/tools/salary-calculator', label: 'Salary Calculator' },
  { href: '/tools/hike-calculator', label: 'Hike Calculator' },
  { href: '/submit', label: 'Submit Salary' },
] as const;

export const Footer = (): React.ReactElement => {
  return (
    <footer className="mt-auto border-t border-border/60 bg-surface/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <Link
              href="/"
              className="text-sm font-bold text-airbnb tracking-tight hover:opacity-80 transition-opacity"
            >
              <span className="text-coral">T</span>alentDash
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-neutral">
              Real salary data for Indian tech. Compare compensation, explore
              companies, and make career decisions with confidence.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-coral">
              Explore
            </h3>
            <ul className="mt-4 space-y-2">
              {EXPLORE_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="animated-link text-sm font-medium text-soft-dark transition-colors hover:text-airbnb"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-coral">
              Tools
            </h3>
            <ul className="mt-4 space-y-2">
              {TOOL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="animated-link text-sm font-medium text-soft-dark transition-colors hover:text-airbnb"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-coral">
              Contribute
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-neutral">
              Help build salary transparency for everyone in Indian tech.
            </p>
            <Link
              href="/submit"
              className="mt-4 inline-flex rounded-full bg-coral px-4 py-2 text-xs font-bold text-white shadow-sm shadow-coral/20 transition-colors hover:bg-coral-dark"
            >
              Submit your salary
            </Link>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border/60 pt-6 sm:flex-row">
          <p className="text-xs text-neutral">
            © {new Date().getFullYear()} TalentDash. All rights reserved.
          </p>
          <p className="text-xs text-neutral">
            Data is anonymized and for informational purposes only.
          </p>
        </div>
      </div>
    </footer>
  );
};
