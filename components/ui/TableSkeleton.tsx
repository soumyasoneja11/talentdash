// RSC — React Server Component. No client-side JavaScript.
import React from 'react';

export const TableSkeleton = (): React.ReactElement => {
  const rows = Array.from({ length: 10 });

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="py-3 px-4 text-left text-xs font-medium uppercase tracking-wide text-neutral">
              Company
            </th>
            <th className="py-3 px-4 text-left text-xs font-medium uppercase tracking-wide text-neutral">
              Role
            </th>
            <th className="py-3 px-4 text-left text-xs font-medium uppercase tracking-wide text-neutral">
              Level
            </th>
            <th className="py-3 px-4 text-left text-xs font-medium uppercase tracking-wide text-neutral">
              Location
            </th>
            <th className="py-3 px-4 text-left text-xs font-medium uppercase tracking-wide text-neutral">
              Experience
            </th>
            <th className="py-3 px-4 text-left text-xs font-medium uppercase tracking-wide text-neutral">
              Base Salary
            </th>
            <th className="py-3 px-4 text-left text-xs font-medium uppercase tracking-wide text-neutral">
              Bonus
            </th>
            <th className="py-3 px-4 text-left text-xs font-medium uppercase tracking-wide text-neutral">
              Stock
            </th>
            <th className="py-3 px-4 text-left text-xs font-medium uppercase tracking-wide text-neutral">
              Total Comp
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((_, rowIndex) => (
            <tr key={`sk-row-${rowIndex}`} className="border-b border-border">
              {/* Company Logo + Text */}
              <td className="py-3 px-4 align-middle">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 shrink-0 animate-pulse rounded-lg bg-gray-200" />
                  <div className="flex flex-col gap-1.5">
                    <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                    <div className="h-3 w-12 animate-pulse rounded bg-gray-200" />
                  </div>
                </div>
              </td>
              {/* Role */}
              <td className="py-3 px-4 align-middle">
                <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
              </td>
              {/* Level */}
              <td className="py-3 px-4 align-middle">
                <div className="h-5 w-12 animate-pulse rounded-full bg-gray-200" />
              </td>
              {/* Location */}
              <td className="py-3 px-4 align-middle">
                <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
              </td>
              {/* Experience */}
              <td className="py-3 px-4 align-middle">
                <div className="h-4 w-10 animate-pulse rounded bg-gray-200" />
              </td>
              {/* Base */}
              <td className="py-3 px-4 align-middle">
                <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
              </td>
              {/* Bonus */}
              <td className="py-3 px-4 align-middle">
                <div className="h-4 w-14 animate-pulse rounded bg-gray-200" />
              </td>
              {/* Stock */}
              <td className="py-3 px-4 align-middle">
                <div className="h-4 w-14 animate-pulse rounded bg-gray-200" />
              </td>
              {/* Total Comp */}
              <td className="py-3 px-4 align-middle">
                <div className="h-5 w-20 animate-pulse rounded bg-gray-200" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
