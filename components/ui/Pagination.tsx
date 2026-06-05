// RSC — React Server Component. No client-side JavaScript.
import Link from 'next/link';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  pageSize: number;
  basePath: string;
  searchParams: Record<string, string | string[]>;
}

const buildPageHref = (
  basePath: string,
  searchParams: Record<string, string | string[]>,
  page: number
): string => {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (key === 'page') {
      continue;
    }
    if (Array.isArray(value)) {
      value.forEach((entry) => params.append(key, entry));
    } else {
      params.append(key, value);
    }
  }

  if (page > 1) {
    params.set('page', String(page));
  }

  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
};

const HiddenSearchParams = ({
  searchParams,
}: {
  searchParams: Record<string, string | string[]>;
}): React.ReactElement => (
  <>
    {Object.entries(searchParams)
      .filter(([key]) => key !== 'page')
      .flatMap(([key, value]) =>
        Array.isArray(value)
          ? value.map((entry) => (
              <input
                key={`${key}-${entry}`}
                type="hidden"
                name={key}
                value={entry}
              />
            ))
          : [<input key={key} type="hidden" name={key} value={value} />]
      )}
  </>
);

export const Pagination = ({
  currentPage,
  totalPages,
  totalRecords,
  pageSize,
  basePath,
  searchParams,
}: PaginationProps): React.ReactElement => {
  const startRecord = totalRecords === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalRecords);
  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= totalPages || totalPages === 0;
  const prevHref = buildPageHref(basePath, searchParams, currentPage - 1);
  const nextHref = buildPageHref(basePath, searchParams, currentPage + 1);

  return (
    <div className="flex flex-row items-center justify-between border-t border-border px-6 py-4 min-h-[52px]">
      <p className="text-sm text-neutral">
        {totalRecords === 0
          ? 'No records found'
          : `Showing ${startRecord}–${endRecord} of ${totalRecords} records`}
      </p>

      <div className="flex items-center gap-4">
        {totalPages > 10 ? (
          <form
            method="GET"
            action={basePath}
            className="flex items-center gap-2 text-sm text-neutral"
          >
            <HiddenSearchParams searchParams={searchParams} />
            <label htmlFor="pagination-page-jump">Go to page:</label>
            <input
              id="pagination-page-jump"
              type="number"
              name="page"
              min={1}
              max={totalPages}
              defaultValue={currentPage}
              className="w-14 rounded border border-border px-2 py-1 text-sm text-soft-dark focus:border-data-blue focus:outline-none"
            />
            <button
              type="submit"
              className="text-sm text-data-blue hover:underline"
            >
              Go
            </button>
          </form>
        ) : null}

        <div className="flex items-center gap-3">
          {isFirstPage ? (
            <span className="pointer-events-none text-sm text-neutral opacity-50">
              ← Previous
            </span>
          ) : (
            <Link
              href={prevHref}
              aria-label="Go to previous page"
              className="text-sm text-data-blue hover:underline"
            >
              ← Previous
            </Link>
          )}

          <span className="text-sm text-neutral">
            Page {totalPages === 0 ? 0 : currentPage} of {totalPages}
          </span>

          {isLastPage ? (
            <span className="pointer-events-none text-sm text-neutral opacity-50">
              Next →
            </span>
          ) : (
            <Link
              href={nextHref}
              aria-label="Go to next page"
              className="text-sm text-data-blue hover:underline"
            >
              Next →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
