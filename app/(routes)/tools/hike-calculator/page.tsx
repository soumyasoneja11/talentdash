// 'use client' — justified because: interactive hike calculator managing input synchronisation, slider controls, tab-switching, and clipboard interactions.
'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';

function HikeCalculatorContent(): React.ReactElement {
  const searchParams = useSearchParams();

  const [currentSalary, setCurrentSalary] = useState<number>(1000000);
  const [mode, setMode] = useState<'percentage' | 'newSalary'>('percentage');
  const [hikePercent, setHikePercent] = useState<number>(30);
  const [newSalary, setNewSalary] = useState<number>(1300000);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Parse query params on mount
  useEffect(() => {
    const baseParam = searchParams.get('base');
    const hikeParam = searchParams.get('hike');
    let initBase = 1000000;
    let initHike = 30;

    if (baseParam) {
      const parsedBase = Number(baseParam);
      if (!isNaN(parsedBase) && parsedBase > 0) {
        initBase = parsedBase;
      }
    }
    if (hikeParam) {
      const parsedHike = Number(hikeParam);
      if (!isNaN(parsedHike) && parsedHike >= 0) {
        initHike = parsedHike;
      }
    }

    setCurrentSalary(initBase);
    setHikePercent(initHike);
    setNewSalary(initBase * (1 + initHike / 100));
  }, [searchParams]);

  // Synchronised input handlers
  const handleCurrentSalaryChange = (val: number) => {
    setCurrentSalary(val);
    if (mode === 'percentage') {
      setNewSalary(val * (1 + hikePercent / 100));
    } else {
      setHikePercent(val > 0 ? ((newSalary - val) / val) * 100 : 0);
    }
  };

  const handleHikePercentChange = (val: number) => {
    setHikePercent(val);
    setNewSalary(currentSalary * (1 + val / 100));
  };

  const handleNewSalaryChange = (val: number) => {
    setNewSalary(val);
    setHikePercent(currentSalary > 0 ? ((val - currentSalary) / currentSalary) * 100 : 0);
  };

  const isPayCut = newSalary < currentSalary;

  // Industry Benchmarks Logic
  const benchmark = useMemo(() => {
    if (hikePercent < 0) {
      return {
        label: 'Pay Cut',
        colorClass: 'bg-red-50 text-error border-red-200',
        icon: 'ti-trending-down',
        advice:
          'Your target salary is below your current CTC. This represents a pay cut, not a hike — factor in role, equity, or other benefits before accepting.',
      };
    }
    if (hikePercent < 10) {
      return {
        label: 'Below Average',
        colorClass: 'bg-amber-50 text-amber-700 border-amber-200',
        icon: 'ti-trending-down',
        advice: 'Below average for job switches. Typical for internal annual appraisals or promotions in service companies.',
      };
    } else if (hikePercent < 20) {
      return {
        label: 'Average Hike',
        colorClass: 'bg-blue-50 text-blue-700 border-blue-200',
        icon: 'ti-chart-bar',
        advice: 'Average hike. Matches the standard industry rate for mid-year appraisals or standard lateral hires.',
      };
    } else if (hikePercent < 40) {
      return {
        label: 'Good Hike',
        colorClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        icon: 'ti-trending-up',
        advice: 'Good hike. Typical for successful lateral switches in mid-tier to product companies.',
      };
    } else {
      return {
        label: 'Exceptional Hike',
        colorClass: 'bg-purple-50 text-purple-700 border-purple-200',
        icon: 'ti-award',
        advice: 'Exceptional hike! Common for high-demand roles, multiple counter-offers, or transitioning to top-tier product startups.',
      };
    }
  }, [hikePercent]);

  // Calculations for monthly comparison table (~25% flat deductions)
  const comparisons = useMemo(() => {
    const curGross = currentSalary / 12;
    const curDeductions = curGross * 0.25;
    const curNet = curGross * 0.75;

    const newGross = newSalary / 12;
    const newDeductions = newGross * 0.25;
    const newNet = newGross * 0.75;

    return {
      current: { gross: curGross, deductions: curDeductions, net: curNet },
      new: { gross: newGross, deductions: newDeductions, net: newNet },
      change: {
        gross: newGross - curGross,
        deductions: newDeductions - curDeductions,
        net: newNet - curNet,
        percent: currentSalary > 0 ? ((newSalary - currentSalary) / currentSalary) * 100 : 0,
      },
    };
  }, [currentSalary, newSalary]);

  // Actions
  const handleReset = () => {
    setCurrentSalary(1000000);
    setMode('percentage');
    setHikePercent(30);
    setNewSalary(1300000);
  };

  const handleShare = () => {
    const url = `${window.location.origin}${window.location.pathname}?base=${currentSalary}&hike=${hikePercent.toFixed(1)}`;
    navigator.clipboard.writeText(url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

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
                Hike Calculator
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
            Salary Hike Calculator
          </h1>
          <p className="mt-1 text-sm text-neutral font-medium">
            Calculate your hike percent, rupee gain, and estimate new monthly take-home salary.
          </p>
        </div>

        {/* ========== TWO-COLUMN GRID ========== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          
          {/* LEFT COLUMN - INPUT PANEL */}
          <div className="bg-surface border border-border rounded-2xl p-6 space-y-5 shadow-sm">
            
            {/* Input 1 - Current Annual CTC */}
            <div>
              <label htmlFor="current-ctc" className="block text-sm font-bold text-airbnb mb-1.5">
                Current Salary (Annual CTC in ₹)
              </label>
              <div className="relative">
                <input
                  id="current-ctc"
                  type="number"
                  min="0"
                  value={currentSalary === 0 ? '' : currentSalary}
                  onChange={(e) => handleCurrentSalaryChange(Math.max(0, Number(e.target.value)))}
                  placeholder="Enter current annual CTC"
                  className="w-full border border-border rounded-xl px-4 py-3 text-base font-semibold text-airbnb bg-surface focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral/20"
                />
              </div>
              <div className="mt-1 flex items-center justify-between text-xs text-neutral select-none font-semibold">
                <span>₹{currentSalary.toLocaleString('en-IN')}</span>
                <span>= {formatCurrency(currentSalary, 'INR', 'INR', { compact: true })}</span>
              </div>
            </div>

            {/* Segmented control for Calculator Mode */}
            <div>
              <span className="block text-sm font-bold text-airbnb mb-1.5">
                Calculator Mode
              </span>
              <div className="flex rounded-xl border border-border p-1 bg-app-bg w-full select-none">
                <button
                  type="button"
                  onClick={() => setMode('percentage')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer text-center ${
                    mode === 'percentage'
                      ? 'bg-surface text-airbnb shadow-sm border border-border/40'
                      : 'text-neutral hover:text-airbnb'
                  }`}
                >
                  By Hike %
                </button>
                <button
                  type="button"
                  onClick={() => setMode('newSalary')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer text-center ${
                    mode === 'newSalary'
                      ? 'bg-surface text-airbnb shadow-sm border border-border/40'
                      : 'text-neutral hover:text-airbnb'
                  }`}
                >
                  By Target Salary
                </button>
              </div>
            </div>

            {/* Mode 1 - Hike Percentage Inputs */}
            {mode === 'percentage' && (
              <div className="space-y-4 pt-1">
                <div>
                  <label htmlFor="hike-percentage-input" className="block text-sm font-bold text-airbnb mb-1.5">
                    Expected Hike (%)
                  </label>
                  <input
                    id="hike-percentage-input"
                    type="number"
                    min="0"
                    max="1000"
                    value={hikePercent === 0 ? '' : Number(hikePercent.toFixed(1))}
                    onChange={(e) => handleHikePercentChange(Math.max(0, Number(e.target.value)))}
                    placeholder="Enter hike percentage"
                    className="w-full border border-border rounded-xl px-4 py-3 text-sm font-semibold text-airbnb bg-surface focus:border-coral focus:outline-none"
                  />
                </div>

                {/* Synced Slider */}
                <div className="pt-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={Math.min(100, Math.max(0, Math.round(hikePercent)))}
                    onChange={(e) => handleHikePercentChange(Number(e.target.value))}
                    className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-[#FF5A5F]"
                  />
                  <div className="flex justify-between text-[10px] text-neutral font-semibold select-none px-1 mt-1">
                    <span>0%</span>
                    <span>25%</span>
                    <span>50%</span>
                    <span>75%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>
            )}

            {/* Mode 2 - Target Salary Inputs */}
            {mode === 'newSalary' && (
              <div className="space-y-4 pt-1">
                <div>
                  <label htmlFor="new-ctc" className="block text-sm font-bold text-airbnb mb-1.5">
                    Target New Salary (Annual CTC in ₹)
                  </label>
                  <input
                    id="new-ctc"
                    type="number"
                    min="0"
                    value={newSalary === 0 ? '' : newSalary}
                    onChange={(e) => handleNewSalaryChange(Math.max(0, Number(e.target.value)))}
                    placeholder="Enter target salary"
                    className="w-full border border-border rounded-xl px-4 py-3 text-sm font-semibold text-airbnb bg-surface focus:border-coral focus:outline-none"
                  />
                  <div className="mt-1 flex items-center justify-between text-xs text-neutral select-none font-semibold">
                    <span>₹{newSalary.toLocaleString('en-IN')}</span>
                    <span>= {formatCurrency(newSalary, 'INR', 'INR', { compact: true })}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Actions Panel */}
            <div className="flex gap-3 pt-3 select-none border-t border-border/60">
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 py-2.5 px-4 rounded-xl border border-border text-xs font-bold text-soft-dark hover:bg-app-bg hover:text-airbnb transition-colors cursor-pointer text-center"
              >
                <i className="ti ti-rotate-2 mr-1" />
                Reset
              </button>
              
              <button
                type="button"
                onClick={handleShare}
                className="flex-1 py-2.5 px-4 rounded-xl bg-airbnb hover:bg-airbnb-dark text-xs font-bold text-white transition-all cursor-pointer text-center relative flex items-center justify-center gap-1.5"
              >
                <i className="ti ti-share mr-0.5" />
                {isCopied ? 'Copied URL!' : 'Share Hike'}
              </button>
            </div>

          </div>

          {/* RIGHT COLUMN - OUTPUT PANEL */}
          <div className="bg-surface border border-border rounded-2xl p-6 space-y-6 shadow-sm">
            
            {/* Primary output displays */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] font-bold text-neutral uppercase tracking-wide block select-none">
                  New Annual CTC
                </span>
                <span className="text-2xl font-black text-airbnb block tracking-tight mt-1">
                  {formatCurrency(newSalary, 'INR', 'INR')}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-neutral uppercase tracking-wide block select-none">
                  Absolute Increase
                </span>
                <span className="text-2xl font-black text-success block tracking-tight mt-1">
                  +{formatCurrency(newSalary - currentSalary, 'INR', 'INR')}
                </span>
              </div>
            </div>

            {isPayCut && (
              <div className="rounded-xl border border-error/30 bg-red-50 px-4 py-3 text-xs font-semibold text-error">
                This is a pay cut of{' '}
                {formatCurrency(currentSalary - newSalary, 'INR', 'INR')} (
                {Math.abs(hikePercent).toFixed(1)}% decrease), not a hike.
              </div>
            )}

            {/* Large Hike Percentage & Benchmark Pill */}
            <div className="bg-app-bg/50 border border-border/60 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold text-neutral uppercase tracking-wide block select-none">
                  Calculated Hike
                </span>
                <span className="text-3xl font-extrabold text-airbnb block mt-0.5">
                  {hikePercent.toFixed(1)}%
                </span>
              </div>

              <div className="flex flex-col items-start md:items-end gap-1.5">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${benchmark.colorClass} select-none`}>
                  <i className={`ti ${benchmark.icon} text-sm`} />
                  {benchmark.label}
                </span>
              </div>
            </div>

            {/* Benchmark Text Description */}
            <p className="text-xs text-soft-dark leading-relaxed font-semibold">
              <i className="ti ti-info-circle text-coral mr-1 text-sm inline-block align-middle" />
              {benchmark.advice}
            </p>

            {/* Divider */}
            <hr className="border-border/60" />

            {/* Monthly Estimated Breakdown Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-neutral uppercase tracking-wide block select-none">
                  Monthly Breakdown (Est.)
                </span>
                <span className="text-[10px] text-neutral font-semibold italic select-none">
                  * Assumes a flat 25% deduction rate
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-border/80 text-neutral font-bold select-none">
                      <th className="py-2 font-bold">Metric (Monthly)</th>
                      <th className="py-2 text-right">Current</th>
                      <th className="py-2 text-right">After Hike</th>
                      <th className="py-2 text-right text-success">Gain</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 text-soft-dark font-medium">
                    <tr>
                      <td className="py-2.5">Gross Pay</td>
                      <td className="py-2.5 text-right font-semibold">
                        {formatCurrency(comparisons.current.gross, 'INR', 'INR')}
                      </td>
                      <td className="py-2.5 text-right font-semibold text-airbnb">
                        {formatCurrency(comparisons.new.gross, 'INR', 'INR')}
                      </td>
                      <td className="py-2.5 text-right font-bold text-success">
                        +{formatCurrency(comparisons.change.gross, 'INR', 'INR')}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5">Est. Tax &amp; PF (25%)</td>
                      <td className="py-2.5 text-right text-neutral">
                        {formatCurrency(comparisons.current.deductions, 'INR', 'INR')}
                      </td>
                      <td className="py-2.5 text-right text-neutral">
                        {formatCurrency(comparisons.new.deductions, 'INR', 'INR')}
                      </td>
                      <td className="py-2.5 text-right text-error font-semibold">
                        +{formatCurrency(comparisons.change.deductions, 'INR', 'INR')}
                      </td>
                    </tr>
                    <tr className="bg-blue-50/20 font-bold">
                      <td className="py-2.5 font-bold text-airbnb">Take-Home (75%)</td>
                      <td className="py-2.5 text-right text-airbnb">
                        {formatCurrency(comparisons.current.net, 'INR', 'INR')}
                      </td>
                      <td className="py-2.5 text-right text-airbnb">
                        {formatCurrency(comparisons.new.net, 'INR', 'INR')}
                      </td>
                      <td className="py-2.5 text-right text-success font-extrabold">
                        +{formatCurrency(comparisons.change.net, 'INR', 'INR')}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Links and Guidance Footers */}
            <div className="pt-2 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3 select-none text-[11px] font-bold">
              <Link
                href="/tools/salary-calculator"
                className="animated-link text-coral inline-flex items-center gap-0.5"
              >
                Go to precise In-Hand Tax Calculator →
              </Link>
              <Link
                href="/salaries"
                className="animated-link text-neutral hover:text-airbnb transition-colors"
              >
                Explore market salary rates
              </Link>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

export default function HikeCalculatorPage(): React.ReactElement {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[300px] items-center justify-center bg-app-bg">
          <p className="text-sm text-neutral font-semibold">Loading hike calculator…</p>
        </div>
      }
    >
      <HikeCalculatorContent />
    </Suspense>
  );
}
