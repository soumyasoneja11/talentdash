// 'use client' — justified because: manages interactive state for two dropdown selectors synced to URL search parameters.
'use client';

/*
 * ===================================================================
 * COMPARE PAGE — User Journey
 * ===================================================================
 *
 * Full flow from company page → compare page:
 *
 *  1. User visits  /companies/amazon
 *  2. Clicks the "Compare" button
 *  3. Navigates to  /compare?c1=amazon
 *  4. This page reads the `c1` param, finds all salary records where
 *     company_slug === "amazon", and auto-selects the one with the
 *     HIGHEST total_compensation as the initial selection for slot 1.
 *     (UX decision: the highest-TC record is the most "interesting"
 *     default — users comparing offers typically benchmark against
 *     the best-case scenario at a given company.)
 *  5. The URL is immediately rewritten to  /compare?s1=<record_id>
 *     so that the `c1` param is consumed and replaced with an
 *     explicit record reference. This keeps the URL canonical.
 *  6. User selects any second record in slot 2.
 *  7. Comparison table renders; URL updates to
 *     /compare?s1=<id>&s2=<other_id>
 *  8. This final URL is shareable and loads the exact comparison.
 *
 * Direct access paths also work:
 *   - /compare              → empty state, user picks both records
 *   - /compare?s1=X&s2=Y    → pre-loaded comparison
 *   - /compare?c1=google    → auto-selects Google's top record
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
const buildOptionLabel = (record: SalaryRecord): string => {
  const tc = formatCurrency(
    record.total_compensation,
    record.currency,
    record.currency
  );
  return `${record.company_display} — ${record.role} — ${record.level_standardized} — ${record.location} — ${tc}`;
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
  // When the user arrives from a company page with ?c1=<slug>, we
  // auto-select the highest-TC record from that company and rewrite
  // the URL to use the canonical ?s1=<id> form. This only fires once,
  // on the initial mount when c1 is present and s1 is not.
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
      // Always clean up c1 when the user explicitly changes a selection
      params.delete('c1');
      if (id) {
        params.set(slot, id);
      } else {
        params.delete(slot);
      }
      router.push(`/compare?${params.toString()}`);
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

  // --- Contextual banner when arriving from a company page -------- //
  // We show this while c1 is still in the URL (before the effect
  // rewrites it), OR when s1 was just set by the c1 promotion and
  // the record belongs to the company the user came from.
  const showCompanyContext =
    companyFromC1 !== null &&
    companyFromC1 !== undefined &&
    (paramC1 !== null ||
      (record1 !== null &&
        record1.company_slug === companyFromC1.slug &&
        paramS2 === null));

  return (
    <div className="bg-app-bg min-h-screen pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6 pt-6">
        {/* ---- Header + currency toggle ---- */}
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-airbnb tracking-tight">
              Compare Offers
            </h1>
            <p className="mt-1 text-xs text-neutral">
              Compare two salary records side-by-side to analyze compensation
              differences.
            </p>
          </div>

          <div className="inline-flex overflow-hidden rounded-full border border-border text-xs font-semibold">
            <button
              type="button"
              onClick={() => setDisplayCurrency('INR')}
              aria-label="Show salaries in Indian Rupees"
              className={`px-3.5 py-1.5 transition-colors ${
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
              className={`px-3.5 py-1.5 transition-colors ${
                displayCurrency === 'USD'
                  ? 'bg-coral text-white'
                  : 'bg-surface text-soft-dark hover:bg-hover'
              }`}
            >
              $ USD
            </button>
          </div>
        </div>

        {/* ---- Company context banner (from company page "Compare" button) ---- */}
        {showCompanyContext && (
          <div className="rounded-2xl border border-data-blue/30 bg-data-blue/5 px-4 py-3 text-xs font-semibold text-soft-dark shadow-sm">
            Comparing from{' '}
            <span className="text-coral">{companyFromC1!.name}</span>. Change
            selection below.
          </div>
        )}

        {/* ---- Invalid-ID banner ---- */}
        {(invalidId1 || invalidId2) && (
          <div className="rounded-2xl border border-warning/40 bg-warning/10 px-4 py-3 text-xs font-semibold text-soft-dark shadow-sm">
            Record not found. It may have been removed.
          </div>
        )}

        {/* ---- Selectors ---- */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <label
              htmlFor="compare-select-1"
              className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-neutral"
            >
              Record 1
            </label>
            <select
              id="compare-select-1"
              value={record1?.id ?? ''}
              onChange={handleSelect1}
              className="w-full truncate rounded-lg border border-border bg-surface px-3 py-2 text-xs font-medium text-soft-dark shadow-sm transition-colors focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral"
            >
              <option value="" disabled>
                Select a salary record…
              </option>
              {SALARY_RECORDS.map((record) => (
                <option key={record.id} value={record.id}>
                  {buildOptionLabel(record)}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <label
              htmlFor="compare-select-2"
              className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-neutral"
            >
              Record 2
            </label>
            <select
              id="compare-select-2"
              value={record2?.id ?? ''}
              onChange={handleSelect2}
              className="w-full truncate rounded-lg border border-border bg-surface px-3 py-2 text-xs font-medium text-soft-dark shadow-sm transition-colors focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral"
            >
              <option value="" disabled>
                Select a salary record…
              </option>
              {SALARY_RECORDS.map((record) => (
                <option key={record.id} value={record.id}>
                  {buildOptionLabel(record)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ---- Result area ---- */}
        {isIdentical ? (
          /* Edge case: same record selected in both slots */
          <div className="rounded-2xl border border-warning/40 bg-warning/10 px-4 py-3 text-xs font-semibold text-soft-dark shadow-sm">
            You&apos;re comparing a record with itself. Please select two
            different records.
          </div>
        ) : record1 && record2 ? (
          <div className="rounded-2xl border border-border bg-surface shadow-sm overflow-hidden">
            <ComparisonTable
              record1={record1}
              record2={record2}
              displayCurrency={displayCurrency}
            />
          </div>
        ) : (
          <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-border bg-surface shadow-sm">
            <p className="text-xs font-semibold text-neutral">
              {record1 || record2
                ? 'Select a second record to compare'
                : 'Select two salary records to compare'}
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
          <p className="text-sm text-neutral">Loading comparison…</p>
        </div>
      }
    >
      <ComparePageContent />
    </Suspense>
  );
}
