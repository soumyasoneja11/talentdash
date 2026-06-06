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

export const CompanyTabs = (): React.ReactElement => {
  const [activeTab, setActiveTab] = useState('overview');
  const isClickScrolling = useRef(false);

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-120px 0px -50% 0px', // Trigger when section enters middle of viewport
      threshold: 0,
    };

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      if (isClickScrolling.current) return;

      // Find the entry that is intersecting
      const visibleEntry = entries.find((entry) => entry.isIntersecting);
      if (visibleEntry) {
        setActiveTab(visibleEntry.target.id);
      }
    };

    const observer = new IntersectionObserver(handleIntersection, observerOptions);

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
      // Subtract navbar/sticky tab heights for scroll offset
      const yOffset = -120; 
      const y = el.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });

      // Reset after smooth scroll finishes (roughly 800ms)
      setTimeout(() => {
        isClickScrolling.current = false;
      }, 850);
    }
  };

  return (
    <div className="border-b border-border bg-surface sticky top-0 z-30 px-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide -mb-px">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-airbnb border-coral font-semibold'
                  : 'text-neutral border-transparent hover:text-airbnb hover:border-border'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
