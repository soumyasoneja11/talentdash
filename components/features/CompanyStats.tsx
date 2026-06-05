// RSC — React Server Component. No client-side JavaScript.
import { formatCurrency } from '@/lib/utils';
import type {
  CompanyStats as CompanyStatsType,
  CurrencyEnum,
} from '@/types/salary';

export interface CompanyStatsProps {
  stats: CompanyStatsType;
  currency: CurrencyEnum;
}

export const CompanyStats = ({
  stats,
  currency,
}: CompanyStatsProps): React.ReactElement => {
  const displayCurrency = currency === 'USD' ? 'USD' : 'INR';

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div className="rounded-xl border border-border bg-surface p-4">
        <p className="text-xs uppercase tracking-wide text-neutral">
          Median TC
        </p>
        <p className="mt-2 text-2xl font-bold text-data-blue">
          {formatCurrency(
            stats.median_total_compensation,
            displayCurrency,
            displayCurrency
          )}
        </p>
      </div>

      <div className="rounded-xl border border-border bg-surface p-4">
        <p className="text-xs uppercase tracking-wide text-neutral">Range</p>
        <p className="mt-2 text-lg font-semibold text-soft-dark">
          {formatCurrency(stats.min_tc, displayCurrency, displayCurrency, {
            compact: true,
          })}{' '}
          –{' '}
          {formatCurrency(stats.max_tc, displayCurrency, displayCurrency, {
            compact: true,
          })}
        </p>
      </div>

      <div className="rounded-xl border border-border bg-surface p-4">
        <p className="text-xs uppercase tracking-wide text-neutral">Records</p>
        <p className="mt-2 text-lg font-semibold text-soft-dark">
          {stats.record_count} verified record
          {stats.record_count === 1 ? '' : 's'}
        </p>
      </div>
    </div>
  );
};
