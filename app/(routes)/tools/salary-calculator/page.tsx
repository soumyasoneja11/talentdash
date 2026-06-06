// 'use client' — justified because: interactive tax calculator managing form state, dynamic visibility transitions, and real-time calculations.
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/*  Tax Calculations Math                                             */
/* ------------------------------------------------------------------ */

const computeNewRegimeTax = (taxable: number): number => {
  if (taxable <= 700000) return 0; // 87A rebate applies (tax is zero if taxable income <= 7 Lakhs)

  let tax = 0;
  if (taxable <= 300000) {
    tax = 0;
  } else if (taxable <= 700000) {
    tax = (taxable - 300000) * 0.05;
  } else if (taxable <= 1000000) {
    tax = 20000 + (taxable - 700000) * 0.10; // 20000 is 5% of (7L - 3L)
  } else if (taxable <= 1200000) {
    tax = 50000 + (taxable - 1000000) * 0.15; // 50000 is 20000 + 10% of (10L - 7L)
  } else if (taxable <= 1500000) {
    tax = 80000 + (taxable - 1200000) * 0.20; // 80000 is 50000 + 15% of (12L - 10L)
  } else {
    tax = 140000 + (taxable - 1500000) * 0.30; // 140000 is 80000 + 20% of (15L - 12L)
  }

  // Surcharge
  let surcharge = 0;
  if (taxable > 10000000) {
    surcharge = tax * 0.15;
  } else if (taxable > 5000000) {
    surcharge = tax * 0.10;
  }

  const taxAfterSurcharge = tax + surcharge;
  const cess = taxAfterSurcharge * 0.04;

  return taxAfterSurcharge + cess;
};

const computeOldRegimeTax = (taxable: number): number => {
  if (taxable <= 500000) return 0; // 87A rebate applies

  let tax = 0;
  if (taxable <= 250000) {
    tax = 0;
  } else if (taxable <= 500000) {
    tax = (taxable - 250000) * 0.05;
  } else if (taxable <= 1000000) {
    tax = 12500 + (taxable - 500000) * 0.20; // 12500 is 5% of (5L - 2.5L)
  } else {
    tax = 112500 + (taxable - 1000000) * 0.30; // 112500 is 12500 + 20% of (10L - 5L)
  }

  let surcharge = 0;
  if (taxable > 10000000) {
    surcharge = tax * 0.15;
  } else if (taxable > 5000000) {
    surcharge = tax * 0.10;
  }

  const taxAfterSurcharge = tax + surcharge;
  const cess = taxAfterSurcharge * 0.04;

  return taxAfterSurcharge + cess;
};

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

export default function SalaryCalculatorPage(): React.ReactElement {
  const [ctc, setCtc] = useState<number>(1200000);
  const [regime, setRegime] = useState<'new' | 'old'>('new');
  const [hraReceived, setHraReceived] = useState<number>(0);
  const [deductions80C, setDeductions80C] = useState<number>(150000);
  const [professionalTax, setProfessionalTax] = useState<number>(2400);

  // Real-time calculations
  const calculations = useMemo(() => {
    const isNew = regime === 'new';
    const standardDeduction = isNew ? 75000 : 50000;
    const exempt80C = isNew ? 0 : Math.min(deductions80C, 150000);
    const exemptHRA = isNew ? 0 : hraReceived;
    const profTax = isNew ? 0 : professionalTax;

    const totalDeductions = standardDeduction + exempt80C + exemptHRA + profTax;
    const taxableIncome = Math.max(0, ctc - totalDeductions);

    const annualTax = isNew
      ? computeNewRegimeTax(taxableIncome)
      : computeOldRegimeTax(taxableIncome);

    // PF: simplified: ₹1,800/month = ₹21,600/year if CTC > 2.16L, else 12% of CTC/12 * 12
    const pfEmployee = ctc > 216000 ? 21600 : ctc * 0.12;

    const netAnnualTakeHome = Math.max(0, ctc - annualTax - pfEmployee - (isNew ? 0 : profTax));
    const monthlyInhand = netAnnualTakeHome / 12;

    const effectiveTaxRate = ctc > 0 ? (annualTax / ctc) * 100 : 0;

    return {
      standardDeduction,
      exempt80C,
      exemptHRA,
      taxableIncome,
      annualTax,
      pfEmployee,
      netAnnualTakeHome,
      monthlyInhand,
      effectiveTaxRate,
    };
  }, [ctc, regime, hraReceived, deductions80C, professionalTax]);

  return (
    <div className="bg-app-bg min-h-screen py-8 font-sans">
      <div className="mx-auto max-w-4xl px-4 space-y-6">
        
        {/* ========== BREADCRUMB & BACK LINK ========== */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none">
          <nav aria-label="Breadcrumb" className="text-xs font-semibold text-neutral">
            <ol className="flex items-center gap-1.5">
              <li>
                <Link href="/" className="animated-link hover:text-airbnb transition-colors">
                  Home
                </Link>
              </li>
              <li aria-hidden="true" className="text-neutral/60">&gt;</li>
              <li>
                <Link href="/tools" className="animated-link hover:text-airbnb transition-colors">
                  Tools
                </Link>
              </li>
              <li aria-hidden="true" className="text-neutral/60">&gt;</li>
              <li className="text-soft-dark" aria-current="page">
                Salary Calculator
              </li>
            </ol>
          </nav>
          
          <Link
            href="/tools"
            className="animated-link text-xs font-semibold text-neutral hover:text-airbnb flex items-center gap-1 transition-colors"
          >
            ← Back to Tools
          </Link>
        </div>

        {/* ========== PAGE HEADER ========== */}
        <div>
          <h1 className="text-2xl font-bold text-airbnb tracking-tight">
            Salary &amp; Tax Calculator
          </h1>
          <p className="mt-1 text-sm text-neutral font-medium">
            Estimate your monthly in-hand pay from Annual CTC
          </p>
        </div>

        {/* ========== TWO-COLUMN GRID ========== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          
          {/* LEFT COLUMN - INPUT PANEL */}
          <div className="bg-surface border border-border rounded-2xl p-6 space-y-5 shadow-sm">
            {/* Input 1 - Annual CTC */}
            <div>
              <label htmlFor="ctc-input" className="block text-sm font-bold text-airbnb mb-1.5">
                Annual CTC (₹)
              </label>
              <input
                id="ctc-input"
                type="number"
                min="0"
                value={ctc === 0 ? '' : ctc}
                onChange={(e) => setCtc(Math.max(0, Number(e.target.value)))}
                placeholder="Enter annual CTC"
                className="w-full border border-border rounded-xl px-4 py-3 text-base font-semibold text-airbnb bg-surface focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral/20"
              />
              <div className="mt-1 flex items-center justify-between text-xs text-neutral select-none font-semibold">
                <span>₹{ctc.toLocaleString('en-IN')}</span>
                <span>= {formatCurrency(ctc, 'INR', 'INR', { compact: true })}</span>
              </div>
            </div>

            {/* Input 2 - Tax Regime Toggle */}
            <div>
              <span className="block text-sm font-bold text-airbnb mb-1.5">
                Tax Regime
              </span>
              <div className="flex rounded-xl border border-border p-1 bg-app-bg w-full select-none">
                <button
                  type="button"
                  onClick={() => setRegime('new')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer text-center ${
                    regime === 'new'
                      ? 'bg-surface text-airbnb shadow-sm border border-border/40'
                      : 'text-neutral hover:text-airbnb'
                  }`}
                >
                  New Regime (Default)
                </button>
                <button
                  type="button"
                  onClick={() => setRegime('old')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer text-center ${
                    regime === 'old'
                      ? 'bg-surface text-airbnb shadow-sm border border-border/40'
                      : 'text-neutral hover:text-airbnb'
                  }`}
                >
                  Old Regime
                </button>
              </div>
            </div>

            {/* OLD REGIME CONDITIONAL INPUTS */}
            <div
              className={`transition-all duration-300 overflow-hidden ${
                regime === 'old'
                  ? 'max-h-[500px] opacity-100 border-t border-border/60 pt-4 space-y-4'
                  : 'max-h-0 opacity-0 pointer-events-none'
              }`}
            >
              {/* Input 3 - HRA Exemption */}
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <label htmlFor="hra-input" className="text-sm font-bold text-airbnb">
                    HRA Exemption (₹)
                  </label>
                  <span
                    className="text-neutral cursor-help text-xs"
                    title="Enter the HRA amount that qualifies for exemption (not total HRA received)"
                  >
                    ⓘ
                  </span>
                </div>
                <input
                  id="hra-input"
                  type="number"
                  min="0"
                  value={hraReceived === 0 ? '' : hraReceived}
                  onChange={(e) => setHraReceived(Math.max(0, Number(e.target.value)))}
                  placeholder="Enter exempt HRA"
                  className="w-full border border-border rounded-xl px-4 py-3 text-sm font-semibold text-airbnb bg-surface focus:border-coral focus:outline-none"
                />
                <span className="text-[10px] text-neutral mt-0.5 block select-none">
                  Exempt portion: ₹{hraReceived.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Input 4 - 80C Deductions */}
              <div>
                <label htmlFor="deductions-80c" className="block text-sm font-bold text-airbnb mb-1.5">
                  80C Deductions (₹)
                </label>
                <input
                  id="deductions-80c"
                  type="number"
                  min="0"
                  value={deductions80C === 0 ? '' : deductions80C}
                  onChange={(e) => setDeductions80C(Math.max(0, Number(e.target.value)))}
                  placeholder="Enter 80C amount (ELSS, PF, LIC)"
                  className="w-full border border-border rounded-xl px-4 py-3 text-sm font-semibold text-airbnb bg-surface focus:border-coral focus:outline-none"
                />
                <div className="mt-1 flex items-center justify-between text-[10px] select-none font-semibold">
                  <span className="text-neutral">Max limit: ₹1,50,000</span>
                  {deductions80C > 150000 && (
                    <span className="text-warning">Capped at ₹1,50,000 for calculation</span>
                  )}
                </div>
              </div>

              {/* Input 5 - Professional Tax */}
              <div>
                <label htmlFor="prof-tax-input" className="block text-sm font-bold text-airbnb mb-1.5">
                  Professional Tax (₹/year)
                </label>
                <input
                  id="prof-tax-input"
                  type="number"
                  min="0"
                  value={professionalTax === 0 ? '' : professionalTax}
                  onChange={(e) => setProfessionalTax(Math.max(0, Number(e.target.value)))}
                  className="w-full border border-border rounded-xl px-4 py-3 text-sm font-semibold text-airbnb bg-surface focus:border-coral focus:outline-none"
                />
                <span className="text-[10px] text-neutral mt-1 block select-none">
                  Standard: ₹200/month. Varies by state.
                </span>
              </div>
            </div>

            {/* Disclaimer */}
            <p className="text-[10px] text-neutral italic border-t border-border/60 pt-4 select-none">
              Estimates based on FY 2024–25 tax rules. Does not account for perquisites, LTA, or complex deductions.
            </p>
          </div>

          {/* RIGHT COLUMN - OUTPUT PANEL */}
          <div className="bg-surface border border-border rounded-2xl p-6 space-y-5 shadow-sm">
            {/* Primary output */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-neutral uppercase tracking-wide block select-none">
                Monthly In-Hand
              </span>
              <span className="text-4xl font-black text-airbnb block tracking-tight">
                {formatCurrency(calculations.monthlyInhand, 'INR', 'INR')}
              </span>
              {regime === 'new' && calculations.taxableIncome <= 700000 && (
                <span className="bg-green-50 text-success text-[10px] font-bold px-3 py-1 rounded-full border border-success/10 inline-flex items-center gap-1 select-none mt-2">
                  <i className="ti ti-shield-check text-xs" />
                  Zero Tax — 87A Rebate Applied
                </span>
              )}
            </div>

            {/* Divider */}
            <hr className="border-border/60" />

            {/* Breakdown Table */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-neutral uppercase tracking-wide block select-none mb-1">
                Annual Breakdown
              </span>

              {/* Rows */}
              <div className="divide-y divide-border/60 text-sm font-sans">
                {/* CTC */}
                <div className="flex justify-between py-2.5">
                  <span className="text-soft-dark font-medium">Gross Annual CTC</span>
                  <span className="font-semibold text-airbnb">
                    {formatCurrency(ctc, 'INR', 'INR')}
                  </span>
                </div>

                {/* Standard Deduction */}
                <div className="flex justify-between py-2.5">
                  <span className="text-soft-dark font-medium">Standard Deduction</span>
                  <span className="font-semibold text-success">
                    -{formatCurrency(calculations.standardDeduction, 'INR', 'INR')}
                  </span>
                </div>

                {/* HRA Exemption */}
                {regime === 'old' && (
                  <div className="flex justify-between py-2.5">
                    <span className="text-soft-dark font-medium">HRA Exemption</span>
                    <span className="font-semibold text-success">
                      -{formatCurrency(calculations.exemptHRA, 'INR', 'INR')}
                    </span>
                  </div>
                )}

                {/* 80C Deductions */}
                {regime === 'old' && (
                  <div className="flex justify-between py-2.5">
                    <span className="text-soft-dark font-medium">80C Deductions</span>
                    <span className="font-semibold text-success">
                      -{formatCurrency(calculations.exempt80C, 'INR', 'INR')}
                    </span>
                  </div>
                )}

                {/* Taxable Income */}
                <div className="flex justify-between py-2.5 bg-app-bg/40 px-2 rounded-lg -mx-2">
                  <span className="text-soft-dark font-bold">Taxable Income</span>
                  <span className="font-bold text-airbnb">
                    {formatCurrency(calculations.taxableIncome, 'INR', 'INR')}
                  </span>
                </div>

                {/* Income Tax */}
                <div className="flex justify-between py-2.5">
                  <span className="text-soft-dark font-medium">Income Tax (incl. cess)</span>
                  <span className="font-semibold text-error">
                    -{formatCurrency(calculations.annualTax, 'INR', 'INR')}
                  </span>
                </div>

                {/* PF */}
                <div className="flex justify-between py-2.5">
                  <span className="text-soft-dark font-medium">PF (Employee)</span>
                  <span className="font-semibold text-error">
                    -{formatCurrency(calculations.pfEmployee, 'INR', 'INR')}
                  </span>
                </div>

                {/* Professional Tax */}
                <div className="flex justify-between py-2.5">
                  <span className="text-soft-dark font-medium">Professional Tax</span>
                  <span className="font-semibold text-error">
                    -{formatCurrency(regime === 'new' ? 0 : professionalTax, 'INR', 'INR')}
                  </span>
                </div>

                {/* Net Take-home */}
                <div className="flex justify-between py-3 border-t border-border/80 bg-blue-50/10 px-2 rounded-lg -mx-2">
                  <span className="text-airbnb font-extrabold text-sm">Net Annual Take-Home</span>
                  <span className="font-extrabold text-airbnb text-base">
                    {formatCurrency(calculations.netAnnualTakeHome, 'INR', 'INR')}
                  </span>
                </div>

                {/* Effective Tax Rate */}
                <div className="flex justify-between py-2.5 text-xs text-neutral select-none">
                  <span>Effective Tax Rate</span>
                  <span className="font-bold">
                    {calculations.effectiveTaxRate.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Visual Bar */}
            <div className="space-y-1.5 pt-2 select-none">
              <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-coral rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(calculations.effectiveTaxRate, 45)}%`,
                  }}
                />
              </div>
              <p className="text-[10px] text-neutral font-semibold text-center mt-1">
                You keep {formatCurrency(calculations.netAnnualTakeHome, 'INR', 'INR')} of your ₹{ctc.toLocaleString('en-IN')} CTC annually
              </p>
            </div>

            {/* CTA */}
            <div className="pt-2 text-center select-none border-t border-border/60">
              <Link
                href="/salaries"
                className="text-xs font-bold text-coral hover:underline inline-flex items-center gap-0.5"
              >
                See how your salary compares →
              </Link>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
