// RSC — React Server Component. No client-side JavaScript.
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CompanyHeader } from '@/components/features/CompanyHeader';
import { CompanyTabs } from '@/components/features/CompanyTabs';
import { LevelDistributionBar } from '@/components/features/LevelDistributionBar';
import { SalaryTable } from '@/components/features/SalaryTable';
import { EmptyState } from '@/components/ui/EmptyState';
import { CompanyLogo } from '@/components/ui/CompanyLogo';
import {
  COMPANIES,
  computeCompanyStats,
  getCompanyBySlug,
  getSalariesByCompanySlug,
} from '@/lib/mock-data';
import type { Company, SalaryRecord } from '@/types/salary';
import { buildCompanyPageMeta } from '@/lib/seo';
import { computeMedian, formatCurrency } from '@/lib/utils';

type CompanyPageProps = {
  params: Promise<{ slug: string }>;
};

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

const sortByTotalCompDesc = (records: SalaryRecord[]): SalaryRecord[] =>
  [...records].sort((a, b) => b.total_compensation - a.total_compensation);

const buildOrganizationJsonLd = (
  company: Company
): Record<string, unknown> => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: company.name,
  url: `https://talentdash.com/companies/${company.slug}`,
  ...(company.headquarters && {
    address: {
      '@type': 'PostalAddress',
      addressLocality: company.headquarters,
    },
  }),
  ...(company.founded_year && { foundingDate: String(company.founded_year) }),
  numberOfEmployees: {
    '@type': 'QuantitativeValue',
    description: company.headcount_range ?? 'Not disclosed',
  },
});

const buildBreadcrumbJsonLd = (company: Company): Record<string, unknown> => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://talentdash.com',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Companies',
      item: 'https://talentdash.com/companies',
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: company.name,
      item: `https://talentdash.com/companies/${company.slug}`,
    },
  ],
});

export function generateStaticParams(): { slug: string }[] {
  return COMPANIES.map((company) => ({ slug: company.slug }));
}

export async function generateMetadata({
  params,
}: CompanyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const company = getCompanyBySlug(slug);

  if (!company) {
    return { title: 'Company Not Found | TalentDash' };
  }

  const records = getSalariesByCompanySlug(slug);
  const stats = computeCompanyStats(records);

  return buildCompanyPageMeta(company, stats);
}

export default async function CompanyPage({
  params,
}: CompanyPageProps): Promise<React.ReactElement> {
  const { slug } = await params;
  const company = getCompanyBySlug(slug);

  if (!company) {
    notFound();
  }

  const records = getSalariesByCompanySlug(slug);
  const stats = computeCompanyStats(records);
  const sortedRecords = sortByTotalCompDesc(records);
  const displayCurrency = getPrimaryCurrency(records);
  const organizationJsonLd = buildOrganizationJsonLd(company);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(company);

  // Group by experience bands
  const bands = [
    { label: '0–2 Yrs', min: 0, max: 2 },
    { label: '2–5 Yrs', min: 2.0001, max: 5 },
    { label: '5–10 Yrs', min: 5.0001, max: 10 },
    { label: '10+ Yrs', min: 10.0001, max: 100 },
  ];

  const experienceData = bands.map((band) => {
    const bandRecords = records.filter(
      (r) => r.experience_years >= band.min && r.experience_years <= band.max
    );
    const medianComp =
      bandRecords.length > 0
        ? computeMedian(bandRecords.map((r) => r.total_compensation))
        : 0;

    return {
      label: band.label,
      median: medianComp,
      count: bandRecords.length,
    };
  });

  const maxMedian = Math.max(...experienceData.map((d) => d.median), 1);

  // Group by role for consolidated table
  const roleGroups = new Map<string, SalaryRecord[]>();
  for (const record of records) {
    const list = roleGroups.get(record.role) ?? [];
    list.push(record);
    roleGroups.set(record.role, list);
  }

  const roleData = Array.from(roleGroups.entries())
    .map(([role, roleRecords]) => {
      const tcs = roleRecords.map((r) => r.total_compensation);
      return {
        role,
        median: computeMedian(tcs),
        count: roleRecords.length,
        min: Math.min(...tcs),
        max: Math.max(...tcs),
      };
    })
    .sort((a, b) => b.count - a.count);

  // Similar companies data for the compact strip
  const similarCompanies = COMPANIES.filter((c) => c.slug !== company.slug).slice(0, 5);
  const similarCompaniesData = similarCompanies.map((c) => {
    const cRecords = getSalariesByCompanySlug(c.slug);
    const cStats = computeCompanyStats(cRecords);
    return {
      company: c,
      medianTC: cStats.median_total_compensation,
    };
  });

  return (
    <div className="bg-app-bg min-h-screen pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Redesigned Premium Company Header */}
      <CompanyHeader company={company} recordCount={stats.record_count} />

      <CompanyTabs />

      {/* Main Grid content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6 space-y-6">
        
        {/* ==================== OVERVIEW SECTION ==================== */}
        <div id="overview" className="scroll-mt-24 space-y-6">
          
          {/* 3-Column Info Panel */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Column 1: Company Facts */}
            <div className="reveal bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-xs uppercase tracking-wider text-neutral font-bold mb-4">
                  Company Facts
                </h3>
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2 py-2.5 border-b border-border/40">
                    <div className="flex items-center gap-2 min-w-0">
                      <i className="ti ti-calendar text-neutral text-base shrink-0" />
                      <span className="text-sm font-medium text-airbnb truncate">Founded</span>
                    </div>
                    <span className="text-sm text-soft-dark font-semibold shrink-0">
                      {company.founded_year ?? '—'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 py-2.5 border-b border-border/40">
                    <div className="flex items-center gap-2 min-w-0">
                      <i className="ti ti-users text-neutral text-base shrink-0" />
                      <span className="text-sm font-medium text-airbnb truncate">Employees</span>
                    </div>
                    <span className="text-sm text-soft-dark font-semibold shrink-0">
                      {company.headcount_range ?? '—'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 py-2.5 border-b border-border/40">
                    <div className="flex items-center gap-2 min-w-0">
                      <i className="ti ti-building text-neutral text-base shrink-0" />
                      <span className="text-sm font-medium text-airbnb truncate">Industry</span>
                    </div>
                    <span className="text-sm text-soft-dark font-semibold truncate max-w-[60%]">
                      {company.industry ?? '—'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 py-2.5 border-b border-border/40">
                    <div className="flex items-center gap-2 min-w-0">
                      <i className="ti ti-map-pin text-neutral text-base shrink-0" />
                      <span className="text-sm font-medium text-airbnb truncate">HQ</span>
                    </div>
                    <span className="text-sm text-soft-dark font-semibold truncate max-w-[60%]" title={company.headquarters}>
                      {company.headquarters ?? '—'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 py-2.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <i className="ti ti-external-link text-neutral text-base shrink-0" />
                      <span className="text-sm font-medium text-airbnb truncate">Website</span>
                    </div>
                    <span className="text-sm text-soft-dark font-semibold truncate max-w-[60%]">
                      {company.website ? (
                        <a
                          href={`https://${company.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-coral transition-colors flex items-center gap-0.5"
                        >
                          {company.website} <i className="ti ti-external-link text-[10px]" />
                        </a>
                      ) : (
                        '—'
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: Salary Snapshot */}
            <div className="reveal bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-xs uppercase tracking-wider text-neutral font-bold mb-4">
                  Salary Snapshot
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-neutral">Median Total Compensation</p>
                    <p className="text-3xl font-black text-coral mt-1">
                      {formatCurrency(
                        stats.median_total_compensation,
                        displayCurrency,
                        displayCurrency
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral">Total Compensation Range</p>
                    <p className="text-sm font-bold text-soft-dark mt-0.5">
                      {formatCurrency(stats.min_tc, displayCurrency, displayCurrency, {
                        compact: true,
                      })}{' '}
                      –{' '}
                      {formatCurrency(stats.max_tc, displayCurrency, displayCurrency, {
                        compact: true,
                      })}
                    </p>
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-border/40 mt-4 flex items-center justify-between text-xs text-neutral">
                <span>Data Points</span>
                <span className="font-bold text-soft-dark">
                  {stats.record_count} verified record{stats.record_count === 1 ? '' : 's'}
                </span>
              </div>
            </div>

            {/* Column 3: Ratings breakdown (reviews placeholder) */}
            <div className="reveal bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center h-full min-h-[220px]">
              <div className="w-12 h-12 rounded-full bg-hover flex items-center justify-center mb-3 text-neutral">
                <i className="ti ti-message-2 text-xl" />
              </div>
              <h3 className="text-sm font-bold text-airbnb">Reviews coming soon</h3>
              <p className="text-xs text-neutral mt-1.5 max-w-[200px] leading-relaxed">
                We are currently gathering verified employer reviews for {company.name}.
              </p>
            </div>

          </div>

          {/* Salary by Experience Band Horizontal Bar Chart */}
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm space-y-4">
            <div>
              <h3 className="text-lg font-bold text-airbnb tracking-tight mb-1">
                Salary by Experience
              </h3>
              <p className="text-xs text-neutral">
                Median total compensation breakdown by years of professional experience.
              </p>
            </div>
            
            <div className="w-full space-y-2">
              {experienceData.map((band) => {
                const pct = band.median > 0 ? (band.median / maxMedian) * 100 : 0;
                const formattedVal = band.median > 0
                  ? formatCurrency(band.median, displayCurrency, displayCurrency, { compact: true })
                  : '—';
                
                return (
                  <div key={band.label} className="flex items-center gap-3 py-1.5">
                    <span className="text-xs text-neutral w-16 shrink-0 font-medium">{band.label}</span>
                    <div className="flex-1 relative h-6 rounded-full bg-border overflow-hidden">
                      {band.median > 0 ? (
                        <div
                          className="absolute inset-y-0 left-0 bg-data-blue opacity-85 hover:opacity-100 rounded-full transition-all duration-300 flex items-center justify-end pr-2.5 min-w-[32px] cursor-pointer"
                          style={{ width: `${pct}%` }}
                          title={`${band.label} Median Total Pay: ${formatCurrency(band.median, displayCurrency, displayCurrency)} (${band.count} record${band.count === 1 ? '' : 's'})`}
                        >
                          {pct > 15 && (
                            <span className="text-[10px] font-bold text-white leading-none select-none">
                              {formattedVal}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="absolute inset-0 flex items-center pl-3">
                          <span className="text-[10px] text-neutral/50 font-medium">No records</span>
                        </div>
                      )}
                      {band.median > 0 && pct <= 15 && (
                        <span
                          className="absolute inset-y-0 flex items-center text-[10px] font-bold text-data-blue leading-none pl-2 select-none"
                          style={{ left: `${pct}%` }}
                        >
                          {formattedVal}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Level Distribution Section */}
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-airbnb tracking-tight">
              Level Distribution
            </h2>
            <LevelDistributionBar
              levelDistribution={stats.level_distribution}
              totalRecords={stats.record_count}
            />
          </div>

        </div>

        {/* ==================== SALARIES SECTION ==================== */}
        <div id="salaries" className="scroll-mt-24 space-y-6">
          
          {/* Salary by Role Consolidated Table */}
          <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm space-y-4">
            <div>
              <h2 className="text-lg font-bold text-airbnb tracking-tight mb-1">
                Salary by Role
              </h2>
              <p className="text-xs text-neutral">
                Median total compensation and ranges across different job titles.
              </p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-xs uppercase tracking-wide text-neutral border-b border-border font-bold">
                    <th className="pb-3 font-semibold">Role</th>
                    <th className="pb-3 font-semibold text-right">Median TC</th>
                    <th className="pb-3 font-semibold text-center">Records</th>
                    <th className="pb-3 font-semibold text-right">Range</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {roleData.map((role) => (
                    <tr key={role.role} className="hover:bg-hover/60 transition duration-150">
                      <td className="py-3.5 pr-4">
                        <Link
                          href={`/salaries?company=${encodeURIComponent(company.slug)}&role=${encodeURIComponent(role.role)}`}
                          className="text-sm font-semibold text-data-blue hover:text-coral transition-colors hover:underline"
                        >
                          {role.role}
                        </Link>
                      </td>
                      <td className="py-3.5 text-right font-bold text-data-blue text-sm">
                        {formatCurrency(role.median, displayCurrency, displayCurrency)}
                      </td>
                      <td className="py-3.5 text-center text-sm text-neutral font-medium">
                        {role.count}
                      </td>
                      <td className="py-3.5 text-right text-xs text-neutral font-medium">
                        {formatCurrency(role.min, displayCurrency, displayCurrency, { compact: true })} – {formatCurrency(role.max, displayCurrency, displayCurrency, { compact: true })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Similar Companies Comparison Strip */}
          <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm space-y-4">
            <div>
              <h2 className="text-lg font-bold text-airbnb tracking-tight mb-1">
                Compare with Similar Companies
              </h2>
              <p className="text-xs text-neutral">
                See how {company.name}&apos;s compensation stacks up against other tech employers.
              </p>
            </div>
            
            <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {similarCompaniesData.map(({ company: simCompany, medianTC }) => (
                <div
                  key={simCompany.slug}
                  className="bg-surface border border-border rounded-xl p-3 hover:border-coral transition-colors flex flex-col items-center justify-between gap-2 w-[120px] shrink-0 h-[125px] shadow-sm"
                >
                  <CompanyLogo companyName={simCompany.name} companySlug={simCompany.slug} size="sm" />
                  <span className="text-xs font-semibold text-airbnb text-center truncate w-full" title={simCompany.name}>
                    {simCompany.name}
                  </span>
                  <span className="text-xs font-bold text-data-blue text-center">
                    {formatCurrency(medianTC, displayCurrency, displayCurrency, { compact: true })}
                  </span>
                  <Link
                    href={`/companies/${simCompany.slug}`}
                    className="text-[10px] font-bold text-coral hover:underline"
                  >
                    View →
                  </Link>
                </div>
              ))}
              
              <Link
                href={`/compare?c1=${encodeURIComponent(company.slug)}`}
                className="bg-surface border border-dashed border-border rounded-xl p-3 hover:border-coral transition-colors flex flex-col items-center justify-center gap-1.5 w-[120px] shrink-0 h-[125px] group text-center cursor-pointer shadow-sm"
              >
                <i className="ti ti-arrows-left-right text-neutral group-hover:text-coral transition-colors text-xl" />
                <span className="text-[10px] font-bold text-coral group-hover:underline">
                  Compare all →
                </span>
              </Link>
            </div>
          </section>

          {/* Raw Salary Records Section */}
          <section className="overflow-x-auto rounded-2xl border border-border bg-surface p-6 shadow-sm space-y-4">
            <div>
              <h2 className="text-lg font-bold text-airbnb tracking-tight mb-1">
                Salary Records
              </h2>
              <p className="text-xs text-neutral">
                Browse individual salary and compensation package records submitted by tech workers.
              </p>
            </div>
            {sortedRecords.length === 0 ? (
              <EmptyState message="No records found for this company." />
            ) : (
              <SalaryTable
                records={sortedRecords}
                displayCurrency={displayCurrency}
                currentSort="tc_desc"
              />
            )}
          </section>

        </div>

        {/* ==================== REVIEW SECTION PLACEHOLDER ==================== */}
        <section id="reviews" className="rounded-2xl border border-border bg-surface p-6 shadow-sm scroll-mt-24">
          <h2 className="mb-4 text-lg font-bold text-airbnb tracking-tight">Reviews</h2>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <i className="ti ti-message-2 text-neutral text-3xl mb-2" />
            <p className="text-sm font-semibold text-airbnb">Reviews coming soon</p>
            <p className="text-xs text-neutral mt-1">We are currently gathering verified employer reviews for {company.name}.</p>
          </div>
        </section>

        {/* ==================== BENEFITS SECTION PLACEHOLDER ==================== */}
        <section id="benefits" className="rounded-2xl border border-border bg-surface p-6 shadow-sm scroll-mt-24">
          <h2 className="mb-4 text-lg font-bold text-airbnb tracking-tight">Benefits</h2>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <i className="ti ti-gift text-neutral text-3xl mb-2" />
            <p className="text-sm font-semibold text-airbnb">Benefits details coming soon</p>
            <p className="text-xs text-neutral mt-1">Detailed breakdown of perks, insurance, equity plans and other benefits.</p>
          </div>
        </section>

        {/* ==================== JOBS SECTION PLACEHOLDER ==================== */}
        <section id="jobs" className="rounded-2xl border border-border bg-surface p-6 shadow-sm scroll-mt-24">
          <h2 className="mb-4 text-lg font-bold text-airbnb tracking-tight">Jobs</h2>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <i className="ti ti-briefcase text-neutral text-3xl mb-2" />
            <p className="text-sm font-semibold text-airbnb">Job openings coming soon</p>
            <p className="text-xs text-neutral mt-1">Active openings and career opportunities at {company.name}.</p>
          </div>
        </section>

        {/* ==================== INTERVIEWS SECTION PLACEHOLDER ==================== */}
        <section id="interviews" className="rounded-2xl border border-border bg-surface p-6 shadow-sm scroll-mt-24">
          <h2 className="mb-4 text-lg font-bold text-airbnb tracking-tight">Interviews</h2>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <i className="ti ti-help text-neutral text-3xl mb-2" />
            <p className="text-sm font-semibold text-airbnb">Interview insights coming soon</p>
            <p className="text-xs text-neutral mt-1">Interview questions, hiring process timeline, and difficulty ratings.</p>
          </div>
        </section>

        {/* ==================== Q&A SECTION PLACEHOLDER ==================== */}
        <section id="qa" className="rounded-2xl border border-border bg-surface p-6 shadow-sm scroll-mt-24">
          <h2 className="mb-4 text-lg font-bold text-airbnb tracking-tight">Q&A</h2>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <i className="ti ti-message-dots text-neutral text-3xl mb-2" />
            <p className="text-sm font-semibold text-airbnb">Q&A coming soon</p>
            <p className="text-xs text-neutral mt-1">Ask questions or share answers about working at {company.name}.</p>
          </div>
        </section>

        {/* Back Link */}
        <nav className="flex justify-center pt-4">
          <Link
            href="/salaries"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-coral transition hover:underline"
          >
            ← Back to all salaries
          </Link>
        </nav>
      </div>
    </div>
  );
}
