// 'use client' — justified because: manages interactive state for two dropdown selectors synced to URL search parameters.
'use client';

/*
 * ===================================================================
 * COMPARE PAGE — User Journey
 * ===================================================================
 */

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ComparisonTable } from '@/components/features/ComparisonTable';
import { getCompanyBySlug, SALARY_RECORDS } from '@/lib/mock-data';
import { formatCurrency } from '@/lib/utils';
import type { SalaryRecord } from '@/types/salary';

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

/** Build an option label in the format the spec requires. */
const buildOptionLabel = (
  record: SalaryRecord,
  displayCurrency: 'INR' | 'USD'
): string => {
  const tc = formatCurrency(
    record.total_compensation,
    record.currency,
    displayCurrency,
    { compact: true }
  );
  return `${record.company_display} — ${record.role} — ${record.level_standardized} — ${tc}`;
};

/**
 * Given a company slug, find the salary record with the highest TC
 * belonging to that company. Returns null if the slug has no records.
 */
const getHighestTcRecordForCompany = (slug: string): SalaryRecord | null => {
  const companyRecords = SALARY_RECORDS.filter((r) => r.company_slug === slug);
  if (companyRecords.length === 0) return null;
  return companyRecords.reduce((best, r) =>
    r.total_compensation > best.total_compensation ? r : best
  );
};

/* ------------------------------------------------------------------ */
/*  Inner component (needs useSearchParams → must be inside Suspense) */
/* ------------------------------------------------------------------ */

function ComparePageContent(): React.ReactElement {
  const searchParams = useSearchParams();
  const router = useRouter();

  const paramS1 = searchParams.get('s1');
  const paramS2 = searchParams.get('s2');
  const paramC1 = searchParams.get('c1');

  const recordMap = useMemo(
    () => new Map(SALARY_RECORDS.map((r) => [r.id, r])),
    []
  );

  // --- c1 → s1 promotion ----------------------------------------- //
  const c1Handled = useRef(false);
  const companyFromC1 = paramC1 ? getCompanyBySlug(paramC1) : null;

  useEffect(() => {
    if (c1Handled.current) return;
    if (!paramC1 || paramS1) return; // nothing to promote
    c1Handled.current = true;

    const bestRecord = getHighestTcRecordForCompany(paramC1);
    if (!bestRecord) return; // unknown company slug

    const params = new URLSearchParams(searchParams.toString());
    params.delete('c1'); // consume the c1 param
    params.set('s1', bestRecord.id); // promote to explicit record
    router.replace(`/compare?${params.toString()}`);
  }, [paramC1, paramS1, searchParams, router]);

  // --- Edge case: invalid IDs ------------------------------------- //
  const record1 = paramS1 ? (recordMap.get(paramS1) ?? null) : null;
  const record2 = paramS2 ? (recordMap.get(paramS2) ?? null) : null;
  const invalidId1 = paramS1 !== null && record1 === null;
  const invalidId2 = paramS2 !== null && record2 === null;

  // Auto-clear invalid IDs from URL
  useEffect(() => {
    if (!invalidId1 && !invalidId2) return;
    const params = new URLSearchParams(searchParams.toString());
    if (invalidId1) params.delete('s1');
    if (invalidId2) params.delete('s2');
    router.replace(
      `/compare${params.toString() ? `?${params.toString()}` : ''}`
    );
  }, [invalidId1, invalidId2, searchParams, router]);

  // --- Edge case: identical records ------------------------------- //
  const isIdentical =
    record1 !== null && record2 !== null && record1.id === record2.id;

  // --- Currency toggle (state only, not URL) ---------------------- //
  const [displayCurrency, setDisplayCurrency] = useState<'INR' | 'USD'>('INR');

  const updateUrl = useCallback(
    (slot: 's1' | 's2', id: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('c1');
      if (id) {
        params.set(slot, id);
      } else {
        params.delete(slot);
      }
      router.push(`/compare?${params.toString()}`, { scroll: false });
    },
    [searchParams, router]
  );

  const handleSelect1 = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      updateUrl('s1', e.target.value || null);
    },
    [updateUrl]
  );

  const handleSelect2 = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      updateUrl('s2', e.target.value || null);
    },
    [updateUrl]
  );

  // --- Clipboard share functionality ------------------------------ //
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  // --- Contextual banner when arriving from a company page -------- //
  const showCompanyContext =
    companyFromC1 !== null &&
    companyFromC1 !== undefined &&
    (paramC1 !== null ||
      (record1 !== null &&
        record1.company_slug === companyFromC1.slug &&
        paramS2 === null));

  return (
    <div className="bg-app-bg min-h-screen">
      <div className="border-b border-border/60 bg-gradient-to-br from-coral-subtle/60 via-surface to-app-bg">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-coral mb-2">
                Side-by-Side
              </p>
              <h1 className="text-3xl font-bold text-airbnb tracking-tight">
                Compare Salary Records
              </h1>
              <p className="mt-2 text-sm text-neutral max-w-xl">
                Select any two records from the salary database to benchmark
                compensation side-by-side.
              </p>
            </div>

            <div className="inline-flex shrink-0 overflow-hidden rounded-full border border-border text-xs font-semibold shadow-sm">
              <button
                type="button"
                onClick={() => setDisplayCurrency('INR')}
                aria-label="Show salaries in Indian Rupees"
                className={`cursor-pointer px-4 py-2 transition-colors ${
                  displayCurrency === 'INR'
                    ? 'bg-coral text-white'
                    : 'bg-surface text-soft-dark hover:bg-hover'
                }`}
              >
                ₹ INR
              </button>
              <button
                type="button"
                onClick={() => setDisplayCurrency('USD')}
                aria-label="Show salaries in US Dollars"
                className={`cursor-pointer px-4 py-2 transition-colors ${
                  displayCurrency === 'USD'
                    ? 'bg-coral text-white'
                    : 'bg-surface text-soft-dark hover:bg-hover'
                }`}
              >
                $ USD
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 space-y-6">

        {/* ---- Company context banner (from company page "Compare" button) ---- */}
        {showCompanyContext && (
          <div className="rounded-xl border border-coral/30 bg-coral-subtle px-4 py-3 text-xs font-semibold text-soft-dark shadow-sm">
            Comparing from{' '}
            <span className="font-bold text-coral">{companyFromC1!.name}</span>.
            Change selection below.
          </div>
        )}

        {/* ---- Invalid-ID banner ---- */}
        {(invalidId1 || invalidId2) && (
          <div className="rounded-xl border border-warning/40 bg-warning/10 px-4 py-3 text-xs font-semibold text-soft-dark shadow-sm">
            Record not found. It may have been removed.
          </div>
        )}

        {/* ---- Selectors Row ---- */}
        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-6 shadow-sm md:flex-row md:items-end md:gap-4">
          {/* Record 1 Selector */}
          <div className="flex-1 w-full font-sans">
            <label
              htmlFor="compare-select-1"
              className="mb-1 block text-xs font-medium uppercase tracking-wide text-neutral"
            >
              Record 1
            </label>
            <select
              id="compare-select-1"
              value={record1?.id ?? ''}
              onChange={handleSelect1}
              className="w-full cursor-pointer rounded-xl border border-border bg-surface px-4 py-3 text-sm text-airbnb focus:border-coral focus:outline-none"
            >
              <option value="" disabled>
                Select a salary record...
              </option>
              {SALARY_RECORDS.map((record) => (
                <option key={record.id} value={record.id}>
                  {buildOptionLabel(record, displayCurrency)}
                </option>
              ))}
            </select>
          </div>

          {/* VS Divider */}
          <div className="flex items-center justify-center shrink-0 md:pb-1 select-none">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-coral/30 bg-coral-subtle text-xs font-bold text-coral">
              vs
            </div>
          </div>

          {/* Record 2 Selector */}
          <div className="flex-1 w-full font-sans">
            <label
              htmlFor="compare-select-2"
              className="mb-1 block text-xs font-medium uppercase tracking-wide text-neutral"
            >
              Record 2
            </label>
            <select
              id="compare-select-2"
              value={record2?.id ?? ''}
              onChange={handleSelect2}
              className="w-full cursor-pointer rounded-xl border border-border bg-surface px-4 py-3 text-sm text-airbnb focus:border-coral focus:outline-none"
            >
              <option value="" disabled>
                Select a salary record...
              </option>
              {SALARY_RECORDS.map((record) => (
                <option key={record.id} value={record.id}>
                  {buildOptionLabel(record, displayCurrency)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ---- Result area ---- */}
        {isIdentical ? (
          /* Edge case: same record selected in both slots */
          <div className="rounded-xl border border-warning/40 bg-warning/10 px-4 py-3 text-xs font-semibold text-soft-dark shadow-sm">
            You&apos;re comparing a record with itself. Please select two different records.
          </div>
        ) : record1 && record2 ? (
          <div className="space-y-6">
            <ComparisonTable
              record1={record1}
              record2={record2}
              displayCurrency={displayCurrency}
            />

            {/* Share Button */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleShare}
                className="flex cursor-pointer items-center gap-2 rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-airbnb shadow-sm transition-colors hover:border-coral/40 hover:bg-coral-subtle"
              >
                {copied ? (
                  <>
                    <i className="ti ti-check text-success text-base" />
                    <span>✓ Copied!</span>
                  </>
                ) : (
                  <>
                    <i className="ti ti-share text-base" />
                    <span>Share this comparison</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center p-8 bg-surface border border-dashed border-border rounded-2xl min-h-[260px] shadow-sm select-none">
            <svg width="80" height="60" viewBox="0 0 80 60" className="mb-4">
              <rect x="2" y="8" width="32" height="44" rx="4" fill="none" stroke="#EBEBEB" strokeWidth="2" />
              <rect x="46" y="8" width="32" height="44" rx="4" fill="none" stroke="#EBEBEB" strokeWidth="2" strokeDasharray="4,3" />
              <line x1="37" y1="30" x2="43" y2="30" stroke="#717171" strokeWidth="1.5" />
            </svg>
            <p className="text-sm font-semibold text-airbnb text-center">
              {!record1 && !record2
                ? 'Select two records to see the comparison'
                : 'Now select a second record'}
            </p>
            <p className="text-xs text-neutral text-center mt-1">
              {!record1 && !record2
                ? 'Choose any two offers from the database above to benchmark them side-by-side.'
                : 'Choose another offer to compare packages and levels.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page export (wraps in Suspense for useSearchParams)               */
/* ------------------------------------------------------------------ */

export default function ComparePage(): React.ReactElement {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[300px] items-center justify-center bg-app-bg">
          <p className="text-sm text-neutral font-semibold">Loading comparison…</p>
        </div>
      }
    >
      <ComparePageContent />
    </Suspense>
  );
}
