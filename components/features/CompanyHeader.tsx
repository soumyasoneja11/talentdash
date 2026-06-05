// RSC — React Server Component. No client-side JavaScript.
import Link from 'next/link';
import type { Company } from '@/types/salary';
import { CompanyLogo } from '@/components/ui/CompanyLogo';

export interface CompanyHeaderProps {
  company: Company;
  recordCount: number;
}

export const CompanyHeader = ({
  company,
  recordCount,
}: CompanyHeaderProps): React.ReactElement => {
  const metaParts: string[] = [];

  if (company.founded_year !== undefined) {
    metaParts.push(`Founded ${company.founded_year}`);
  }
  if (company.headcount_range) {
    metaParts.push(company.headcount_range);
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 min-w-0 flex-1">
          <CompanyLogo
            companyName={company.name}
            companySlug={company.slug}
            size="lg"
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1
                className="text-2xl font-bold text-airbnb"
                style={{ textWrap: 'balance', overflowWrap: 'break-word' }}
              >
                {company.name}
              </h1>
              {company.industry ? (
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                  {company.industry}
                </span>
              ) : null}
            </div>

            {company.headquarters ? (
              <p className="mt-2 text-sm text-neutral">
                📍 {company.headquarters}
              </p>
            ) : null}

            {metaParts.length > 0 ? (
              <p className="mt-1 text-sm text-neutral">
                {metaParts.join(' · ')}
              </p>
            ) : null}

            <p className="mt-2 text-sm text-neutral">
              {recordCount} salary record{recordCount === 1 ? '' : 's'} on
              TalentDash
            </p>
          </div>
        </div>

        <Link
          href={`/compare?c1=${encodeURIComponent(company.slug)}`}
          className="shrink-0 rounded-lg border border-coral px-4 py-2 text-sm font-medium text-coral transition hover:bg-coral hover:text-white"
        >
          Compare
        </Link>
      </div>
    </div>
  );
};
