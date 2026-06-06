// RSC — React Server Component. No client-side JavaScript.
import type { Metadata } from 'next';
import { FilterBar } from '@/components/features/FilterBar';
import { SalaryTable } from '@/components/features/SalaryTable';
import { RoleExplorer } from '@/components/features/RoleExplorer';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { filterAndSortRecords } from '@/lib/filter-utils';
import { SALARY_RECORDS } from '@/lib/mock-data';
import {
  parseSearchParams,
  computeMedian,
  formatCurrency,
  toDisplayAmount,
} from '@/lib/utils';
import type { SalaryRecord } from '@/types/salary';
import { buildSalaryPageMeta } from '@/lib/seo';

const PAGE_SIZE = 25;

const TITLE =
  'Software Engineer & Tech Salaries in India — L3 to Principal | TalentDash';
const DESCRIPTION =
  'Browse verified salary data for Software Engineers, Product Managers, Data Analysts and more at top tech companies in India. Level-by-level compensation breakdown covering Bengaluru, Mumbai, Hyderabad and more.';

const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Dataset',
  name: 'TalentDash India Tech Salary Database',
  description:
    'Structured compensation data for software engineers and tech professionals in India',
  url: 'https://talentdash.com/salaries',
  creator: {
    '@type': 'Organization',
    name: 'TalentDash',
  },
  keywords: [
    'salary',
    'compensation',
    'software engineer',
    'India',
    'Bengaluru',
    'tech jobs',
  ],
  license: 'https://talentdash.com/terms',
};

export async function generateMetadata({
  searchParams,
}: SalariesPageProps): Promise<Metadata> {
  const rawSearchParams = await searchParams;
  const filters = parseSearchParams(toURLSearchParams(rawSearchParams));
  const filtered = filterAndSortRecords(SALARY_RECORDS, filters);
  return buildSalaryPageMeta(filters, filtered.length);
}

type SalariesPageProps = {
  searchParams: Promise<Record<string, string | string[]>>;
};

const toURLSearchParams = (
  params: Record<string, string | string[]>
): URLSearchParams => {
  const urlParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      value.forEach((entry) => urlParams.append(key, entry));
    } else {
      urlParams.append(key, value);
    }
  }

  return urlParams;
};

const extractUniqueValues = (records: SalaryRecord[]) => ({
  companies: [...new Set(records.map((record) => record.company_display))].sort(
    (a, b) => a.localeCompare(b)
  ),
  roles: [...new Set(records.map((record) => record.role))].sort((a, b) =>
    a.localeCompare(b)
  ),
  locations: [...new Set(records.map((record) => record.location))].sort(
    (a, b) => a.localeCompare(b)
  ),
});

const getTopLocation = (records: SalaryRecord[]): string => {
  const counts = new Map<string, number>();
  for (const record of records) {
    counts.set(record.location, (counts.get(record.location) ?? 0) + 1);
  }
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  return sorted[0]?.[0] ?? '—';
};

const getPopularRoles = (records: SalaryRecord[], limit = 3): string[] => {
  const counts = new Map<string, number>();

  for (const record of records) {
    counts.set(record.role, (counts.get(record.role) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([role]) => role);
};

const formatRoleList = (roles: string[]): string => {
  if (roles.length === 0) {
    return 'software engineering roles';
  }
  if (roles.length === 1) {
    return roles[0];
  }
  if (roles.length === 2) {
    return `${roles[0]} and ${roles[1]}`;
  }
  return `${roles.slice(0, -1).join(', ')}, and ${roles[roles.length - 1]}`;
};

/* ------------------------------------------------------------------ */
/*  SVG Icons (inline, no external dependency)                        */
/* ------------------------------------------------------------------ */

const IconCurrencyRupee = () => (
  <svg
    className="h-5 w-5 text-coral"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M6 3h12M6 8h12M6 13l8.5 8M6 13h3c3.5 0 6-2.5 6-5H6" />
  </svg>
);

const IconChartBar = () => (
  <svg
    className="h-5 w-5 text-coral"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M3 12h4v9H3zM10 7h4v14h-4zM17 3h4v18h-4z" />
  </svg>
);

const IconMapPin = () => (
  <svg
    className="h-5 w-5 text-coral"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 21s-6-5.1-6-10a6 6 0 1 1 12 0c0 4.9-6 10-6 10Z" />
    <circle cx="12" cy="11" r="2.5" />
  </svg>
);

export default async function SalariesPage({
  searchParams,
}: SalariesPageProps): Promise<React.ReactElement> {
  const rawSearchParams = await searchParams;
  const filters = parseSearchParams(toURLSearchParams(rawSearchParams));

  const sort = filters.sort ?? 'tc_desc';
  const page = Math.max(1, filters.page ?? 1);
  const displayCurrency = filters.currency === 'USD' ? 'USD' : 'INR';

  const { companies, roles, locations } = extractUniqueValues(SALARY_RECORDS);

  const filtered = filterAndSortRecords(SALARY_RECORDS, { ...filters, sort });
  const totalRecords = filtered.length;
  const totalPages =
    totalRecords === 0 ? 0 : Math.ceil(totalRecords / PAGE_SIZE);
  const paginatedRecords = filtered.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );
  const popularRoles = formatRoleList(getPopularRoles(SALARY_RECORDS));

  // Stats — normalize each record to display currency before aggregating
  const displayAmounts = filtered.map((record) =>
    toDisplayAmount(
      record.total_compensation,
      record.currency,
      displayCurrency
    )
  );

  const medianTC =
    totalRecords > 0
      ? formatCurrency(
          computeMedian(displayAmounts),
          displayCurrency,
          displayCurrency,
          { compact: true }
        )
      : '—';

  const salaryRange =
    totalRecords > 0
      ? `${formatCurrency(
          Math.min(...displayAmounts),
          displayCurrency,
          displayCurrency,
          { compact: true }
        )} – ${formatCurrency(
          Math.max(...displayAmounts),
          displayCurrency,
          displayCurrency,
          { compact: true }
        )}`
      : '—';

  const topLocation = getTopLocation(filtered);

  return (
    <div className="bg-app-bg min-h-screen pb-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6 pt-6">
        {/* ---- Page Header ---- */}
        <div>
          <h1 className="text-2xl font-bold text-airbnb tracking-tight">
            Tech Salary Data in India
          </h1>
          <p className="mt-2 text-sm text-neutral">
            {totalRecords.toLocaleString('en-IN')} compensation record
            {totalRecords === 1 ? '' : 's'} — covering popular roles such as{' '}
            {popularRoles}.
          </p>
        </div>

        {/* ---- Stats Strip ---- */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Stat 1: Median TC */}
          <div className="bg-surface rounded-xl border border-border p-5">
            <div className="mb-2">
              <IconCurrencyRupee />
            </div>
            <p className="text-2xl font-bold text-data-blue">{medianTC}</p>
            <p className="text-xs text-neutral uppercase tracking-wide mt-1">
              Median Total Pay
            </p>
          </div>

          {/* Stat 2: Range */}
          <div className="bg-surface rounded-xl border border-border p-5">
            <div className="mb-2">
              <IconChartBar />
            </div>
            <p className="text-2xl font-bold text-airbnb">{salaryRange}</p>
            <p className="text-xs text-neutral uppercase tracking-wide mt-1">
              Salary Range
            </p>
          </div>

          {/* Stat 3: Top Location */}
          <div className="bg-surface rounded-xl border border-border p-5">
            <div className="mb-2">
              <IconMapPin />
            </div>
            <p className="text-2xl font-bold text-airbnb">{topLocation}</p>
            <p className="text-xs text-neutral uppercase tracking-wide mt-1">
              Top Location
            </p>
          </div>
        </div>

        {/* ---- Role Explorer ---- */}
        <RoleExplorer records={filtered} displayCurrency={displayCurrency} />

        {/* ---- Filter Bar ---- */}
        <FilterBar
          initialFilters={filters}
          companies={companies}
          roles={roles}
          locations={locations}
        />

        {/* ---- Table/Results ---- */}
        <div className="rounded-2xl border border-border bg-surface shadow-sm overflow-hidden">
          {paginatedRecords.length === 0 ? (
            <div className="px-6 py-8">
              <EmptyState
                message="No records found for these filters."
                clearLink="/salaries"
              />
            </div>
          ) : (
            <SalaryTable
              records={paginatedRecords}
              displayCurrency={displayCurrency}
              currentSort={sort}
              searchParams={rawSearchParams}
            />
          )}

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalRecords={totalRecords}
            pageSize={PAGE_SIZE}
            basePath="/salaries"
            searchParams={rawSearchParams}
          />
        </div>
      </div>
    </div>
  );
}
