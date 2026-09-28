import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, ChevronsUpDown, Search } from 'lucide-react';
import { Card } from './Card';
import { TableSkeleton } from './SkeletonLoader';
import { EmptyState } from './EmptyState';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
}

interface DataTableRowProps<T> {
  row: T;
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
}

const DataTableRow = React.memo(<T extends { id: string }>({
  row,
  columns,
  onRowClick,
}: DataTableRowProps<T>) => {
  return (
    <tr
      onClick={() => onRowClick && onRowClick(row)}
      className={`transition-colors ${
        onRowClick ? 'cursor-pointer hover:bg-primary-tint/20' : ''
      }`}
    >
      {columns.map((col) => (
        <td
          key={col.key}
          className={`px-4 py-3 text-xs text-text ${
            col.align === 'center'
              ? 'text-center'
              : col.align === 'right'
              ? 'text-right'
              : 'text-left'
          }`}
        >
          {col.render ? col.render(row) : (row as any)[col.key]}
        </td>
      ))}
    </tr>
  );
}) as <T extends { id: string }>(props: DataTableRowProps<T>) => React.ReactElement;

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  onRowClick?: (row: T) => void;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: { label: string; onClick: () => void };
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  isLoading = false,
  onRowClick,
  emptyTitle = 'No records found',
  emptyDescription = 'There are no items matching your criteria.',
  emptyAction,
  pageSize = 10,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50],
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const sortedData = useMemo(() => {
    let result = [...data];
    if (sortKey) {
      result.sort((a, b) => {
        const valA = (a as any)[sortKey];
        const valB = (b as any)[sortKey];
        if (valA === valB) return 0;
        if (valA === undefined || valA === null) return 1;
        if (valB === undefined || valB === null) return -1;
        const res = valA > valB ? 1 : -1;
        return sortDir === 'asc' ? res : -res;
      });
    }
    return result;
  }, [data, sortKey, sortDir]);

  if (isLoading) {
    return <TableSkeleton rows={pageSize} />;
  }

  if (data.length === 0) {
    return <EmptyState icon={Search} title={emptyTitle} description={emptyDescription} action={emptyAction} />;
  }

  const totalPages = Math.ceil(sortedData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = sortedData.slice(startIndex, startIndex + pageSize);

  const toggleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDir === 'asc') setSortDir('desc');
      else {
        setSortKey(null);
        setSortDir('asc');
      }
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  return (
    <Card padding="none" className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-background border-b border-border">
              {columns.map((col) => {
                const alignClass =
                  col.align === 'center'
                    ? 'text-center'
                    : col.align === 'right'
                    ? 'text-right'
                    : 'text-left';

                return (
                  <th
                    key={col.key}
                    onClick={() => col.sortable && toggleSort(col.key)}
                    className={`px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted select-none ${
                      col.sortable ? 'cursor-pointer hover:text-text' : ''
                    } ${alignClass}`}
                  >
                    <div
                      className={`inline-flex items-center gap-1.5 ${
                        col.align === 'right' ? 'justify-end' : col.align === 'center' ? 'justify-center' : ''
                      }`}
                    >
                      <span>{col.header}</span>
                      {col.sortable && (
                        <span className="text-muted/60">
                          {sortKey === col.key ? (
                            sortDir === 'asc' ? (
                              <ChevronUp className="w-3.5 h-3.5 text-primary" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 text-primary" />
                            )
                          ) : (
                            <ChevronsUpDown className="w-3.5 h-3.5" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paginatedData.map((row) => (
              <DataTableRow
                key={row.id}
                row={row}
                columns={columns}
                onRowClick={onRowClick}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-3 border-t border-border bg-surface text-xs text-muted">
        <div className="flex items-center gap-3">
          <span>
            Showing <strong className="font-semibold text-text">{startIndex + 1}</strong> to{' '}
            <strong className="font-semibold text-text">
              {Math.min(startIndex + pageSize, data.length)}
            </strong>{' '}
            of <strong className="font-semibold text-text">{data.length}</strong> results
          </span>

          {onPageSizeChange && (
            <div className="flex items-center gap-1.5 border-l border-border pl-3">
              <span>Per page:</span>
              <select
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                className="px-2 py-0.5 text-xs bg-background border border-border rounded-input text-text"
              >
                {pageSizeOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1 font-medium rounded border border-border disabled:opacity-40 hover:bg-background transition-colors"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-7 h-7 rounded font-medium transition-colors ${
                  currentPage === i + 1
                    ? 'bg-primary text-white font-semibold'
                    : 'hover:bg-background text-text'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1 font-medium rounded border border-border disabled:opacity-40 hover:bg-background transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </Card>
  );
}
