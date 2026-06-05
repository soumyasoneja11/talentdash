// RSC — React Server Component. No client-side JavaScript.
import type { SourceEnum } from '@/types/salary';

export interface SourceBadgeProps {
  source: SourceEnum;
  isVerified: boolean;
}

export const SourceBadge = ({
  source,
  isVerified,
}: SourceBadgeProps): React.ReactElement => {
  if (source === 'CONTRIBUTOR') {
    if (isVerified) {
      return (
        <span className="badge bg-green-100 text-green-700">
          <span aria-hidden="true">✓</span>
          <span className="ml-1">Verified</span>
        </span>
      );
    }
    return <span className="badge bg-gray-100 text-gray-700">Unverified</span>;
  }

  if (source === 'SCRAPED') {
    return <span className="badge bg-slate-100 text-slate-700">Scraped</span>;
  }

  return <span className="badge bg-amber-100 text-amber-700">AI Inferred</span>;
};
