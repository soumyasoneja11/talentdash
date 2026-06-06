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
    if (companyInput === filters.company) {
      return;
    }
    const timer = setTimeout(() => {
      setFilters((prev) => {
        if (prev.company === companyInput) return prev;
        return { ...prev, company: companyInput };
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [companyInput, filters.company]);

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
    router.push(url, { scroll: false });
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
    router.push('/salaries', { scroll: false });
  };

  return (
    <div className="bg-surface border border-border rounded-xl p-4">
      {/* Main filter grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Company Search */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="filter-company"
            className="text-xs font-medium text-neutral uppercase tracking-wide"
          >
            Company
          </label>
          <input
            id="filter-company"
            type="text"
            value={companyInput}
            onChange={(event) => setCompanyInput(event.target.value)}
            placeholder="Search company..."
            className={cn(
              'border rounded-lg px-3 py-2 text-sm text-airbnb bg-surface placeholder:text-neutral focus:border-teal-brand focus:outline-none w-full',
              companyInput.trim() ? 'border-teal-brand/60 bg-teal-subtle/50' : 'border-border'
            )}
            aria-label="Search company"
          />
        </div>

        {/* Role Filter */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="filter-role"
            className="text-xs font-medium text-neutral uppercase tracking-wide"
          >
            Role
          </label>
          <select
            id="filter-role"
            value={filters.role}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, role: event.target.value }))
            }
            className={cn(
              'border rounded-lg px-3 py-2 text-sm text-airbnb bg-surface focus:border-teal-brand focus:outline-none w-full',
              filters.role ? 'border-teal-brand/60 bg-teal-subtle/50' : 'border-border'
            )}
            aria-label="Filter by role"
          >
            <option value="">All Roles</option>
            {sortedRoles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>

        {/* Location Filter */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="filter-location"
            className="text-xs font-medium text-neutral uppercase tracking-wide"
          >
            Location
          </label>
          <select
            id="filter-location"
            value={filters.location}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, location: event.target.value }))
            }
            className={cn(
              'border rounded-lg px-3 py-2 text-sm text-airbnb bg-surface focus:border-teal-brand focus:outline-none w-full',
              filters.location ? 'border-teal-brand/60 bg-teal-subtle/50' : 'border-border'
            )}
            aria-label="Filter by location"
          >
            <option value="">All Locations</option>
            {sortedLocations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>

        {/* Currency Toggle */}
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-neutral uppercase tracking-wide">
            Currency
          </span>
          <div className="inline-flex overflow-hidden rounded-lg border border-border self-start">
            <button
              type="button"
              onClick={() =>
                setFilters((prev) => ({ ...prev, currency: 'INR' }))
              }
              aria-label="Show salaries in Indian Rupees"
              className={cn(
                'px-3 py-2 text-sm font-medium transition-colors',
                filters.currency === 'INR'
                  ? 'bg-teal-brand text-white'
                  : 'bg-surface text-neutral hover:bg-hover'
              )}
            >
              ₹ INR
            </button>
            <button
              type="button"
              onClick={() =>
                setFilters((prev) => ({ ...prev, currency: 'USD' }))
              }
              aria-label="Show salaries in US Dollars"
              className={cn(
                'border-l border-border px-3 py-2 text-sm font-medium transition-colors',
                filters.currency === 'USD'
                  ? 'bg-teal-brand text-white'
                  : 'bg-surface text-neutral hover:bg-hover'
              )}
            >
              $ USD
            </button>
          </div>
        </div>
      </div>

      {/* Level filters */}
      <div className="mt-4 pt-4 border-t border-border/60">
        <p className="text-xs font-medium text-neutral uppercase tracking-wide mb-2">
          Level
        </p>
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
                        checked ? 'ring-2 ring-teal-brand ring-offset-1' : ''
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleLevel(level)}
                        aria-label={`Select level ${level}`}
                        className="h-3 w-3 rounded border-border text-teal-brand focus:ring-teal-brand"
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
      </div>

      {/* Active filter indicator */}
      {activeFilterCount > 0 && (
        <div className="mt-3 flex items-center gap-3">
          <span className="bg-teal-brand text-white text-xs px-2 py-0.5 rounded-full font-medium">
            {activeFilterCount} filter{activeFilterCount === 1 ? '' : 's'}{' '}
            active
          </span>
          <button
            type="button"
            onClick={handleClearAll}
            className="text-xs font-medium text-teal-brand hover:underline"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
};
