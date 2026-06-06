// RSC — React Server Component. No client-side JavaScript.
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Career & Salary Tools — Tax Calculator, Hike Calculator | TalentDash',
  description: 'Free career tools for Indian tech professionals. Calculate in-hand salary after tax (New & Old regime), compute salary hikes, and evaluate job offers.',
  alternates: {
    canonical: 'https://talentdash.com/tools',
  },
};

export default function ToolsIndexPage(): React.ReactElement {
  return (
    <div className="bg-app-bg min-h-screen py-8">
      <div className="mx-auto max-w-4xl px-4 space-y-6">
        
        {/* ========== BREADCRUMB ========== */}
        <nav aria-label="Breadcrumb" className="text-xs font-semibold text-neutral">
          <ol className="flex items-center gap-1.5">
            <li>
              <Link href="/" className="animated-link hover:text-airbnb transition-colors">
                Home
              </Link>
            </li>
            <li aria-hidden="true" className="text-neutral/60 select-none">&gt;</li>
            <li className="text-soft-dark" aria-current="page">
              Tools
            </li>
          </ol>
        </nav>

        {/* ========== PAGE HEADER ========== */}
        <div>
          <h1 className="text-3xl font-bold text-airbnb tracking-tight">
            Career Tools
          </h1>
          <p className="mt-2 text-base text-soft-dark leading-relaxed max-w-2xl font-medium">
            Free calculators to help you negotiate better, understand your take-home pay, and evaluate job switches.
          </p>
        </div>

        {/* ========== TOOLS GRID ========== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-6">
          
          {/* TOOL 1 — Salary & Tax Calculator */}
          <Link
            href="/tools/salary-calculator"
            className="reveal bg-surface border border-border rounded-2xl p-6 hover:border-coral hover:shadow-sm transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                  <svg className="w-5 h-5 text-data-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 3h12" />
                    <path d="M6 8h12" />
                    <path d="M6 13h8.5a4.5 4.5 0 0 0 0-9H6" />
                    <path d="M6 13l7.5 7.5" />
                  </svg>
                </div>
                <h3 className="font-semibold text-airbnb text-base group-hover:text-coral transition-colors">
                  Salary &amp; Tax Calculator
                </h3>
              </div>
              <p className="text-sm text-soft-dark leading-relaxed mt-3">
                Calculate your exact monthly in-hand salary from your CTC. Supports both New Tax Regime (FY 2024–25) and Old Tax Regime with HRA and standard deductions.
              </p>
            </div>
            <div className="text-sm text-coral font-bold mt-5 flex items-center gap-1 group-hover:underline">
              Open calculator →
            </div>
          </Link>

          {/* TOOL 2 — Hike Calculator */}
          <Link
            href="/tools/hike-calculator"
            className="reveal bg-surface border border-border rounded-2xl p-6 hover:border-coral hover:shadow-sm transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50">
                  <svg className="w-5 h-5 text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                    <polyline points="17 6 23 6 23 12" />
                  </svg>
                </div>
                <h3 className="font-semibold text-airbnb text-base group-hover:text-coral transition-colors">
                  Hike Calculator
                </h3>
              </div>
              <p className="text-sm text-soft-dark leading-relaxed mt-3">
                Enter your current base salary and expected hike percentage to get your new salary and absolute rupee gain instantly. Compare hikes to market averages.
              </p>
            </div>
            <div className="text-sm text-coral font-bold mt-5 flex items-center gap-1 group-hover:underline">
              Open calculator →
            </div>
          </Link>

          {/* TOOL 3 — Offer Comparison (Coming Soon) */}
          <div
            className="reveal bg-surface/70 border border-border rounded-2xl p-6 opacity-75 select-none flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50">
                    <svg className="w-5 h-5 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="3" x2="12" y2="21" />
                      <line x1="2" y1="7" x2="22" y2="7" />
                      <path d="M5 7c0 7 3 9 7 9s7-2 7-9" />
                      <path d="M19 7c0 7-3 9-7 9" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-airbnb text-base">
                    Offer Comparison
                  </h3>
                </div>
                <span className="bg-amber-50 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded-full border border-amber-100">
                  Coming Soon
                </span>
              </div>
              <p className="text-sm text-soft-dark leading-relaxed mt-3">
                Compare two job offers side-by-side including base, bonus, equity, location cost-of-living adjustments, and growth trajectory.
              </p>
            </div>
            <div className="text-sm text-neutral font-semibold mt-5">
              Under development
            </div>
          </div>

          {/* TOOL 4 — EMI & Loan Calculator (Coming Soon) */}
          <div
            className="reveal bg-surface/70 border border-border rounded-2xl p-6 opacity-75 select-none flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50">
                    <svg className="w-5 h-5 text-orange-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-airbnb text-base">
                    EMI &amp; Loan Planner
                  </h3>
                </div>
                <span className="bg-amber-50 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded-full border border-amber-100">
                  Coming Soon
                </span>
              </div>
              <p className="text-sm text-soft-dark leading-relaxed mt-3">
                Calculate home loan or personal loan EMIs based on your in-hand salary. Know how much you can afford to borrow on your tech salary.
              </p>
            </div>
            <div className="text-sm text-neutral font-semibold mt-5">
              Under development
            </div>
          </div>

        </div>

        {/* ========== LAUNCHING NOTE ========== */}
        <p className="text-xs text-neutral text-center mt-6 select-none font-medium italic">
          More tools launching soon — tax optimisation, equity vesting calculator, and city cost-of-living comparison.
        </p>

        {/* ========== INFO STRIP ========== */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3 shadow-sm select-none">
          <svg className="w-5 h-5 text-data-blue shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <p className="text-sm text-soft-dark leading-relaxed font-semibold">
            All calculations are estimates based on standard Indian tax rules for FY 2024–25. Consult a CA for precise figures.
          </p>
        </div>

      </div>
    </div>
  );
}
