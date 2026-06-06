'use client';

import { useState, useEffect, useRef } from 'react';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'salaries', label: 'Salaries' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'benefits', label: 'Benefits' },
  { id: 'jobs', label: 'Jobs' },
  { id: 'interviews', label: 'Interviews' },
  { id: 'qa', label: 'Q&A' },
];

/** Fixed main nav (h-16) plus breathing room. */
const SCROLL_OFFSET_PX = 80;

export const CompanyTabs = (): React.ReactElement => {
  const [activeTab, setActiveTab] = useState('overview');
  const isClickScrolling = useRef(false);

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: `-${SCROLL_OFFSET_PX}px 0px -50% 0px`,
      threshold: 0,
    };

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      if (isClickScrolling.current) return;

      const visibleEntry = entries.find((entry) => entry.isIntersecting);
      if (visibleEntry) {
        setActiveTab(visibleEntry.target.id);
      }
    };

    const observer = new IntersectionObserver(
      handleIntersection,
      observerOptions
    );

    TABS.forEach((tab) => {
      const el = document.getElementById(tab.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleTabClick = (id: string) => {
    setActiveTab(id);
    const el = document.getElementById(id);
    if (el) {
      isClickScrolling.current = true;
      const y =
        el.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET_PX;
      window.scrollTo({ top: y, behavior: 'smooth' });

      setTimeout(() => {
        isClickScrolling.current = false;
      }, 850);
    }
  };

  return (
    <div className="flex justify-center border-b border-border/60 bg-app-bg px-4 py-4">
      <nav
        aria-label="Company sections"
        className="flex h-10 w-[min(640px,calc(100%-2rem))] items-center gap-0.5 overflow-x-auto rounded-full border border-coral/20 bg-surface px-1.5 shadow-md shadow-neutral/5 scrollbar-hide"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => handleTabClick(tab.id)}
            className={`cursor-pointer whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition-colors duration-200 ${
              activeTab === tab.id
                ? 'bg-coral text-white shadow-sm shadow-coral/20'
                : 'text-soft-dark hover:bg-hover hover:text-airbnb'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
};
