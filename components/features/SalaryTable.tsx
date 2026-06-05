// RSC — React Server Component. No client-side JavaScript.
import type { CurrencyEnum, SalaryRecord } from '@/types/salary';
import { SalaryRow } from '@/components/features/SalaryRow';

export interface SalaryTableProps {
  records: SalaryRecord[];
  displayCurrency: CurrencyEnum;
  currentSort: string;
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

export const SalaryTable = ({
  records,
  displayCurrency,
  currentSort,
}: SalaryTableProps): React.ReactElement | null => {
  if (records.length === 0) {
    return null;
  }

  return (
    <div className="w-full overflow-x-auto">
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
                  className="sticky top-0 border-b border-border bg-surface py-3 px-4 text-left text-xs font-medium uppercase tracking-wide text-neutral whitespace-nowrap"
                >
                  <a
                    className="inline-flex items-center gap-1"
                    href={`?sort=${nextSort}`}
                    aria-label={`Sort by ${header.label} ${directionWord}`}
                  >
                    <span>{header.label}</span>
                    {indicator ? (
                      <span aria-hidden="true">{indicator}</span>
                    ) : null}
                  </a>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <SalaryRow
              key={record.id}
              record={record}
              displayCurrency={displayCurrency}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};
