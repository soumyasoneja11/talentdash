// RSC — React Server Component. No client-side JavaScript.
export interface EmptyStateProps {
  message: string;
  clearLink?: string;
}

export const EmptyState = ({
  message,
  clearLink,
}: EmptyStateProps): React.ReactElement => {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-surface px-6 py-10 text-center">
      <svg
        className="h-10 w-10 text-neutral"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-3.5-3.5" />
      </svg>
      <p className="text-soft-dark">{message}</p>
      {clearLink ? (
        <a className="text-coral hover:underline" href={clearLink}>
          Clear all filters
        </a>
      ) : null}
    </div>
  );
};
