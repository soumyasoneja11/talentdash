// 'use client' — justified because: manages interactive role selection state.
'use client';

import { useState, useMemo } from 'react';
import { formatCurrency, computeMedian } from '@/lib/utils';
import type { SalaryRecord } from '@/types/salary';

export interface RoleExplorerProps {
  records: SalaryRecord[];
  displayCurrency: 'INR' | 'USD';
}

type RoleSummary = {
  role: string;
  count: number;
  medianTC: number;
  minTC: number;
  maxTC: number;
  avgBase: number;
  avgBonus: number;
  avgStock: number;
};

const buildRoleSummaries = (records: SalaryRecord[]): RoleSummary[] => {
  const groups = new Map<string, SalaryRecord[]>();
  for (const r of records) {
    const existing = groups.get(r.role) ?? [];
    existing.push(r);
    groups.set(r.role, existing);
  }

  const summaries: RoleSummary[] = [];
  for (const [role, recs] of groups) {
    const tcs = recs.map((r) => r.total_compensation);
    const totalBase = recs.reduce((s, r) => s + r.base_salary, 0);
    const totalBonus = recs.reduce((s, r) => s + r.bonus, 0);
    const totalStock = recs.reduce((s, r) => s + r.stock, 0);
    const total = totalBase + totalBonus + totalStock;

    summaries.push({
      role,
      count: recs.length,
      medianTC: computeMedian(tcs),
      minTC: Math.min(...tcs),
      maxTC: Math.max(...tcs),
      avgBase: total > 0 ? (totalBase / total) * 100 : 0,
      avgBonus: total > 0 ? (totalBonus / total) * 100 : 0,
      avgStock: total > 0 ? (totalStock / total) * 100 : 0,
    });
  }

  return summaries.sort((a, b) => b.count - a.count);
};

export const RoleExplorer = ({
  records,
  displayCurrency,
}: RoleExplorerProps): React.ReactElement => {
  const summaries = useMemo(() => buildRoleSummaries(records), [records]);
  const [activeRole, setActiveRole] = useState(summaries[0]?.role ?? '');

  const active = summaries.find((s) => s.role === activeRole) ?? summaries[0];

  // Absolute range across all roles for the range bar
  const absoluteMin = Math.min(...summaries.map((s) => s.minTC));
  const absoluteMax = Math.max(...summaries.map((s) => s.maxTC));
  const range = absoluteMax - absoluteMin || 1;

  const leftPct = active ? ((active.minTC - absoluteMin) / range) * 100 : 0;
  const rightPct = active ? 100 - ((active.maxTC - absoluteMin) / range) * 100 : 0;
  const medianPct = active ? ((active.medianTC - absoluteMin) / range) * 100 : 50;

  if (summaries.length === 0) return <div />;

  return (
    <div className="rounded-2xl border border-border bg-surface shadow-sm overflow-hidden">
      <div className="flex flex-col md:flex-row">
        {/* ---- Mobile: horizontal scroll tabs ---- */}
        <div className="flex md:hidden overflow-x-auto gap-2 p-4 border-b border-border scrollbar-hide">
          {summaries.map((s) => (
            <button
              key={s.role}
              type="button"
              onClick={() => setActiveRole(s.role)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                s.role === activeRole
                  ? 'bg-coral/10 text-coral border border-coral/30'
                  : 'bg-app-bg text-soft-dark border border-border hover:border-coral/40'
              }`}
            >
              {s.role}
              <span className="ml-1.5 text-neutral">({s.count})</span>
            </button>
          ))}
        </div>

        {/* ---- Desktop: left sidebar ---- */}
        <div className="hidden md:flex flex-col w-[240px] shrink-0 border-r border-border py-3 px-2 max-h-[400px] overflow-y-auto">
          <p className="text-[10px] font-bold uppercase tracking-wider text-neutral px-3 mb-2">
            Roles
          </p>
          {summaries.map((s) => (
            <button
              key={s.role}
              type="button"
              onClick={() => setActiveRole(s.role)}
              className={`flex items-center justify-between py-2.5 px-3 rounded-lg text-left transition-colors w-full ${
                s.role === activeRole
                  ? 'bg-coral/10 text-coral border-l-2 border-coral'
                  : 'text-soft-dark hover:bg-hover'
              }`}
            >
              <span className="text-sm font-medium truncate mr-2">
                {s.role}
                <span className="text-xs text-neutral ml-1">({s.count})</span>
              </span>
              <span className="text-xs text-neutral whitespace-nowrap ml-auto">
                {formatCurrency(s.medianTC, displayCurrency, displayCurrency, {
                  compact: true,
                })}
              </span>
            </button>
          ))}
        </div>

        {/* ---- Right: detail panel ---- */}
        {active && (
          <div className="flex-1 p-6 space-y-6">
            {/* Role Header */}
            <div>
              <h2 className="text-xl font-bold text-airbnb">{active.role}</h2>
              <p className="text-sm text-neutral mt-0.5">
                {active.count} salar{active.count === 1 ? 'y' : 'ies'} submitted
              </p>
            </div>

            {/* Total Pay Range Bar */}
            <div>
              <p className="text-xs font-medium text-neutral uppercase tracking-wide mb-2">
                Total Pay Range
              </p>
              <div className="w-full h-2 bg-border rounded-full relative">
                <div
                  className="absolute h-full bg-coral rounded-full"
                  style={{
                    left: `${leftPct}%`,
                    right: `${rightPct}%`,
                  }}
                />
                {/* Median marker */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white border-2 border-coral shadow-sm"
                  style={{ left: `${medianPct}%`, marginLeft: '-7px' }}
                  title={`Median: ${formatCurrency(active.medianTC, displayCurrency, displayCurrency, { compact: true })}`}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs text-neutral">
                <span>
                  {formatCurrency(active.minTC, displayCurrency, displayCurrency, {
                    compact: true,
                  })}
                </span>
                <span className="font-medium text-coral">
                  Median:{' '}
                  {formatCurrency(active.medianTC, displayCurrency, displayCurrency, {
                    compact: true,
                  })}
                </span>
                <span>
                  {formatCurrency(active.maxTC, displayCurrency, displayCurrency, {
                    compact: true,
                  })}
                </span>
              </div>
            </div>

            {/* Compensation Breakdown Stacked Bar */}
            <div>
              <p className="text-xs font-medium text-neutral uppercase tracking-wide mb-2">
                Compensation Breakdown
              </p>
              <div className="w-full h-6 rounded-full overflow-hidden flex flex-row">
                <div
                  className="bg-data-blue h-full transition-all"
                  style={{ width: `${active.avgBase}%` }}
                />
                <div
                  className="bg-coral h-full transition-all"
                  style={{ width: `${active.avgBonus}%` }}
                />
                <div
                  className="h-full transition-all"
                  style={{
                    width: `${active.avgStock}%`,
                    backgroundColor: '#0891b2',
                  }}
                />
              </div>
              <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2.5">
                <span className="flex items-center gap-1.5 text-xs text-soft-dark">
                  <span className="w-2.5 h-2.5 rounded-full bg-data-blue inline-block" />
                  Base {Math.round(active.avgBase)}%
                </span>
                <span className="flex items-center gap-1.5 text-xs text-soft-dark">
                  <span className="w-2.5 h-2.5 rounded-full bg-coral inline-block" />
                  Bonus {Math.round(active.avgBonus)}%
                </span>
                <span className="flex items-center gap-1.5 text-xs text-soft-dark">
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block"
                    style={{ backgroundColor: '#0891b2' }}
                  />
                  Equity {Math.round(active.avgStock)}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
