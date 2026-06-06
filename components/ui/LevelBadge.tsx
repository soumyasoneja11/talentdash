// RSC — React Server Component. No client-side JavaScript.
import type { LevelEnum } from '@/types/salary';
import { getLevelBadgeStyle } from '@/lib/utils';

export interface LevelBadgeProps {
  level: LevelEnum;
  size?: 'sm' | 'md';
}

export const LevelBadge = ({
  level,
  size = 'md',
}: LevelBadgeProps): React.ReactElement => {
  const { bg, text } = getLevelBadgeStyle(level);
  const sizeClasses =
    size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5';

  return <span className={`badge ${bg} ${text} ${sizeClasses} transition-transform duration-100 hover:scale-105`}>{level}</span>;
};
