// RSC — React Server Component. No client-side JavaScript.
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  SALARY_RECORDS,
  COMPANIES,
  getSalariesByCompanySlug,
} from '@/lib/mock-data';
import { formatCurrency, computeMedian } from '@/lib/utils';
import { LevelBadge } from '@/components/ui/LevelBadge';
import { CompanyLogo } from '@/components/ui/CompanyLogo';
import type { SalaryRecord } from '@/types/salary';

export const metadata: Metadata = {
  title:
    'TalentDash — Real Salary Data for Indian Tech | Software Engineer Compensation',
  description:
    'Make career decisions with real data. Browse verified salary data for Software Engineers, Product Managers, and more at top tech companies in India. Level-by-level compensation from L3 to Principal.',
  openGraph: {
    title: 'TalentDash — Real Salary Data for Indian Tech',
    description:
      'Verified compensation data covering 52+ salary records across 12+ companies in 8+ Indian cities.',
    url: 'https://talentdash.com',
    type: 'website',
  },
};

/* ------------------------------------------------------------------ */
/*  Data helpers (pure functions, no client JS)                       */
/* ------------------------------------------------------------------ */

type CompanyCard = {
  slug: string;
  name: string;
  medianTC: number;
  recordCount: number;
};

const buildPopularCompanies = (): CompanyCard[] => {
  const cards: CompanyCard[] = [];

  for (const company of COMPANIES) {
    const records = getSalariesByCompanySlug(company.slug);
    // Only include companies with real Indian presence & enough data
    const inrRecords = records.filter((r) => r.currency === 'INR');
    if (inrRecords.length < 2) continue;

    const tcs = inrRecords.map((r) => r.total_compensation);
    cards.push({
      slug: company.slug,
      name: company.name,
      medianTC: computeMedian(tcs),
      recordCount: records.length,
    });
  }

  return cards
    .sort((a, b) => b.recordCount - a.recordCount)
    .slice(0, 8);
};

type HighPayRow = {
  rank: number;
  company: string;
  companySlug: string;
  role: string;
  level: SalaryRecord['level_standardized'];
  tc: number;
};

const buildHighestPaying = (): HighPayRow[] => {
  // Only INR records for comparability
  const inrRecords = SALARY_RECORDS.filter((r) => r.currency === 'INR');
  const sorted = [...inrRecords].sort(
    (a, b) => b.total_compensation - a.total_compensation
  );

  return sorted.slice(0, 6).map((r, i) => ({
    rank: i + 1,
    company: r.company_display,
    companySlug: r.company_slug,
    role: r.role,
    level: r.level_standardized,
    tc: r.total_compensation,
  }));
};

const getSalaryRange = (): { min: string; max: string } => {
  const inrRecords = SALARY_RECORDS.filter((r) => r.currency === 'INR');
  const tcs = inrRecords.map((r) => r.total_compensation);
  return {
    min: formatCurrency(Math.min(...tcs), 'INR', 'INR', { compact: true }),
    max: formatCurrency(Math.max(...tcs), 'INR', 'INR', { compact: true }),
  };
};

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

export default function HomePage(): React.ReactElement {
  const totalRecords = SALARY_RECORDS.length;
  const verifiedRecords = SALARY_RECORDS.filter(
    (record) => record.is_verified
  ).length;
  const uniqueCompanies = COMPANIES.length;
  const uniqueCities = new Set(SALARY_RECORDS.map((r) => r.location)).size;
  const salaryRange = getSalaryRange();
  const popularCompanies = buildPopularCompanies();
  const highestPaying = buildHighestPaying();

  return (
    <div className="bg-app-bg min-h-screen">
      {/* ========== HERO SECTION ========== */}
      <section
        id="hero"
        className="relative w-full overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #E6F7F7 0%, #CCFBF1 40%, #E0F2F1 100%)' }}
      >
        {/* Subtle grid pattern overlay */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23e5e5e5' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '40px 40px',
            opacity: 0.4,
          }}
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-20 min-h-[420px] flex flex-col justify-center animate-fade-in-up">
          <h1 className="text-3xl md:text-5xl font-bold text-airbnb tracking-tight leading-tight animate-fade-in-up">
            Make career decisions
            <br />
            <span
              className="inline"
              style={{
                borderBottom: '3px solid #FF5A5F',
                paddingBottom: '2px',
              }}
            >
              with real data.
            </span>
          </h1>

          <p className="mt-5 text-lg text-soft-dark max-w-xl leading-relaxed animate-fade-in-up delay-75">
            Verified salary data for Software Engineers, Product Managers, and
            more at top tech companies in India. Level-by-level compensation
            breakdown covering Bengaluru, Mumbai, Hyderabad and beyond.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3 animate-fade-in-up delay-150">
            <Link
              href="/salaries"
              id="cta-explore"
              className="inline-flex items-center justify-center rounded-lg bg-coral px-6 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-[#e54e53]"
            >
              Explore Salaries →
            </Link>
            <Link
              href="/companies"
              id="cta-companies"
              className="inline-flex items-center justify-center rounded-lg border border-border bg-surface px-6 py-3 font-medium text-airbnb transition-colors hover:bg-hover"
            >
              Browse Companies
            </Link>
          </div>
        </div>
      </section>

      {/* ========== STATS BAR ========== */}
      <section
        id="stats-bar"
        className="w-full bg-surface border-y border-border animate-fade-in-up delay-225"
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4">
            {/* Stat 1 */}
            <div className="reveal flex flex-col items-center py-5 border-r border-border">
              <span className="text-3xl font-bold text-airbnb">
                {verifiedRecords}+
              </span>
              <span className="text-sm text-neutral mt-0.5">
                Verified Salary Records
              </span>
            </div>
            {/* Stat 2 */}
            <div className="reveal flex flex-col items-center py-5 md:border-r border-border">
              <span className="text-3xl font-bold text-airbnb">
                {uniqueCompanies}+
              </span>
              <span className="text-sm text-neutral mt-0.5">
                Top Companies
              </span>
            </div>
            {/* Stat 3 */}
            <div className="reveal flex flex-col items-center py-5 border-r border-border">
              <span className="text-3xl font-bold text-airbnb">
                {uniqueCities}+
              </span>
              <span className="text-sm text-neutral mt-0.5">
                Cities Covered
              </span>
            </div>
            {/* Stat 4 — Salary Range */}
            <div className="reveal flex flex-col items-center py-5">
              <span className="text-3xl font-bold text-airbnb">
                {salaryRange.min} – {salaryRange.max}
              </span>
              <span className="text-sm text-neutral mt-0.5">
                Salary Range
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ========== POPULAR COMPANIES ========== */}
      <section id="popular-companies" className="w-full py-10 animate-fade-in-up delay-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-airbnb text-lg border-l-[3px] border-teal-brand pl-3">
              Popular Companies
            </h2>
            <Link
              href="/companies"
              className="animated-link text-coral text-sm font-medium transition-colors"
            >
              View all →
            </Link>
          </div>

          {/* Cards — horizontal scroll on mobile, wrapping grid on desktop */}
          <div className="flex gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-4 lg:grid-cols-4 md:overflow-visible md:pb-0 scrollbar-hide">
            {popularCompanies.map((company) => (
              <Link
                key={company.slug}
                href={`/companies/${company.slug}`}
                className="reveal group flex-shrink-0 w-[140px] md:w-auto bg-surface border border-border rounded-xl p-4 hover:border-teal-brand hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
              >
                {/* Favicon */}
                <div className="mb-3">
                  <CompanyLogo
                    companyName={company.name}
                    companySlug={company.slug}
                    logoUrl={`https://www.google.com/s2/favicons?domain=${company.slug}.com&sz=64`}
                    size="md"
                  />
                </div>

                {/* Company Name */}
                <p className="font-semibold text-sm text-airbnb truncate">
                  {company.name}
                </p>

                {/* Median TC */}
                <p className="font-bold text-teal-brand text-sm mt-1">
                  {formatCurrency(company.medianTC, 'INR', 'INR', {
                    compact: true,
                  })}
                  <span className="text-neutral font-normal text-xs ml-1">
                    median
                  </span>
                </p>

                {/* Hover arrow */}
                <span className="block mt-2 text-xs text-coral font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  View →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ========== HIGHEST PAYING ROLES ========== */}
      <section id="highest-paying" className="w-full pb-12 animate-fade-in-up delay-375">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-airbnb text-lg border-l-[3px] border-teal-brand pl-3">
              Highest Paying Roles
            </h2>
            <Link
              href="/salaries?sort=tc_desc"
              className="animated-link text-coral text-sm font-medium transition-colors"
            >
              View all →
            </Link>
          </div>

          {/* Rows */}
          <div className="bg-surface border border-border rounded-2xl overflow-hidden">
            {highestPaying.map((row, idx) => (
              <Link
                key={`${row.companySlug}-${row.role}-${row.rank}`}
                href={`/companies/${row.companySlug}`}
                className={`reveal flex items-center justify-between py-3 px-4 rounded-lg transition-colors hover:bg-hover ${
                  idx < highestPaying.length - 1
                    ? 'border-b border-border'
                    : ''
                }`}
              >
                {/* Left: Rank + Company/Role */}
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  {/* Rank */}
                  <span className="text-2xl font-black text-neutral/30 w-8 shrink-0 text-center">
                    {row.rank}
                  </span>

                  {/* Company + Role stacked */}
                  <div className="min-w-0">
                    <p className="text-xs text-neutral truncate">
                      {row.company}
                    </p>
                    <p className="font-medium text-airbnb text-sm truncate">
                      {row.role}
                    </p>
                  </div>
                </div>

                {/* Center: Level Badge */}
                <div className="hidden sm:flex items-center mx-4">
                  <LevelBadge level={row.level} size="sm" />
                </div>

                {/* Right: TC */}
                <span className="font-bold text-data-blue text-right whitespace-nowrap">
                  {formatCurrency(row.tc, 'INR', 'INR', { compact: true })}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
