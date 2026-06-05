// RSC — React Server Component. No client-side JavaScript.
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CompanyHeader } from '@/components/features/CompanyHeader';
import { CompanyStats } from '@/components/features/CompanyStats';
import { LevelDistributionBar } from '@/components/features/LevelDistributionBar';
import { SalaryTable } from '@/components/features/SalaryTable';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  COMPANIES,
  computeCompanyStats,
  getCompanyBySlug,
  getSalariesByCompanySlug,
} from '@/lib/mock-data';
import type {
  Company,
  CompanyStats as CompanyStatsType,
  LevelEnum,
  SalaryRecord,
} from '@/types/salary';
import { buildCompanyPageMeta } from '@/lib/seo';

const LEVEL_ORDER: LevelEnum[] = [
  'L3',
  'L4',
  'L5',
  'L6',
  'SDE_I',
  'SDE_II',
  'SDE_III',
  'STAFF',
  'PRINCIPAL',
  'IC4',
  'IC5',
];

type CompanyPageProps = {
  params: Promise<{ slug: string }>;
};

const getPresentLevels = (
  distribution: CompanyStatsType['level_distribution']
): LevelEnum[] => LEVEL_ORDER.filter((level) => distribution[level] > 0);

const getLevelRange = (
  distribution: CompanyStatsType['level_distribution']
): string => {
  const present = getPresentLevels(distribution);
  if (present.length === 0) {
    return 'All Levels';
  }
  if (present.length === 1) {
    return present[0];
  }
  return `${present[0]} to ${present[present.length - 1]}`;
};

const getLocationList = (records: SalaryRecord[]): string =>
  [...new Set(records.map((record) => record.location))]
    .sort((a, b) => a.localeCompare(b))
    .join(', ');

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

  return (
    <div className="space-y-6 bg-app-bg px-6 py-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <nav aria-label="Breadcrumb" className="text-sm text-neutral">
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <Link href="/" className="hover:text-airbnb">
              Home
            </Link>
          </li>
          <li aria-hidden="true">&gt;</li>
          <li>
            <Link href="/companies" className="hover:text-airbnb">
              Companies
            </Link>
          </li>
          <li aria-hidden="true">&gt;</li>
          <li className="text-soft-dark" aria-current="page">
            {company.name}
          </li>
        </ol>
      </nav>

      <CompanyHeader company={company} recordCount={stats.record_count} />

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-airbnb">
          Compensation Overview
        </h2>
        <CompanyStats stats={stats} currency={displayCurrency} />
      </section>

      <section className="rounded-xl border border-border bg-surface p-6">
        <h2 className="mb-4 text-lg font-semibold text-airbnb">
          Level Distribution
        </h2>
        <LevelDistributionBar
          levelDistribution={stats.level_distribution}
          totalRecords={stats.record_count}
        />
      </section>

      <section className="overflow-x-auto rounded-xl border border-border bg-surface p-6">
        <h2 className="mb-4 text-lg font-semibold text-airbnb">
          Salary Records
        </h2>
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

      <nav className="flex justify-center pb-2">
        <Link
          href="/salaries"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-coral transition hover:underline"
        >
          ← Back to all salaries
        </Link>
      </nav>
    </div>
  );
}
