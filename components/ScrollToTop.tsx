'use client';

import { useEffect, useState } from 'react';

const SCROLL_THRESHOLD = 320;

export const ScrollToTop = (): React.ReactElement | null => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = (): void => {
      setVisible(window.scrollY > SCROLL_THRESHOLD);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = (): void => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!visible) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Scroll to top"
      className="fixed bottom-6 right-6 z-50 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-coral/20 bg-surface/95 text-coral shadow-md shadow-neutral/10 backdrop-blur-md transition-all hover:bg-coral hover:text-white hover:shadow-lg"
    >
      <i className="ti ti-arrow-up text-lg" />
    </button>
  );
};
