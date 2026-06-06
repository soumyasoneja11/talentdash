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

type ColumnDef = {
  key: string;
  label: string;
  sortable: boolean;
};

const COLUMNS: ColumnDef[] = [
  { key: 'company', label: 'Company', sortable: false },
  { key: 'role', label: 'Role', sortable: true },
  { key: 'level', label: 'Level', sortable: true },
  { key: 'location', label: 'Location', sortable: false },
  { key: 'experience', label: 'Experience', sortable: true },
  { key: 'base', label: 'Base Salary', sortable: false },
  { key: 'bonus', label: 'Bonus', sortable: true },
  { key: 'stock', label: 'Stock', sortable: true },
  { key: 'tc', label: 'Total Comp', sortable: true },
];

const getSortDirection = (
  currentSort: string,
  key: string
): 'asc' | 'desc' | null => {
  if (currentSort === `${key}_asc`) return 'asc';
  if (currentSort === `${key}_desc`) return 'desc';
  return null;
};

/** First click sorts descending; toggles to ascending on second click. */
const getNextSort = (currentSort: string, key: string): string =>
  currentSort === `${key}_desc` ? `${key}_asc` : `${key}_desc`;

const buildSortHref = (
  nextSort: string,
  searchParams?: Record<string, string | string[]>
): string => {
  const params = new URLSearchParams();

  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (key === 'sort' || key === 'page') continue;
      if (Array.isArray(value)) {
        value.forEach((val) => params.append(key, val));
      } else {
        params.append(key, value);
      }
    }
  }

  params.set('sort', nextSort);
  return `?${params.toString()}#salary-table`;
};

const sortHint = (direction: 'asc' | 'desc' | null): string => {
  if (direction === 'desc') return 'Highest first';
  if (direction === 'asc') return 'Lowest first';
  return 'Click to sort high → low';
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
    <div
      id="salary-table"
      className="w-full overflow-x-auto scrollbar-hide scroll-mt-28"
    >
      <table className="w-full border-collapse text-sm">
        <caption className="sr-only">
          Salary records filtered by current selection
        </caption>
        <thead>
          <tr>
            {COLUMNS.map((column) => {
              const direction = column.sortable
                ? getSortDirection(currentSort, column.key)
                : null;
              const isActive = direction !== null;

              if (!column.sortable) {
                return (
                  <th
                    key={column.key}
                    scope="col"
                    className="sticky top-0 border-b border-border bg-hover/50 py-3 px-4 text-left text-xs font-medium uppercase tracking-wide text-neutral whitespace-nowrap"
                  >
                    {column.label}
                  </th>
                );
              }

              const nextSort = getNextSort(currentSort, column.key);
              const indicator =
                direction === 'desc' ? '↓' : direction === 'asc' ? '↑' : '↕';
              const ariaSort =
                direction === 'asc'
                  ? 'ascending'
                  : direction === 'desc'
                    ? 'descending'
                    : 'none';

              return (
                <th
                  key={column.key}
                  scope="col"
                  aria-sort={ariaSort}
                  className={`sticky top-0 border-b py-3 px-4 text-left text-xs font-medium uppercase tracking-wide whitespace-nowrap transition-colors ${
                    isActive
                      ? 'border-coral/40 bg-coral-subtle/80 text-coral'
                      : 'border-border bg-hover/50 text-neutral'
                  }`}
                >
                  <Link
                    scroll={false}
                    className={`inline-flex items-center gap-1.5 group/sort ${
                      isActive
                        ? 'text-coral font-semibold'
                        : 'hover:text-airbnb'
                    }`}
                    href={buildSortHref(nextSort, searchParams)}
                    title={sortHint(direction)}
                    aria-label={`Sort by ${column.label}. ${sortHint(direction)}.`}
                  >
                    <span>{column.label}</span>
                    <span
                      className={`inline-flex h-5 min-w-5 items-center justify-center rounded text-[10px] font-bold ${
                        isActive
                          ? 'bg-coral text-white'
                          : 'bg-surface text-neutral group-hover/sort:text-airbnb'
                      }`}
                      aria-hidden="true"
                    >
                      {indicator}
                    </span>
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
