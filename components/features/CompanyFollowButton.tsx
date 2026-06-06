// 'use client' — justified because: persists follow state in localStorage per company.
'use client';

import { useEffect, useState } from 'react';

export interface CompanyFollowButtonProps {
  companySlug: string;
  companyName: string;
}

const storageKey = (slug: string): string => `talentdash-follow-${slug}`;

export const CompanyFollowButton = ({
  companySlug,
  companyName,
}: CompanyFollowButtonProps): React.ReactElement => {
  const [following, setFollowing] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setFollowing(localStorage.getItem(storageKey(companySlug)) === '1');
    setReady(true);
  }, [companySlug]);

  const handleToggle = (): void => {
    const next = !following;
    setFollowing(next);
    if (next) {
      localStorage.setItem(storageKey(companySlug), '1');
    } else {
      localStorage.removeItem(storageKey(companySlug));
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={!ready}
      aria-pressed={following}
      title={
        following
          ? `Unfollow ${companyName}`
          : `Follow ${companyName} for updates`
      }
      className={`inline-flex items-center justify-center rounded-lg border px-4 py-2 text-sm font-bold transition cursor-pointer disabled:opacity-60 ${
        following
          ? 'border-coral bg-coral-subtle text-coral'
          : 'border-neutral/30 bg-surface text-airbnb hover:bg-hover'
      }`}
    >
      {following ? 'Following' : 'Follow'}
    </button>
  );
};
