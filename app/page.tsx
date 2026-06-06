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

  return cards.sort((a, b) => b.recordCount - a.recordCount).slice(0, 8);
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

export default function HomePage(): React.ReactElement {
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
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60 bg-gradient-to-br from-coral-subtle via-app-bg to-hover/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-widest text-coral mb-3">
              India Tech Compensation Data
            </p>
            <h1 className="text-3xl md:text-5xl font-bold text-airbnb tracking-tight leading-tight">
              Make career decisions{' '}
              <span className="text-coral">with real data.</span>
            </h1>
            <p className="mt-5 text-base md:text-lg text-soft-dark leading-relaxed">
              Verified salary data for Software Engineers, Product Managers, and
              more at top tech companies in India — level-by-level breakdowns
              across Bengaluru, Mumbai, Hyderabad and beyond.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                href="/salaries"
                className="inline-flex items-center justify-center rounded-full bg-coral px-6 py-3 text-sm font-bold text-white shadow-sm shadow-coral/20 transition-colors hover:bg-coral-dark"
              >
                Explore Salaries →
              </Link>
              <Link
                href="/companies"
                className="inline-flex items-center justify-center rounded-full border border-border bg-surface px-6 py-3 text-sm font-semibold text-airbnb transition-colors hover:border-coral/40 hover:bg-hover"
              >
                Browse Companies
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {[
            { value: `${verifiedRecords}+`, label: 'Verified Records' },
            { value: `${uniqueCompanies}+`, label: 'Companies' },
            { value: `${uniqueCities}+`, label: 'Cities' },
            {
              value: `${salaryRange.min} – ${salaryRange.max}`,
              label: 'Salary Range',
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="reveal rounded-2xl border border-border bg-surface px-4 py-5 text-center shadow-sm"
            >
              <p className="text-xl md:text-2xl font-bold text-airbnb tabular-nums">
                {stat.value}
              </p>
              <p className="text-xs text-neutral mt-1 font-medium uppercase tracking-wide">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Popular Companies */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-airbnb">Popular Companies</h2>
          <Link
            href="/companies"
            className="animated-link text-sm font-semibold text-coral"
          >
            View all →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {popularCompanies.map((company) => (
            <Link
              key={company.slug}
              href={`/companies/${company.slug}`}
              className="reveal group rounded-2xl border border-border bg-surface p-5 shadow-sm transition-all hover:border-coral/50 hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-white">
                <CompanyLogo
                  companyName={company.name}
                  companySlug={company.slug}
                  logoUrl={`https://www.google.com/s2/favicons?domain=${company.slug}.com&sz=64`}
                  size="md"
                />
              </div>
              <p className="font-semibold text-sm text-airbnb truncate group-hover:text-coral transition-colors">
                {company.name}
              </p>
              <p className="mt-2 text-lg font-bold text-data-blue tabular-nums">
                {formatCurrency(company.medianTC, 'INR', 'INR', {
                  compact: true,
                })}
              </p>
              <p className="text-[11px] text-neutral mt-0.5">
                median · {company.recordCount} records
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Highest Paying */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-airbnb">Highest Paying Roles</h2>
          <Link
            href="/salaries?sort=tc_desc#salary-table"
            className="animated-link text-sm font-semibold text-coral"
          >
            View all →
          </Link>
        </div>

        <div className="rounded-2xl border border-border bg-surface overflow-hidden shadow-sm">
          {highestPaying.map((row, idx) => (
            <Link
              key={`${row.companySlug}-${row.role}-${row.rank}`}
              href={`/companies/${row.companySlug}`}
              className={`reveal flex items-center gap-4 px-5 py-4 transition-colors hover:bg-coral-subtle/40 ${
                idx < highestPaying.length - 1 ? 'border-b border-border/70' : ''
              }`}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-coral-subtle text-sm font-bold text-coral">
                {row.rank}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-neutral truncate">{row.company}</p>
                <p className="font-medium text-airbnb text-sm truncate">
                  {row.role}
                </p>
              </div>
              <div className="hidden sm:block">
                <LevelBadge level={row.level} size="sm" />
              </div>
              <span className="font-bold text-data-blue tabular-nums whitespace-nowrap">
                {formatCurrency(row.tc, 'INR', 'INR', { compact: true })}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
