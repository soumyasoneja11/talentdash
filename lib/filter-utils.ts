import type { SalaryFilters, SalaryRecord } from '@/types/salary';

/**
 * Filters and sorts salary records. Currency, page, and limit are ignored.
 * Default sort is total compensation descending.
 */
export const filterAndSortRecords = (
  records: SalaryRecord[],
  filters: SalaryFilters
): SalaryRecord[] => {
  let result = records;

  if (filters.company?.trim()) {
    const query = filters.company.trim().toLowerCase();
    result = result.filter(
      (record) =>
        record.company_display.toLowerCase().includes(query) ||
        record.company.toLowerCase().includes(query)
    );
  }

  if (filters.role) {
    result = result.filter((record) => record.role === filters.role);
  }

  if (filters.level && filters.level.length > 0) {
    const levelSet = new Set(filters.level);
    result = result.filter((record) => levelSet.has(record.level_standardized));
  }

  if (filters.location?.trim()) {
    const query = filters.location.trim().toLowerCase();
    result = result.filter((record) =>
      record.location.toLowerCase().includes(query)
    );
  }

  const sort = filters.sort ?? 'tc_desc';
  const sorted = [...result];

  switch (sort) {
    case 'tc_asc':
      return sorted.sort((a, b) => a.total_compensation - b.total_compensation);
    case 'date_desc':
      return sorted.sort(
        (a, b) =>
          new Date(b.submitted_at).getTime() -
          new Date(a.submitted_at).getTime()
      );
    case 'tc_desc':
    default:
      return sorted.sort((a, b) => b.total_compensation - a.total_compensation);
  }
};
