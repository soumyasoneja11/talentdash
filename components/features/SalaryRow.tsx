// RSC — React Server Component. No client-side JavaScript.
import type { CurrencyEnum, SalaryRecord } from '@/types/salary';
import { SourceBadge } from '@/components/ui/SourceBadge';
import { LevelBadge } from '@/components/ui/LevelBadge';
import { formatCurrency, formatExperience } from '@/lib/utils';
import Link from 'next/link';
import { CompanyLogo } from '@/components/ui/CompanyLogo';

export interface SalaryRowProps {
  record: SalaryRecord;
  displayCurrency: CurrencyEnum;
  isEven?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export const SalaryRow = ({
  record,
  displayCurrency,
  isEven = false,
  style,
  className,
}: SalaryRowProps): React.ReactElement => {
  const showBreakdown = record.bonus > 0 || record.stock > 0;
  const rowBg = isEven ? 'bg-surface' : 'bg-app-bg/50';

  return (
    <tr
      data-id={record.id}
      className={`group ${rowBg} transition-all duration-150 ease-in-out hover:bg-hover hover:shadow-sm ${className ?? ''}`}
      style={style}
    >
      <td className="border-b border-border py-3 px-4 align-middle">
        <div className="flex items-center gap-3">
          <CompanyLogo
            companyName={record.company_display}
            companySlug={record.company_slug}
            size="sm"
          />
          <div className="flex flex-col gap-1">
            <Link
              href={`/companies/${record.company_slug}`}
              prefetch={true}
              title={record.company_display}
              className="block max-w-[20ch] truncate font-medium text-airbnb hover:text-coral hover:underline transition-colors"
            >
              {record.company_display}
            </Link>
            <SourceBadge
              source={record.source}
              isVerified={record.is_verified}
            />
          </div>
        </div>
      </td>
      <td className="border-b border-border py-3 px-4 align-middle">
        <span
          className="block max-w-[40ch] truncate text-soft-dark"
          title={record.role}
        >
          {record.role}
        </span>
      </td>
      <td className="border-b border-border py-3 px-4 align-middle">
        <LevelBadge level={record.level_standardized} />
      </td>
      <td className="border-b border-border py-3 px-4 align-middle">
        <div className="flex items-center gap-2 text-soft-dark">
          <svg
            className="h-3.5 w-3.5 text-neutral"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 21s-6-5.1-6-10a6 6 0 1 1 12 0c0 4.9-6 10-6 10Z" />
            <circle cx="12" cy="11" r="2.5" />
          </svg>
          <span>{record.location}</span>
        </div>
      </td>
      <td className="border-b border-border py-3 px-4 align-middle text-neutral whitespace-nowrap">
        {formatExperience(record.experience_years)}
      </td>
      <td className="border-b border-border py-3 px-4 align-middle text-soft-dark whitespace-nowrap">
        {formatCurrency(record.base_salary, record.currency, displayCurrency)}
      </td>
      <td className="border-b border-border py-3 px-4 align-middle whitespace-nowrap">
        {record.bonus === 0 ? (
          <span className="text-neutral">&mdash;</span>
        ) : (
          <span className="text-soft-dark">
            {formatCurrency(record.bonus, record.currency, displayCurrency)}
          </span>
        )}
      </td>
      <td className="border-b border-border py-3 px-4 align-middle whitespace-nowrap">
        {record.stock === 0 ? (
          <span className="text-neutral">&mdash;</span>
        ) : (
          <span className="text-soft-dark">
            {formatCurrency(record.stock, record.currency, displayCurrency)}
          </span>
        )}
      </td>
      <td className="border-b border-border py-3 px-4 align-middle whitespace-nowrap">
        <div className="flex items-center gap-2">
          <span className="tabular-nums text-base font-bold text-data-blue transition-colors duration-150 group-hover:text-teal-brand">
            {formatCurrency(
              record.total_compensation,
              record.currency,
              displayCurrency
            )}
          </span>
          {showBreakdown ? (
            <span className="text-xs text-neutral" title="Base + Bonus + Stock">
              <span aria-hidden="true">ⓘ</span>
            </span>
          ) : null}
        </div>
      </td>
    </tr>
  );
};
