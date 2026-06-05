// RSC — React Server Component. No client-side JavaScript.
import type { Metadata } from 'next';
import { FilterBar } from '@/components/features/FilterBar';
import { SalaryTable } from '@/components/features/SalaryTable';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { filterAndSortRecords } from '@/lib/filter-utils';
import { SALARY_RECORDS } from '@/lib/mock-data';
import { parseSearchParams } from '@/lib/utils';
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

  return (
    <div className="bg-surface">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />

      <div className="border-b border-border px-6 py-6">
        <h1 className="text-2xl font-bold text-airbnb">
          Tech Salary Data in India
        </h1>
        <p className="mt-2 text-sm text-neutral">
          {totalRecords.toLocaleString('en-IN')} compensation record
          {totalRecords === 1 ? '' : 's'} — covering popular roles such as{' '}
          {popularRoles}.
        </p>
      </div>

      <FilterBar
        initialFilters={filters}
        companies={companies}
        roles={roles}
        locations={locations}
      />

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
  );
}
