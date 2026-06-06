// RSC — React Server Component. No client-side JavaScript.
import Link from 'next/link';
import type { Company } from '@/types/salary';
import { CompanyLogo } from '@/components/ui/CompanyLogo';
import { CompanyFollowButton } from '@/components/features/CompanyFollowButton';

export interface CompanyHeaderProps {
  company: Company;
  recordCount: number;
}

export const CompanyHeader = ({
  company,
  recordCount,
}: CompanyHeaderProps): React.ReactElement => {
  const rating = company.rating ?? 4.2;

  // Star rendering helper
  const renderStars = (r: number) => {
    const stars = [];
    const fullStars = Math.floor(r);
    const hasHalf = r % 1 >= 0.25 && r % 1 < 0.75;
    const hasExtraFull = r % 1 >= 0.75;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<i key={i} className="ti ti-star-filled text-warning text-sm" />);
      } else if (i === fullStars + 1 && hasHalf) {
        stars.push(<i key={i} className="ti ti-star-half-filled text-warning text-sm" />);
      } else if (i === fullStars + 1 && hasExtraFull) {
        stars.push(<i key={i} className="ti ti-star-filled text-warning text-sm" />);
      } else {
        stars.push(<i key={i} className="ti ti-star text-neutral-200 text-sm" />);
      }
    }
    return stars;
  };

  return (
    <header className="bg-surface border-b border-border px-6 py-6 md:py-8">
      <div className="mx-auto max-w-7xl">
        {/* Integrated Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="text-xs font-semibold text-neutral mb-6"
        >
          <ol className="flex flex-wrap items-center gap-1">
            <li>
              <Link href="/" className="animated-link hover:text-airbnb transition-colors">
                Home
              </Link>
            </li>
            <li aria-hidden="true" className="text-neutral/60">
              &gt;
            </li>
            <li>
              <Link
                href="/companies"
                className="animated-link hover:text-airbnb transition-colors"
              >
                Companies
              </Link>
            </li>
            <li aria-hidden="true" className="text-neutral/60">
              &gt;
            </li>
            <li className="text-soft-dark" aria-current="page">
              {company.name}
            </li>
          </ol>
        </nav>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Logo and Name Info */}
          <div className="flex items-start gap-4 min-w-0">
            <div className="w-12 h-12 flex items-center justify-center rounded-xl border border-border overflow-hidden bg-white shrink-0 shadow-sm">
              <CompanyLogo
                companyName={company.name}
                companySlug={company.slug}
                size="lg"
              />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-3xl font-bold text-airbnb tracking-tight">
                  {company.name}
                </h1>
                {/* Verified badge inline */}
                <span className="inline-flex items-center text-coral" title="Verified employer brand">
                  <i className="ti ti-square-rounded-check-filled text-xl" />
                </span>
              </div>

              {/* Subtitle Line */}
              <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-neutral">
                {company.industry && (
                  <>
                    <span className="rounded-full bg-coral-subtle px-2 py-0.5 text-xs font-medium text-coral">
                      {company.industry}
                    </span>
                    <span>·</span>
                  </>
                )}
                <span>{company.headquarters || 'India'}</span>
                <span>·</span>
                <span>{company.headcount_range || '10,000+ employees'}</span>
              </div>

              {/* Rating Section */}
              <div className="flex items-center gap-1 mt-3">
                {renderStars(rating)}
                <span className="text-sm font-semibold text-airbnb ml-1">
                  {rating.toFixed(1)}
                </span>
                <span className="text-sm text-neutral">
                  · {recordCount} {recordCount === 1 ? 'Salary' : 'Salaries'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href={`/compare?c1=${encodeURIComponent(company.slug)}`}
              className="inline-flex items-center justify-center rounded-lg border border-coral px-4 py-2 text-sm font-bold text-coral transition hover:bg-coral hover:text-white cursor-pointer"
            >
              Compare
            </Link>
            <CompanyFollowButton
              companySlug={company.slug}
              companyName={company.name}
            />
          </div>
        </div>
      </div>
    </header>
  );
};
