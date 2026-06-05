// 'use client' — justified because: handles interactive filtering, local input state, and uses Next.js router/navigation functions.
'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { CurrencyEnum, LevelEnum, SalaryFilters } from '@/types/salary';
import { buildSearchParams, cn, getLevelBadgeStyle } from '@/lib/utils';

export interface FilterBarProps {
  initialFilters: Partial<SalaryFilters>;
  companies: string[];
  roles: string[];
  locations: string[];
}

type FilterState = {
  company: string;
  role: string;
  levels: LevelEnum[];
  location: string;
  currency: 'INR' | 'USD';
};

const LEVEL_GROUPS: { label: string; levels: LevelEnum[] }[] = [
  { label: 'IC', levels: ['L3', 'L4', 'L5', 'L6'] },
  { label: 'SDE', levels: ['SDE_I', 'SDE_II', 'SDE_III'] },
  { label: 'Senior', levels: ['STAFF', 'PRINCIPAL', 'IC4', 'IC5'] },
];

const toFilterState = (filters: Partial<SalaryFilters>): FilterState => ({
  company: filters.company ?? '',
  role: filters.role ?? '',
  levels: filters.level ?? [],
  location: filters.location ?? '',
  currency: filters.currency === 'USD' ? 'USD' : 'INR',
});

const toSalaryFilters = (state: FilterState): Partial<SalaryFilters> => {
  const filters: Partial<SalaryFilters> = {};

  if (state.company.trim()) {
    filters.company = state.company.trim();
  }
  if (state.role) {
    filters.role = state.role;
  }
  if (state.levels.length > 0) {
    filters.level = state.levels;
  }
  if (state.location) {
    filters.location = state.location;
  }
  if (state.currency) {
    filters.currency = state.currency as CurrencyEnum;
  }

  return filters;
};

const countActiveFilters = (state: FilterState): number =>
  (state.company.trim() ? 1 : 0) +
  (state.role ? 1 : 0) +
  state.levels.length +
  (state.location ? 1 : 0);

export const FilterBar = ({
  initialFilters,
  companies: _companies,
  roles,
  locations,
}: FilterBarProps): React.ReactElement => {
  const router = useRouter();
  const pathname = usePathname();

  const [filters, setFilters] = useState<FilterState>(() =>
    toFilterState(initialFilters)
  );
  const [companyInput, setCompanyInput] = useState(
    initialFilters.company ?? ''
  );
  const isFirstRender = useRef(true);
  const skipNextPush = useRef(false);

  const sortedRoles = [...roles].sort((a, b) => a.localeCompare(b));
  const sortedLocations = [...locations].sort((a, b) => a.localeCompare(b));
  const activeFilterCount = countActiveFilters(filters);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({ ...prev, company: companyInput }));
    }, 300);

    return () => clearTimeout(timer);
  }, [companyInput]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (skipNextPush.current) {
      skipNextPush.current = false;
      return;
    }

    const query = buildSearchParams(toSalaryFilters(filters));
    const basePath = pathname.startsWith('/salaries') ? pathname : '/salaries';
    const url = query ? `${basePath}?${query}` : basePath;
    router.push(url);
  }, [filters, pathname, router]);

  const toggleLevel = (level: LevelEnum): void => {
    setFilters((prev) => ({
      ...prev,
      levels: prev.levels.includes(level)
        ? prev.levels.filter((item) => item !== level)
        : [...prev.levels, level],
    }));
  };

  const handleClearAll = (): void => {
    skipNextPush.current = true;
    setCompanyInput('');
    setFilters({
      company: '',
      role: '',
      levels: [],
      location: '',
      currency: 'INR',
    });
    router.push('/salaries');
  };

  return (
    <div className="sticky top-20 z-10 border-b border-border bg-surface px-6 py-4 min-h-[72px]">
      <div className="flex flex-wrap items-center gap-4">
        <input
          type="text"
          value={companyInput}
          onChange={(event) => setCompanyInput(event.target.value)}
          placeholder="Search company..."
          className="min-w-[180px] rounded-md border border-border px-3 py-2 text-sm text-soft-dark placeholder:text-neutral focus:border-coral focus:outline-none"
          aria-label="Search company"
        />

        <select
          value={filters.role}
          onChange={(event) =>
            setFilters((prev) => ({ ...prev, role: event.target.value }))
          }
          className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-soft-dark focus:border-coral focus:outline-none"
          aria-label="Filter by role"
        >
          <option value="">All Roles</option>
          {sortedRoles.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>

        <div className="flex flex-wrap items-center gap-3">
          {LEVEL_GROUPS.map((group) => (
            <div key={group.label} className="flex items-center gap-2">
              <span className="text-xs font-medium text-neutral">
                {group.label}
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {group.levels.map((level) => {
                  const { bg, text } = getLevelBadgeStyle(level);
                  const checked = filters.levels.includes(level);

                  return (
                    <label
                      key={level}
                      className={cn(
                        'inline-flex cursor-pointer items-center gap-1 rounded-full',
                        checked ? 'ring-2 ring-coral ring-offset-1' : ''
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleLevel(level)}
                        aria-label={`Select level ${level}`}
                        className="h-3 w-3 rounded border-border text-coral focus:ring-coral"
                      />
                      <span
                        className={cn(
                          'rounded-full px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide',
                          bg,
                          text
                        )}
                      >
                        {level}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <select
          value={filters.location}
          onChange={(event) =>
            setFilters((prev) => ({ ...prev, location: event.target.value }))
          }
          className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-soft-dark focus:border-coral focus:outline-none"
          aria-label="Filter by location"
        >
          <option value="">All Locations</option>
          {sortedLocations.map((location) => (
            <option key={location} value={location}>
              {location}
            </option>
          ))}
        </select>

        <div className="inline-flex overflow-hidden rounded-md border border-border">
          <button
            type="button"
            onClick={() => setFilters((prev) => ({ ...prev, currency: 'INR' }))}
            aria-label="Show salaries in Indian Rupees"
            className={cn(
              'px-3 py-2 text-sm font-medium transition-colors',
              filters.currency === 'INR'
                ? 'bg-coral text-white'
                : 'bg-surface text-neutral'
            )}
          >
            ₹ INR
          </button>
          <button
            type="button"
            onClick={() => setFilters((prev) => ({ ...prev, currency: 'USD' }))}
            aria-label="Show salaries in US Dollars"
            className={cn(
              'border-l border-border px-3 py-2 text-sm font-medium transition-colors',
              filters.currency === 'USD'
                ? 'bg-coral text-white'
                : 'bg-surface text-neutral'
            )}
          >
            $ USD
          </button>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3">
        {activeFilterCount > 0 ? (
          <span className="rounded-full bg-hover px-2.5 py-0.5 text-xs font-medium text-soft-dark">
            {activeFilterCount} filter{activeFilterCount === 1 ? '' : 's'}{' '}
            active
          </span>
        ) : null}
        {activeFilterCount > 0 ? (
          <button
            type="button"
            onClick={handleClearAll}
            className="text-xs font-medium text-coral hover:underline"
          >
            Clear all
          </button>
        ) : null}
      </div>
    </div>
  );
};
