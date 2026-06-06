// 'use client' — justified because: implements interactive image onError fallback handling state.
'use client';

import { useState } from 'react';
import Image from 'next/image';

export interface CompanyLogoProps {
  companyName: string;
  companySlug: string;
  logoUrl?: string;
  size?: 'sm' | 'md' | 'lg';
}

const PREMIUM_COLORS = [
  'bg-rose-500',
  'bg-sky-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-violet-500',
  'bg-fuchsia-500',
  'bg-indigo-500',
  'bg-coral',
];

const getDeterministicColor = (slug: string): string => {
  let hash = 0;
  const cleanSlug = slug.toLowerCase();
  for (let i = 0; i < cleanSlug.length; i++) {
    hash = cleanSlug.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % PREMIUM_COLORS.length;
  return PREMIUM_COLORS[index];
};

export const CompanyLogo = ({
  companyName,
  companySlug,
  logoUrl,
  size = 'md',
}: CompanyLogoProps): React.ReactElement => {
  const [hasError, setHasError] = useState(false);

  const dimensions = {
    sm: { width: 24, height: 24, class: 'w-6 h-6 text-[10px]' },
    md: { width: 32, height: 32, class: 'w-8 h-8 text-xs' },
    lg: { width: 48, height: 48, class: 'w-12 h-12 text-base' },
  }[size];

  const firstLetter = (companyName.trim() || '?')[0].toUpperCase();
  const bgColor = getDeterministicColor(companySlug);

  const showImage = logoUrl && !hasError;

  return (
    <div
      style={{ width: dimensions.width, height: dimensions.height }}
      className="relative shrink-0 select-none"
    >
      {showImage ? (
        <Image
          src={logoUrl}
          alt={`${companyName} logo`}
          width={dimensions.width}
          height={dimensions.height}
          onError={() => setHasError(true)}
          sizes="(max-width: 640px) 24px, 32px"
          className="rounded-lg object-cover"
        />
      ) : (
        <div
          className={`flex h-full w-full items-center justify-center rounded-lg font-bold text-white shadow-sm ${bgColor} ${dimensions.class}`}
        >
          {firstLetter}
        </div>
      )}
    </div>
  );
};
