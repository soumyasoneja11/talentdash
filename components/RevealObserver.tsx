// 'use client' — justified because: observes `.reveal` elements on route changes for scroll-in animations.
'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export const RevealObserver = (): null => {
  const pathname = usePathname();

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    document
      .querySelectorAll('.reveal:not(.revealed)')
      .forEach((el) => io.observe(el));

    return () => io.disconnect();
  }, [pathname]);

  return null;
};
