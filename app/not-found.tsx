// RSC — React Server Component. No client-side JavaScript.
import Link from 'next/link';

export default function NotFound(): React.ReactElement {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center px-6">
      <h1 className="text-2xl font-semibold text-airbnb">
        404 — Page Not Found
      </h1>
      <Link
        href="/salaries"
        className="mt-4 text-sm font-medium text-coral hover:underline"
      >
        Go to Salaries
      </Link>
    </div>
  );
}
