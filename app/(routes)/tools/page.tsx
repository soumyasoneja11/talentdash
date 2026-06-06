// RSC — React Server Component. No client-side JavaScript.
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Career & Salary Tools — Tax Calculator, Hike Calculator | TalentDash',
  description:
    'Free career tools for Indian tech professionals. Calculate in-hand salary after tax (New & Old regime), compute salary hikes, and evaluate job offers.',
  alternates: {
    canonical: 'https://talentdash.com/tools',
  },
};

const TOOLS = [
  {
    href: '/tools/salary-calculator',
    title: 'Salary & Tax Calculator',
    description:
      'Calculate your exact monthly in-hand salary from your CTC. Supports both New Tax Regime (FY 2025–26) and Old Tax Regime with HRA and standard deductions.',
    icon: 'ti-calculator',
    available: true,
  },
  {
    href: '/tools/hike-calculator',
    title: 'Hike Calculator',
    description:
      'Enter your current base salary and expected hike percentage to get your new salary and absolute rupee gain instantly. Compare hikes to market averages.',
    icon: 'ti-trending-up',
    available: true,
  },
  {
    href: null,
    title: 'Offer Comparison',
    description:
      'Compare two job offers side-by-side including base, bonus, equity, location cost-of-living adjustments, and growth trajectory.',
    icon: 'ti-scale',
    available: false,
  },
  {
    href: null,
    title: 'EMI & Loan Planner',
    description:
      'Calculate home loan or personal loan EMIs based on your in-hand salary. Know how much you can afford to borrow on your tech salary.',
    icon: 'ti-home',
    available: false,
  },
] as const;

export default function ToolsIndexPage(): React.ReactElement {
  return (
    <div className="bg-app-bg min-h-screen">
      <div className="border-b border-border/60 bg-gradient-to-br from-coral-subtle/60 via-surface to-app-bg">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
          <nav
            aria-label="Breadcrumb"
            className="mb-4 text-xs font-semibold text-neutral"
          >
            <ol className="flex items-center gap-1.5">
              <li>
                <Link
                  href="/"
                  className="animated-link transition-colors hover:text-airbnb"
                >
                  Home
                </Link>
              </li>
              <li aria-hidden="true" className="select-none text-neutral/60">
                &gt;
              </li>
              <li className="text-soft-dark" aria-current="page">
                Tools
              </li>
            </ol>
          </nav>

          <p className="text-xs font-bold uppercase tracking-widest text-coral mb-2">
            Free Calculators
          </p>
          <h1 className="text-3xl font-bold text-airbnb tracking-tight">
            Career Tools
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-neutral leading-relaxed">
            Free calculators to help you negotiate better, understand your
            take-home pay, and evaluate job switches.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
          {TOOLS.map((tool) =>
            tool.available && tool.href ? (
              <Link
                key={tool.title}
                href={tool.href}
                className="reveal group flex flex-col justify-between rounded-2xl border border-border bg-surface p-6 shadow-sm transition-all hover:border-coral/50 hover:shadow-md hover:-translate-y-0.5"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-coral-subtle transition-colors group-hover:bg-hover">
                      <i className={`ti ${tool.icon} text-xl text-coral`} />
                    </div>
                    <h3 className="text-base font-semibold text-airbnb transition-colors group-hover:text-coral">
                      {tool.title}
                    </h3>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-soft-dark">
                    {tool.description}
                  </p>
                </div>
                <div className="mt-5 flex items-center gap-1 text-sm font-bold text-coral group-hover:underline">
                  Open calculator →
                </div>
              </Link>
            ) : (
              <div
                key={tool.title}
                className="reveal flex select-none flex-col justify-between rounded-2xl border border-dashed border-border bg-surface/60 p-6 opacity-80"
              >
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-neutral/5">
                        <i className={`ti ${tool.icon} text-xl text-neutral`} />
                      </div>
                      <h3 className="text-base font-semibold text-airbnb">
                        {tool.title}
                      </h3>
                    </div>
                    <span className="shrink-0 rounded-full border border-amber-100 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                      Coming Soon
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-soft-dark">
                    {tool.description}
                  </p>
                </div>
                <div className="mt-5 text-sm font-semibold text-neutral">
                  Under development
                </div>
              </div>
            )
          )}
        </div>

        <p className="select-none text-center text-xs font-medium italic text-neutral">
          More tools launching soon — tax optimisation, equity vesting
          calculator, and city cost-of-living comparison.
        </p>

        <div className="flex items-start gap-3 rounded-xl border border-coral/20 bg-coral-subtle p-4 shadow-sm select-none">
          <i className="ti ti-info-circle mt-0.5 shrink-0 text-lg text-coral" />
          <p className="text-sm font-semibold leading-relaxed text-soft-dark">
            All calculations are estimates based on standard Indian tax rules
            for FY 2025–26. Consult a CA for precise figures.
          </p>
        </div>
      </div>
    </div>
  );
}
