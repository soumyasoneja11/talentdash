// RSC — React Server Component. No client-side JavaScript.
import { getLevelBadgeStyle } from '@/lib/utils';
import type { LevelEnum } from '@/types/salary';

export interface LevelDistributionBarProps {
  levelDistribution: Record<string, number>;
  totalRecords: number;
}

const LEVEL_ORDER: LevelEnum[] = [
  'L3',
  'L4',
  'L5',
  'L6',
  'SDE_I',
  'SDE_II',
  'SDE_III',
  'STAFF',
  'PRINCIPAL',
  'IC4',
  'IC5',
];

export const LevelDistributionBar = ({
  levelDistribution,
  totalRecords,
}: LevelDistributionBarProps): React.ReactElement => {
  const segments = LEVEL_ORDER.filter(
    (level) => (levelDistribution[level] ?? 0) > 0
  ).map((level) => {
    const count = levelDistribution[level] ?? 0;
    const percentage =
      totalRecords > 0 ? Math.round((count / totalRecords) * 100) : 0;
    const width = totalRecords > 0 ? (count / totalRecords) * 100 : 0;

    return {
      level,
      count,
      percentage,
      width,
      ...getLevelBadgeStyle(level),
    };
  });

  if (segments.length === 0) {
    return (
      <div className="w-full">
        <div className="h-4 w-full overflow-hidden rounded-full bg-hover" />
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden">
      <div className="flex h-4 w-full flex-row overflow-hidden rounded-full">
        {segments.map((segment) => (
          <div
            key={segment.level}
            className={`h-full min-w-[2px] ${segment.bg}`}
            style={{ width: `${segment.width}%` }}
            title={`${segment.level}: ${segment.count} record${segment.count === 1 ? '' : 's'} (${segment.percentage}%)`}
          />
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
        {segments.map((segment) => (
          <div
            key={`legend-${segment.level}`}
            className="flex items-center gap-1.5 text-sm text-neutral"
          >
            <span
              className={`h-2.5 w-2.5 shrink-0 rounded-full ${segment.bg}`}
              aria-hidden="true"
            />
            <span>
              {segment.level} ({segment.count})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
