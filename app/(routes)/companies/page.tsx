// 'use client' — justified because: interactive search filter matching company name, industry, or location in real-time.
'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  COMPANIES,
  SALARY_RECORDS,
  computeCompanyStats,
  getSalariesByCompanySlug,
  getCompanyBySlug,
} from '@/lib/mock-data';
import { formatCurrency } from '@/lib/utils';
import { CompanyLogo } from '@/components/ui/CompanyLogo';
import type { Company, SalaryRecord } from '@/types/salary';

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

/** Get the primary currency for a list of salary records. */
const getPrimaryCurrency = (records: SalaryRecord[]): 'INR' | 'USD' => {
  const counts = new Map<'INR' | 'USD', number>();
  for (const record of records) {
    if (record.currency === 'INR' || record.currency === 'USD') {
      counts.set(record.currency, (counts.get(record.currency) ?? 0) + 1);
    }
  }
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  return sorted[0]?.[0] ?? 'INR';
};

/** Get the highest total compensation record ID for a company. */
const getHighestTcRecordId = (slug: string): string | null => {
  const companyRecords = SALARY_RECORDS.filter((r) => r.company_slug === slug);
  if (companyRecords.length === 0) return null;
  const best = companyRecords.reduce((bestRecord, r) =>
    r.total_compensation > bestRecord.total_compensation ? r : bestRecord
  );
  return best.id;
};

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

export default function CompaniesPage(): React.ReactElement {
  const [searchQuery, setSearchQuery] = useState('');

  // Precompute stats for all companies to avoid re-rendering computations
  const companiesData = useMemo(() => {
    return COMPANIES.map((company) => {
      const records = getSalariesByCompanySlug(company.slug);
      const stats = computeCompanyStats(records);
      const primaryCurrency = getPrimaryCurrency(records);
      return {
        company,
        stats,
        primaryCurrency,
      };
    });
  }, []);

  // Filter companies based on search query
  const filteredCompanies = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return companiesData;

    return companiesData.filter(({ company }) => {
      const nameMatch = company.name.toLowerCase().includes(query);
      const industryMatch = (company.industry ?? '').toLowerCase().includes(query);
      const hqMatch = (company.headquarters ?? '').toLowerCase().includes(query);
      return nameMatch || industryMatch || hqMatch;
    });
  }, [searchQuery, companiesData]);

  // Construct comparisons links dynamically
  const comparisons = useMemo(() => {
    const pairs = [
      { c1: 'google', c2: 'microsoft' },
      { c1: 'flipkart', c2: 'meesho' },
      { c1: 'zepto', c2: 'razorpay' },
      { c1: 'adobe', c2: 'oracle' },
    ];

    return pairs.map(({ c1, c2 }) => {
      const comp1 = getCompanyBySlug(c1);
      const comp2 = getCompanyBySlug(c2);
      const r1 = getHighestTcRecordId(c1);
      const r2 = getHighestTcRecordId(c2);

      return {
        comp1,
        comp2,
        href: r1 && r2 ? `/compare?s1=${r1}&s2=${r2}` : `/compare`,
      };
    });
  }, []);

  // Exploration Categories
  const explorationCategories = [
    {
      title: 'Personalized Insights',
      subtitle: 'Based on your role',
      icon: 'ti-user',
      href: '/salaries',
    },
    {
      title: 'Top Locations',
      subtitle: 'Bengaluru, Pune, Hyderabad',
      icon: 'ti-map-pin',
      href: '/salaries?location=Bengaluru',
    },
    {
      title: 'Highest Paid',
      subtitle: 'Top-tier compensation packages',
      icon: 'ti-chart-bar',
      href: '/salaries?sort=tc_desc',
    },
    {
      title: 'Popular Industries',
      subtitle: 'Fintech, E-commerce, SaaS',
      icon: 'ti-building-factory',
      href: '/salaries',
    },
    {
      title: 'Top Rated',
      subtitle: 'Best employee feedback',
      icon: 'ti-star',
      href: '/companies',
    },
    {
      title: 'High Growth Startups',
      subtitle: 'Series A to pre-IPO',
      icon: 'ti-rocket',
      href: '/salaries',
    },
    {
      title: 'Salary Leaderboard',
      subtitle: 'Ranked by compensation',
      icon: 'ti-medal',
      href: '/salaries?sort=tc_desc',
    },
    {
      title: 'Verified Salaries',
      subtitle: '100% verified records',
      icon: 'ti-shield-check',
      href: '/salaries',
    },
  ];

  return (
    <div className="bg-app-bg min-h-screen py-8">
      <div className="mx-auto max-w-4xl px-4 space-y-8">
        
        {/* ========== PAGE HEADER ========== */}
        <div>
          <h1 className="text-3xl font-bold text-airbnb tracking-tight">
            Companies
          </h1>
          <p className="mt-1 text-sm text-neutral">
            Explore salary data, reviews, and culture for {COMPANIES.length} companies
          </p>

          {/* Search box wrapper */}
          <div className="relative my-6 max-w-xl font-sans">
            <i className="ti ti-search absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral text-lg pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by company name, industry, or location..."
              className="w-full border border-border rounded-xl pl-11 pr-4 py-3 text-sm bg-surface focus:border-coral focus:outline-none placeholder:text-neutral/60 shadow-sm"
            />
          </div>
        </div>

        {/* ========== ALL COMPANIES GRID ========== */}
        <div>
          {/* Section Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-airbnb">
              All Companies
            </h2>
            <span className="text-xs font-semibold text-neutral select-none bg-surface border border-border px-2.5 py-1 rounded-full shadow-sm">
              Showing {filteredCompanies.length} of {COMPANIES.length}
            </span>
          </div>

          {filteredCompanies.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCompanies.map(({ company, stats, primaryCurrency }) => (
                <Link
                  key={company.slug}
                  href={`/companies/${company.slug}`}
                  className="reveal bg-surface border border-border rounded-2xl p-5 hover:border-coral hover:shadow-sm transition-all cursor-pointer group flex flex-col justify-between h-full relative"
                >
                  <div>
                    {/* Top Row: Favicon + Name + Verified Badge */}
                    <div className="flex items-start gap-3">
                      <div className="border border-border p-0.5 rounded-lg bg-surface shrink-0">
                        <CompanyLogo
                          companyName={company.name}
                          companySlug={company.slug}
                          logoUrl={`https://www.google.com/s2/favicons?domain=${company.website || `${company.slug}.com`}&sz=64`}
                          size="md"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-airbnb truncate group-hover:text-coral transition-colors text-sm">
                            {company.name}
                          </span>
                          <i
                            className="ti ti-square-rounded-check-filled text-blue-500 text-base shrink-0"
                            title="Verified Employer"
                          />
                        </div>
                        {company.industry && (
                          <span className="text-[10px] text-blue-600 bg-blue-50 rounded-full px-2 py-0.5 inline-block mt-0.5 font-bold uppercase tracking-wider">
                            {company.industry}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Median TC block */}
                    <div className="mt-4">
                      <span className="text-[10px] text-neutral uppercase font-semibold tracking-wide block">
                        Median TC
                      </span>
                      <span className="text-xl font-black text-data-blue">
                        {formatCurrency(
                          stats.median_total_compensation,
                          primaryCurrency,
                          primaryCurrency,
                          { compact: true }
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Location & Count Block + Footer */}
                  <div className="mt-4 pt-3 border-t border-border/60">
                    <div className="flex flex-col gap-1.5 text-xs text-neutral">
                      <span className="flex items-center gap-1">
                        <i className="ti ti-map-pin text-[10px] text-neutral-400" />
                        <span className="truncate">{company.headquarters || 'India'}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <i className="ti ti-briefcase text-[10px] text-neutral-400" />
                        <span>
                          {stats.record_count}{' '}
                          {stats.record_count === 1 ? 'record' : 'records'}
                        </span>
                      </span>
                    </div>

                    <span className="block mt-3 text-xs text-coral font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                      View salaries →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            /* Search empty state */
            <div className="flex flex-col items-center justify-center p-8 bg-surface border border-dashed border-border rounded-2xl min-h-[220px] select-none text-center shadow-sm">
              <i className="ti ti-search text-neutral/30 text-4xl mb-2" />
              <p className="text-sm font-semibold text-airbnb">
                No companies found matching &ldquo;{searchQuery}&rdquo;
              </p>
              <p className="text-xs text-neutral mt-1">
                Try checking for typos or searching for a different industry or location.
              </p>
            </div>
          )}
        </div>

        {/* ========== POPULAR COMPARISONS ========== */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-airbnb">
              Popular Comparisons
            </h2>
            <Link
              href="/compare"
              className="animated-link text-sm text-coral font-semibold"
            >
              View all →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {comparisons.map((pair, idx) => {
              if (!pair.comp1 || !pair.comp2) return null;
              return (
                <Link
                  key={idx}
                  href={pair.href}
                  className="bg-surface border border-border rounded-xl p-4 hover:border-coral transition-colors cursor-pointer block shadow-sm group"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      {/* Company 1 logo + name */}
                      <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        <CompanyLogo
                          companyName={pair.comp1.name}
                          companySlug={pair.comp1.slug}
                          logoUrl={`https://www.google.com/s2/favicons?domain=${pair.comp1.website || `${pair.comp1.slug}.com`}&sz=64`}
                          size="sm"
                        />
                        <span className="text-sm font-semibold text-airbnb truncate group-hover:text-coral transition-colors">
                          {pair.comp1.name}
                        </span>
                      </div>

                      {/* vs */}
                      <span className="text-xs text-neutral font-bold shrink-0">
                        vs
                      </span>

                      {/* Company 2 logo + name */}
                      <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        <CompanyLogo
                          companyName={pair.comp2.name}
                          companySlug={pair.comp2.slug}
                          logoUrl={`https://www.google.com/s2/favicons?domain=${pair.comp2.website || `${pair.comp2.slug}.com`}&sz=64`}
                          size="sm"
                        />
                        <span className="text-sm font-semibold text-airbnb truncate group-hover:text-coral transition-colors">
                          {pair.comp2.name}
                        </span>
                      </div>
                    </div>

                    {/* Comparison label */}
                    <div className="text-xs text-neutral font-medium mt-1">
                      Compensation &amp; Benefits
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* ========== QUICK WAYS TO EXPLORE ========== */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-airbnb">
              Quick Ways to Explore
            </h2>
            <Link
              href="/salaries"
              className="animated-link text-sm text-coral font-semibold"
            >
              View all →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {explorationCategories.map((cat, idx) => (
              <Link
                key={idx}
                href={cat.href}
                className="bg-surface border border-border rounded-xl p-4 flex items-center gap-3 hover:border-coral transition-colors cursor-pointer shadow-sm group"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-coral/5 group-hover:bg-coral/15 transition-colors">
                  <i className={`ti ${cat.icon} text-coral text-lg`} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-airbnb truncate group-hover:text-coral transition-colors">
                    {cat.title}
                  </p>
                  <p className="text-[10px] text-neutral truncate mt-0.5">
                    {cat.subtitle}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
