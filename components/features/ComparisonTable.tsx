// 'use client' — justified because: interactive visual comparison with local calculations and dynamically adjusted fields.
'use client';

import type { CurrencyEnum, SalaryRecord } from '@/types/salary';
import { LevelBadge } from '@/components/ui/LevelBadge';
import { formatCurrency, convertCurrency, formatExperience } from '@/lib/utils';

export interface ComparisonTableProps {
  record1: SalaryRecord;
  record2: SalaryRecord;
  displayCurrency: 'INR' | 'USD';
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

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

/** Render a monetary delta with color + sign prefix. */
const MoneyDiff = ({
  diff,
  currency,
}: {
  diff: number;
  currency: 'INR' | 'USD';
}): React.ReactElement => {
  if (diff === 0) return <span className="text-neutral">&mdash;</span>;
  const formatted = formatCurrency(Math.abs(diff), currency, currency);
  if (diff > 0) {
    return <span className="font-medium text-success">+{formatted}</span>;
  }
  return <span className="font-medium text-error">−{formatted}</span>;
};

/** Render an experience-years delta with color + sign prefix. */
const ExpDiff = ({ diff }: { diff: number }): React.ReactElement => {
  if (diff === 0) return <span className="text-neutral">&mdash;</span>;
  const abs = Math.abs(diff);
  const suffix = abs === 1 ? 'yr' : 'yrs';
  if (diff > 0) {
    return (
      <span className="font-medium text-success">
        +{abs} {suffix}
      </span>
    );
  }
  return (
    <span className="font-medium text-error">
      −{abs} {suffix}
    </span>
  );
};

const DASH = <span className="text-neutral">&mdash;</span>;

// Mobile-friendly: Field column sticks left so the user can always see the row label.
const HEADER_CELL =
  'border-b border-border bg-surface py-3 px-4 text-left text-xs font-medium uppercase tracking-wide text-neutral whitespace-nowrap';
const HEADER_CELL_STICKY = `${HEADER_CELL} sticky left-0 z-10`;
const BODY_CELL =
  'border-b border-border py-3 px-4 align-middle whitespace-nowrap';
const BODY_CELL_STICKY = `${BODY_CELL} sticky left-0 z-10 bg-surface font-medium text-airbnb`;

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

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

  const expDiff = record1.experience_years - record2.experience_years;
  const tcWinner: 0 | 1 | 2 = r1.tc > r2.tc ? 1 : r2.tc > r1.tc ? 2 : 0;

  // Edge case 6: if EITHER record has bonus=0 AND stock=0, show "—" for bonus+stock
  const eitherHasNoBonusOrStock =
    (record1.bonus === 0 && record1.stock === 0) ||
    (record2.bonus === 0 && record2.stock === 0);

  const WinnerBadge = (): React.ReactElement => (
    <span className="mt-1 inline-block rounded-full bg-data-blue px-2 py-0.5 text-xs font-medium text-white">
      Higher TC ↑
    </span>
  );

  /** Renders a monetary value cell, or "—" if the raw amount is 0 and the blanked flag is set. */
  const MoneyCell = ({
    value,
    raw,
    blanked,
    isTc,
    winner,
  }: {
    value: number;
    raw: number;
    blanked: boolean;
    isTc?: boolean;
    winner?: boolean;
  }): React.ReactElement => {
    if (blanked && raw === 0) return <>{DASH}</>;
    return (
      <div>
        <span
          className={
            isTc ? 'text-lg font-bold text-data-blue' : 'text-soft-dark'
          }
        >
          {formatCurrency(value, displayCurrency, displayCurrency)}
        </span>
        {winner ? (
          <div>
            <WinnerBadge />
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className={HEADER_CELL_STICKY}>Field</th>
            <th className={HEADER_CELL}>Record 1</th>
            <th className={HEADER_CELL}>Record 2</th>
            <th className={HEADER_CELL}>Difference</th>
          </tr>
        </thead>
        <tbody>
          {/* Company */}
          <tr className="transition-colors hover:bg-hover">
            <td className={BODY_CELL_STICKY}>Company</td>
            <td className={`${BODY_CELL} text-soft-dark`}>
              {record1.company_display}
            </td>
            <td className={`${BODY_CELL} text-soft-dark`}>
              {record2.company_display}
            </td>
            <td className={BODY_CELL} />
          </tr>

          {/* Role */}
          <tr className="transition-colors hover:bg-hover">
            <td className={BODY_CELL_STICKY}>Role</td>
            <td className={`${BODY_CELL} text-soft-dark`}>{record1.role}</td>
            <td className={`${BODY_CELL} text-soft-dark`}>{record2.role}</td>
            <td className={BODY_CELL} />
          </tr>

          {/* Level */}
          <tr className="transition-colors hover:bg-hover">
            <td className={BODY_CELL_STICKY}>Level</td>
            <td className={BODY_CELL}>
              <LevelBadge level={record1.level_standardized} />
            </td>
            <td className={BODY_CELL}>
              <LevelBadge level={record2.level_standardized} />
            </td>
            <td className={BODY_CELL} />
          </tr>

          {/* Location */}
          <tr className="transition-colors hover:bg-hover">
            <td className={BODY_CELL_STICKY}>Location</td>
            <td className={`${BODY_CELL} text-soft-dark`}>
              {record1.location}
            </td>
            <td className={`${BODY_CELL} text-soft-dark`}>
              {record2.location}
            </td>
            <td className={BODY_CELL} />
          </tr>

          {/* Experience */}
          <tr className="transition-colors hover:bg-hover">
            <td className={BODY_CELL_STICKY}>Experience</td>
            <td className={`${BODY_CELL} text-soft-dark`}>
              {formatExperience(record1.experience_years)}
            </td>
            <td className={`${BODY_CELL} text-soft-dark`}>
              {formatExperience(record2.experience_years)}
            </td>
            <td className={BODY_CELL}>
              <ExpDiff diff={expDiff} />
            </td>
          </tr>

          {/* Base Salary */}
          <tr className="transition-colors hover:bg-hover">
            <td className={BODY_CELL_STICKY}>Base Salary</td>
            <td className={BODY_CELL}>
              <MoneyCell
                value={r1.base}
                raw={record1.base_salary}
                blanked={false}
              />
            </td>
            <td className={BODY_CELL}>
              <MoneyCell
                value={r2.base}
                raw={record2.base_salary}
                blanked={false}
              />
            </td>
            <td className={BODY_CELL}>
              <MoneyDiff diff={r1.base - r2.base} currency={displayCurrency} />
            </td>
          </tr>

          {/* Bonus — blank both columns + delta when either record has no bonus & no stock */}
          <tr className="transition-colors hover:bg-hover">
            <td className={BODY_CELL_STICKY}>Bonus</td>
            <td className={BODY_CELL}>
              <MoneyCell
                value={r1.bonus}
                raw={record1.bonus}
                blanked={eitherHasNoBonusOrStock}
              />
            </td>
            <td className={BODY_CELL}>
              <MoneyCell
                value={r2.bonus}
                raw={record2.bonus}
                blanked={eitherHasNoBonusOrStock}
              />
            </td>
            <td className={BODY_CELL}>
              {eitherHasNoBonusOrStock &&
              (record1.bonus === 0 || record2.bonus === 0) ? (
                DASH
              ) : (
                <MoneyDiff
                  diff={r1.bonus - r2.bonus}
                  currency={displayCurrency}
                />
              )}
            </td>
          </tr>

          {/* Stock — same blanking logic as bonus */}
          <tr className="transition-colors hover:bg-hover">
            <td className={BODY_CELL_STICKY}>Stock</td>
            <td className={BODY_CELL}>
              <MoneyCell
                value={r1.stock}
                raw={record1.stock}
                blanked={eitherHasNoBonusOrStock}
              />
            </td>
            <td className={BODY_CELL}>
              <MoneyCell
                value={r2.stock}
                raw={record2.stock}
                blanked={eitherHasNoBonusOrStock}
              />
            </td>
            <td className={BODY_CELL}>
              {eitherHasNoBonusOrStock &&
              (record1.stock === 0 || record2.stock === 0) ? (
                DASH
              ) : (
                <MoneyDiff
                  diff={r1.stock - r2.stock}
                  currency={displayCurrency}
                />
              )}
            </td>
          </tr>

          {/* Total Comp */}
          <tr className="transition-colors hover:bg-hover">
            <td className={BODY_CELL_STICKY}>Total Comp</td>
            <td className={BODY_CELL}>
              <MoneyCell
                value={r1.tc}
                raw={record1.total_compensation}
                blanked={false}
                isTc
                winner={tcWinner === 1}
              />
            </td>
            <td className={BODY_CELL}>
              <MoneyCell
                value={r2.tc}
                raw={record2.total_compensation}
                blanked={false}
                isTc
                winner={tcWinner === 2}
              />
            </td>
            <td className={BODY_CELL}>
              <MoneyDiff diff={r1.tc - r2.tc} currency={displayCurrency} />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
