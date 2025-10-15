import type { ReactNode } from 'react';
import { clsx } from 'clsx';

export interface DataTableColumn<T extends Record<string, unknown>> {
  header: string;
  accessor: keyof T | ((row: T) => ReactNode);
  className?: string;
}

interface DataTableProps<T extends Record<string, unknown>> {
  columns: DataTableColumn<T>[];
  rows: T[];
  isLoading?: boolean;
  emptyState?: ReactNode;
}

export function DataTable<T extends Record<string, unknown>>({ columns, rows, isLoading, emptyState }: DataTableProps<T>) {
  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200">
      <table className="min-w-full divide-y divide-neutral-200">
        <thead className="bg-neutral-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.header}
                className={clsx('px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500', column.className)}
                scope="col"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200 bg-surface">
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-6 text-center text-sm text-neutral-500">
                Loading data…
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-6 text-center text-sm text-neutral-500">
                {emptyState ?? 'No data available.'}
              </td>
            </tr>
          ) : (
            rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-neutral-50">
                {columns.map((column) => {
                  const value = typeof column.accessor === 'function' ? column.accessor(row) : row[column.accessor];
                  return (
                    <td key={column.header} className={clsx('px-4 py-3 text-sm text-neutral-700', column.className)}>
                      {value as ReactNode}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
