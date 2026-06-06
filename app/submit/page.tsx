// 'use client' — justified because: interactive salary submission form with client-side validation.
'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function SubmitPage(): React.ReactElement {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="bg-app-bg min-h-screen py-8">
        <div className="mx-auto max-w-lg px-4 text-center space-y-4">
          <h1 className="text-2xl font-bold text-airbnb">Thank you!</h1>
          <p className="text-sm text-neutral">
            Your submission has been received. We review every entry before
            publishing it to the salary database.
          </p>
          <Link
            href="/salaries"
            className="inline-flex items-center justify-center rounded-lg bg-teal-brand px-5 py-2.5 text-sm font-bold text-white hover:bg-deep-teal transition-colors"
          >
            Browse salaries
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-app-bg min-h-screen py-8">
      <div className="mx-auto max-w-lg px-4 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-airbnb tracking-tight">
            Submit a Salary
          </h1>
          <p className="mt-1 text-sm text-neutral">
            Help others make informed career decisions. All submissions are
            anonymous and reviewed before publishing.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-surface border border-border rounded-2xl p-6 space-y-4 shadow-sm"
        >
          <div>
            <label
              htmlFor="submit-company"
              className="block text-sm font-bold text-airbnb mb-1"
            >
              Company
            </label>
            <input
              id="submit-company"
              name="company"
              type="text"
              required
              placeholder="e.g. Google India"
              className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-surface focus:border-teal-brand focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="submit-role"
              className="block text-sm font-bold text-airbnb mb-1"
            >
              Role
            </label>
            <input
              id="submit-role"
              name="role"
              type="text"
              required
              placeholder="e.g. Software Engineer"
              className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-surface focus:border-teal-brand focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="submit-level"
                className="block text-sm font-bold text-airbnb mb-1"
              >
                Level
              </label>
              <input
                id="submit-level"
                name="level"
                type="text"
                placeholder="e.g. L4"
                className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-surface focus:border-teal-brand focus:outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="submit-location"
                className="block text-sm font-bold text-airbnb mb-1"
              >
                Location
              </label>
              <input
                id="submit-location"
                name="location"
                type="text"
                required
                placeholder="e.g. Bengaluru"
                className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-surface focus:border-teal-brand focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="submit-ctc"
              className="block text-sm font-bold text-airbnb mb-1"
            >
              Annual Total Compensation (₹)
            </label>
            <input
              id="submit-ctc"
              name="ctc"
              type="number"
              min="0"
              required
              placeholder="e.g. 2500000"
              className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-surface focus:border-teal-brand focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label
                htmlFor="submit-base"
                className="block text-xs font-bold text-airbnb mb-1"
              >
                Base (₹)
              </label>
              <input
                id="submit-base"
                name="base"
                type="number"
                min="0"
                className="w-full border border-border rounded-xl px-3 py-2 text-sm bg-surface focus:border-teal-brand focus:outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="submit-bonus"
                className="block text-xs font-bold text-airbnb mb-1"
              >
                Bonus (₹)
              </label>
              <input
                id="submit-bonus"
                name="bonus"
                type="number"
                min="0"
                defaultValue={0}
                className="w-full border border-border rounded-xl px-3 py-2 text-sm bg-surface focus:border-teal-brand focus:outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="submit-stock"
                className="block text-xs font-bold text-airbnb mb-1"
              >
                Stock (₹)
              </label>
              <input
                id="submit-stock"
                name="stock"
                type="number"
                min="0"
                defaultValue={0}
                className="w-full border border-border rounded-xl px-3 py-2 text-sm bg-surface focus:border-teal-brand focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="submit-experience"
              className="block text-sm font-bold text-airbnb mb-1"
            >
              Years of Experience
            </label>
            <input
              id="submit-experience"
              name="experience"
              type="number"
              min="0"
              step="0.5"
              className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-surface focus:border-teal-brand focus:outline-none"
            />
          </div>

          <p className="text-[10px] text-neutral italic">
            Submissions are stored locally for demo purposes. A backend
            integration will be added in a future release.
          </p>

          <button
            type="submit"
            className="w-full rounded-xl bg-teal-brand py-3 text-sm font-bold text-white hover:bg-deep-teal transition-colors cursor-pointer"
          >
            Submit anonymously
          </button>
        </form>
      </div>
    </div>
  );
}
