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

  const [field, direction] = sort.split('_') as [
    string,
    'asc' | 'desc' | undefined,
  ];
  const multiplier = direction === 'asc' ? 1 : -1;

  if (field === 'date') {
    return sorted.sort((a, b) => {
      const t1 = new Date(a.submitted_at).getTime();
      const t2 = new Date(b.submitted_at).getTime();
      return (t1 - t2) * multiplier;
    });
  }

  const getLevelRank = (level: string): number => {
    const ranks: Record<string, number> = {
      L3: 1,
      SDE_I: 1,
      L4: 2,
      SDE_II: 2,
      L5: 3,
      SDE_III: 3,
      L6: 4,
      STAFF: 4,
      IC4: 5,
      IC5: 6,
      PRINCIPAL: 7,
    };
    return ranks[level] ?? 0;
  };

  switch (field) {
    case 'company':
      return sorted.sort(
        (a, b) =>
          a.company_display.localeCompare(b.company_display) * multiplier
      );
    case 'role':
      return sorted.sort((a, b) => a.role.localeCompare(b.role) * multiplier);
    case 'level':
      return sorted.sort(
        (a, b) =>
          (getLevelRank(a.level_standardized) -
            getLevelRank(b.level_standardized)) *
          multiplier
      );
    case 'location':
      return sorted.sort(
        (a, b) => a.location.localeCompare(b.location) * multiplier
      );
    case 'experience':
      return sorted.sort(
        (a, b) => (a.experience_years - b.experience_years) * multiplier
      );
    case 'base':
      return sorted.sort(
        (a, b) => (a.base_salary - b.base_salary) * multiplier
      );
    case 'bonus':
      return sorted.sort((a, b) => (a.bonus - b.bonus) * multiplier);
    case 'stock':
      return sorted.sort((a, b) => (a.stock - b.stock) * multiplier);
    case 'tc':
    default:
      return sorted.sort(
        (a, b) => (a.total_compensation - b.total_compensation) * multiplier
      );
  }
};
