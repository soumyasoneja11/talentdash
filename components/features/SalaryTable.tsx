// RSC — React Server Component. No client-side JavaScript.
import type { CurrencyEnum, SalaryRecord } from '@/types/salary';
import { SalaryRow } from '@/components/features/SalaryRow';
import Link from 'next/link';

export interface SalaryTableProps {
  records: SalaryRecord[];
  displayCurrency: CurrencyEnum;
  currentSort: string;
  searchParams?: Record<string, string | string[]>;
}

type SortHeader = {
  key: string;
  label: string;
};

const SORT_HEADERS: SortHeader[] = [
  { key: 'company', label: 'Company' },
  { key: 'role', label: 'Role' },
  { key: 'level', label: 'Level' },
  { key: 'location', label: 'Location' },
  { key: 'experience', label: 'Experience' },
  { key: 'base', label: 'Base Salary' },
  { key: 'bonus', label: 'Bonus' },
  { key: 'stock', label: 'Stock' },
  { key: 'tc', label: 'Total Comp' },
];

const getSortDirection = (
  currentSort: string,
  key: string
): 'asc' | 'desc' | null => {
  if (currentSort === `${key}_asc`) {
    return 'asc';
  }
  if (currentSort === `${key}_desc`) {
    return 'desc';
  }
  return null;
};

const getNextSort = (currentSort: string, key: string): string =>
  currentSort === `${key}_asc` ? `${key}_desc` : `${key}_asc`;

const buildSortHref = (
  nextSort: string,
  searchParams?: Record<string, string | string[]>
): string => {
  if (!searchParams) {
    return `?sort=${nextSort}`;
  }
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (key === 'sort' || key === 'page') {
      continue;
    }
    if (Array.isArray(value)) {
      value.forEach((val) => params.append(key, val));
    } else {
      params.append(key, value);
    }
  }
  params.set('sort', nextSort);
  return `?${params.toString()}`;
};

export const SalaryTable = ({
  records,
  displayCurrency,
  currentSort,
  searchParams,
}: SalaryTableProps): React.ReactElement | null => {
  if (records.length === 0) {
    return null;
  }

  return (
    <div className="w-full overflow-x-auto scrollbar-hide">
      <table className="w-full border-collapse text-sm">
        <caption className="sr-only">
          Salary records filtered by current selection
        </caption>
        <thead>
          <tr>
            {SORT_HEADERS.map((header) => {
              const direction = getSortDirection(currentSort, header.key);
              const nextSort = getNextSort(currentSort, header.key);
              const indicator =
                direction === 'asc' ? '↑' : direction === 'desc' ? '↓' : '';
              const ariaSort =
                direction === 'asc'
                  ? 'ascending'
                  : direction === 'desc'
                    ? 'descending'
                    : 'none';
              const directionWord = nextSort.endsWith('_asc')
                ? 'ascending'
                : 'descending';

              return (
                <th
                  key={header.key}
                  scope="col"
                  aria-sort={ariaSort}
                  className="sticky top-0 border-b border-border bg-teal-muted/50 py-3 px-4 text-left text-xs font-medium uppercase tracking-wide text-neutral whitespace-nowrap"
                >
                  <Link
                    className="inline-flex items-center gap-1 hover:text-airbnb transition-colors"
                    href={buildSortHref(nextSort, searchParams)}
                    aria-label={`Sort by ${header.label} ${directionWord}`}
                  >
                    <span>{header.label}</span>
                    {indicator ? (
                      <span aria-hidden="true">{indicator}</span>
                    ) : null}
                  </Link>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {records.map((record, idx) => {
            const delay = Math.min(idx * 30, 300);
            return (
              <SalaryRow
                key={record.id}
                record={record}
                displayCurrency={displayCurrency}
                isEven={idx % 2 === 0}
                style={{ animationDelay: `${delay}ms` }}
                className="animate-fade-in-up opacity-0 [animation-fill-mode:forwards]"
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
