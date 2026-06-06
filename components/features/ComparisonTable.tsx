// 'use client' — justified because: interactive visual comparison with local calculations and dynamically adjusted fields.
'use client';

import type { CurrencyEnum, SalaryRecord } from '@/types/salary';
import { LevelBadge } from '@/components/ui/LevelBadge';
import { CompanyLogo } from '@/components/ui/CompanyLogo';
import { formatCurrency, convertCurrency, formatExperience } from '@/lib/utils';

export interface ComparisonTableProps {
  record1: SalaryRecord;
  record2: SalaryRecord;
  displayCurrency: 'INR' | 'USD';
}

/** Convert a raw amount from its record currency into the shared display currency. */
const toDisplay = (
  amount: number,
  recordCurrency: CurrencyEnum,
  displayCurrency: 'INR' | 'USD'
): number => {
  if (recordCurrency === displayCurrency) return amount;
  if (
    (recordCurrency === 'INR' || recordCurrency === 'USD') &&
    (displayCurrency === 'INR' || displayCurrency === 'USD')
  ) {
    return convertCurrency(amount, recordCurrency, displayCurrency);
  }
  return amount;
};

export const ComparisonTable = ({
  record1,
  record2,
  displayCurrency,
}: ComparisonTableProps): React.ReactElement => {
  // Pre-convert all monetary values to the shared display currency
  const r1 = {
    base: toDisplay(record1.base_salary, record1.currency, displayCurrency),
    bonus: toDisplay(record1.bonus, record1.currency, displayCurrency),
    stock: toDisplay(record1.stock, record1.currency, displayCurrency),
    tc: toDisplay(
      record1.total_compensation,
      record1.currency,
      displayCurrency
    ),
  };
  const r2 = {
    base: toDisplay(record2.base_salary, record2.currency, displayCurrency),
    bonus: toDisplay(record2.bonus, record2.currency, displayCurrency),
    stock: toDisplay(record2.stock, record2.currency, displayCurrency),
    tc: toDisplay(
      record2.total_compensation,
      record2.currency,
      displayCurrency
    ),
  };

  // Compare using display values to resolve currency differences correctly
  const tcWinner = r1.tc > r2.tc ? 1 : r2.tc > r1.tc ? 2 : 0;

  // Edge case: if EITHER record has bonus=0 AND stock=0, show "—" for bonus+stock
  const eitherHasNoBonusOrStock =
    (record1.bonus === 0 && record1.stock === 0) ||
    (record2.bonus === 0 && record2.stock === 0);

  const renderValueCell = (val: number, otherVal: number) => {
    if (eitherHasNoBonusOrStock && val === 0) {
      return <span className="text-neutral">—</span>;
    }

    const isHigher = val > otherVal;
    const showDelta = isHigher && val !== otherVal;

    return (
      <div className="flex items-center justify-between gap-2 w-full">
        <span>{formatCurrency(val, displayCurrency, displayCurrency)}</span>
        {showDelta && (
          <span className="text-[10px] bg-green-50 text-success px-1.5 py-0.5 rounded font-bold whitespace-nowrap shrink-0">
            +{formatCurrency(val - otherVal, displayCurrency, displayCurrency, { compact: true })}
          </span>
        )}
      </div>
    );
  };

  const renderExpCell = (exp: number, otherExp: number) => {
    const isHigher = exp > otherExp;
    const showDelta = isHigher && exp !== otherExp;
    const diff = exp - otherExp;
    const abs = Math.abs(diff);
    const suffix = abs === 1 ? 'yr' : 'yrs';

    return (
      <div className="flex items-center justify-between gap-2 w-full">
        <span>{formatExperience(exp)}</span>
        {showDelta && (
          <span className="text-[10px] bg-green-50 text-success px-1.5 py-0.5 rounded font-bold">
            +{abs} {suffix}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header row (two company cards side by side) */}
      <div className="flex flex-col sm:flex-row gap-4 w-full">
        
        {/* Record 1 Card */}
        <div className="bg-surface border border-border rounded-xl p-4 flex-1 flex flex-col gap-2 relative shadow-sm">
          {tcWinner === 1 && (
            <span className="bg-data-blue text-white text-[10px] font-bold px-2 py-0.5 rounded-full absolute top-4 right-4">
              Higher TC ↑
            </span>
          )}
          <div className="flex items-center gap-2">
            <CompanyLogo
              companyName={record1.company_display}
              companySlug={record1.company_slug}
              size="sm"
            />
            <span className="text-sm font-bold text-airbnb truncate pr-16">
              {record1.company_display}
            </span>
          </div>
          <div className="text-xs text-neutral font-medium">{record1.role}</div>
          <div className="flex items-center gap-2 mt-1">
            <LevelBadge level={record1.level_standardized} />
            <span className="text-xs text-neutral flex items-center gap-0.5">
              <i className="ti ti-map-pin text-[10px]" />
              {record1.location}
            </span>
          </div>
        </div>

        {/* Record 2 Card */}
        <div className="bg-surface border border-border rounded-xl p-4 flex-1 flex flex-col gap-2 relative shadow-sm">
          {tcWinner === 2 && (
            <span className="bg-data-blue text-white text-[10px] font-bold px-2 py-0.5 rounded-full absolute top-4 right-4">
              Higher TC ↑
            </span>
          )}
          <div className="flex items-center gap-2">
            <CompanyLogo
              companyName={record2.company_display}
              companySlug={record2.company_slug}
              size="sm"
            />
            <span className="text-sm font-bold text-airbnb truncate pr-16">
              {record2.company_display}
            </span>
          </div>
          <div className="text-xs text-neutral font-medium">{record2.role}</div>
          <div className="flex items-center gap-2 mt-1">
            <LevelBadge level={record2.level_standardized} />
            <span className="text-xs text-neutral flex items-center gap-0.5">
              <i className="ti ti-map-pin text-[10px]" />
              {record2.location}
            </span>
          </div>
        </div>

      </div>

      {/* Details Grid Table */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
        
        {/* Company Row */}
        <div className="grid grid-cols-[140px_1fr_1fr] sm:grid-cols-[180px_1fr_1fr] border-b border-border">
          <div className="px-4 py-3 text-xs font-bold text-neutral uppercase tracking-wide bg-app-bg flex items-center select-none">
            Company
          </div>
          <div className="px-4 py-3 text-sm text-airbnb font-semibold truncate">
            {record1.company_display}
          </div>
          <div className="px-4 py-3 text-sm text-airbnb font-semibold truncate">
            {record2.company_display}
          </div>
        </div>

        {/* Role Row */}
        <div className="grid grid-cols-[140px_1fr_1fr] sm:grid-cols-[180px_1fr_1fr] border-b border-border">
          <div className="px-4 py-3 text-xs font-bold text-neutral uppercase tracking-wide bg-app-bg flex items-center select-none">
            Role
          </div>
          <div className="px-4 py-3 text-sm text-airbnb truncate">
            {record1.role}
          </div>
          <div className="px-4 py-3 text-sm text-airbnb truncate">
            {record2.role}
          </div>
        </div>

        {/* Level Row */}
        <div className="grid grid-cols-[140px_1fr_1fr] sm:grid-cols-[180px_1fr_1fr] border-b border-border">
          <div className="px-4 py-3 text-xs font-bold text-neutral uppercase tracking-wide bg-app-bg flex items-center select-none">
            Level
          </div>
          <div className="px-4 py-3 text-sm text-airbnb flex items-center">
            <LevelBadge level={record1.level_standardized} />
          </div>
          <div className="px-4 py-3 text-sm text-airbnb flex items-center">
            <LevelBadge level={record2.level_standardized} />
          </div>
        </div>

        {/* Location Row */}
        <div className="grid grid-cols-[140px_1fr_1fr] sm:grid-cols-[180px_1fr_1fr] border-b border-border">
          <div className="px-4 py-3 text-xs font-bold text-neutral uppercase tracking-wide bg-app-bg flex items-center select-none">
            Location
          </div>
          <div className="px-4 py-3 text-sm text-airbnb flex items-center gap-1 truncate">
            <i className="ti ti-map-pin text-[10px] text-neutral" />
            <span>{record1.location}</span>
          </div>
          <div className="px-4 py-3 text-sm text-airbnb flex items-center gap-1 truncate">
            <i className="ti ti-map-pin text-[10px] text-neutral" />
            <span>{record2.location}</span>
          </div>
        </div>

        {/* Experience Row */}
        <div className="grid grid-cols-[140px_1fr_1fr] sm:grid-cols-[180px_1fr_1fr] border-b border-border">
          <div className="px-4 py-3 text-xs font-bold text-neutral uppercase tracking-wide bg-app-bg flex items-center select-none">
            Experience
          </div>
          <div className="px-4 py-3 text-sm text-airbnb">
            {renderExpCell(record1.experience_years, record2.experience_years)}
          </div>
          <div className="px-4 py-3 text-sm text-airbnb">
            {renderExpCell(record2.experience_years, record1.experience_years)}
          </div>
        </div>

        {/* Base Salary Row */}
        <div className="grid grid-cols-[140px_1fr_1fr] sm:grid-cols-[180px_1fr_1fr] border-b border-border">
          <div className="px-4 py-3 text-xs font-bold text-neutral uppercase tracking-wide bg-app-bg flex items-center select-none">
            Base Salary
          </div>
          <div className="px-4 py-3 text-sm text-airbnb">
            {renderValueCell(r1.base, r2.base)}
          </div>
          <div className="px-4 py-3 text-sm text-airbnb">
            {renderValueCell(r2.base, r1.base)}
          </div>
        </div>

        {/* Bonus Row */}
        <div className="grid grid-cols-[140px_1fr_1fr] sm:grid-cols-[180px_1fr_1fr] border-b border-border">
          <div className="px-4 py-3 text-xs font-bold text-neutral uppercase tracking-wide bg-app-bg flex items-center select-none">
            Bonus
          </div>
          <div className="px-4 py-3 text-sm text-airbnb">
            {renderValueCell(r1.bonus, r2.bonus)}
          </div>
          <div className="px-4 py-3 text-sm text-airbnb">
            {renderValueCell(r2.bonus, r1.bonus)}
          </div>
        </div>

        {/* Stock / Equity Row */}
        <div className="grid grid-cols-[140px_1fr_1fr] sm:grid-cols-[180px_1fr_1fr] border-b border-border">
          <div className="px-4 py-3 text-xs font-bold text-neutral uppercase tracking-wide bg-app-bg flex items-center select-none">
            Stock / Equity
          </div>
          <div className="px-4 py-3 text-sm text-airbnb">
            {renderValueCell(r1.stock, r2.stock)}
          </div>
          <div className="px-4 py-3 text-sm text-airbnb">
            {renderValueCell(r2.stock, r1.stock)}
          </div>
        </div>

        {/* Total Comp Row */}
        <div className="grid grid-cols-[140px_1fr_1fr] sm:grid-cols-[180px_1fr_1fr] bg-blue-50/30 border-b border-border last:border-0 font-bold">
          <div className="px-4 py-3.5 text-xs font-bold text-neutral uppercase tracking-wide bg-app-bg flex items-center select-none">
            Total Comp
          </div>
          <div className="px-4 py-3.5 text-lg font-bold text-data-blue flex items-center justify-between gap-2">
            <span>{formatCurrency(r1.tc, displayCurrency, displayCurrency)}</span>
            {r1.tc > r2.tc && (
              <span className="text-[10px] bg-green-50 text-success px-1.5 py-0.5 rounded font-bold whitespace-nowrap shrink-0 font-sans">
                +{formatCurrency(r1.tc - r2.tc, displayCurrency, displayCurrency, { compact: true })}
              </span>
            )}
          </div>
          <div className="px-4 py-3.5 text-lg font-bold text-data-blue flex items-center justify-between gap-2">
            <span>{formatCurrency(r2.tc, displayCurrency, displayCurrency)}</span>
            {r2.tc > r1.tc && (
              <span className="text-[10px] bg-green-50 text-success px-1.5 py-0.5 rounded font-bold whitespace-nowrap shrink-0 font-sans">
                +{formatCurrency(r2.tc - r1.tc, displayCurrency, displayCurrency, { compact: true })}
              </span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
