/**
 * Table Component
 * Industrial-grade data table with sorting, filtering, and pagination
 */

import React from 'react';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/20/solid';
import { cn } from '@/utils';
import { TableColumn, TableProps } from '@/types';
import { Button } from './Button';

function Table<T extends { id: string }>({
  data,
  columns,
  loading = false,
  pagination,
  selection,
  actions,
}: TableProps<T>): JSX.Element {
  const [sortBy, setSortBy] = React.useState<keyof T | null>(null);
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('asc');

  const handleSort = (column: TableColumn<T>): void => {
    if (!column.sortable) return;

    if (sortBy === column.key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column.key);
      setSortOrder('asc');
    }
  };

  const sortedData = React.useMemo(() => {
    if (!sortBy) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      let comparison = 0;
      if (aValue > bValue) comparison = 1;
      if (aValue < bValue) comparison = -1;

      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }, [data, sortBy, sortOrder]);

  const handleSelectAll = (checked: boolean): void => {
    if (!selection) return;
    
    if (checked) {
      selection.onChange(data.map(item => item.id));
    } else {
      selection.onChange([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean): void => {
    if (!selection) return;

    if (checked) {
      selection.onChange([...selection.selectedRowKeys, id]);
    } else {
      selection.onChange(selection.selectedRowKeys.filter(key => key !== id));
    }
  };

  const isAllSelected = selection && data.length > 0 && 
    selection.selectedRowKeys.length === data.length;
  const isIndeterminate = selection && 
    selection.selectedRowKeys.length > 0 && 
    selection.selectedRowKeys.length < data.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
          <span className="text-sm text-secondary-600">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Table Actions */}
      {actions && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {selection && selection.selectedRowKeys.length > 0 && (
              <span className="text-sm text-secondary-600">
                {selection.selectedRowKeys.length} selected
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {actions.onCreate && (
              <Button onClick={actions.onCreate} size="sm">
                Add New
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-secondary-200 bg-white shadow">
        <table className="min-w-full divide-y divide-secondary-200">
          <thead className="bg-secondary-50">
            <tr>
              {selection && (
                <th className="w-12 px-6 py-3">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isIndeterminate || false;
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={cn(
                    'px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-secondary-500',
                    column.sortable && 'cursor-pointer select-none hover:bg-secondary-100',
                    column.className
                  )}
                  style={{ width: column.width }}
                  onClick={() => handleSort(column)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.title}</span>
                    {column.sortable && (
                      <div className="flex flex-col">
                        <ChevronUpIcon
                          className={cn(
                            'h-3 w-3',
                            sortBy === column.key && sortOrder === 'asc'
                              ? 'text-primary-600'
                              : 'text-secondary-400'
                          )}
                        />
                        <ChevronDownIcon
                          className={cn(
                            'h-3 w-3 -mt-1',
                            sortBy === column.key && sortOrder === 'desc'
                              ? 'text-primary-600'
                              : 'text-secondary-400'
                          )}
                        />
                      </div>
                    )}
                  </div>
                </th>
              ))}
              {actions && (actions.onEdit || actions.onDelete || actions.onView) && (
                <th className="w-32 px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-secondary-500">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary-200 bg-white">
            {sortedData.map((row, index) => (
              <tr
                key={row.id}
                className={cn(
                  'hover:bg-secondary-50',
                  selection?.selectedRowKeys.includes(row.id) && 'bg-primary-50'
                )}
              >
                {selection && (
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                      checked={selection.selectedRowKeys.includes(row.id)}
                      onChange={(e) => handleSelectRow(row.id, e.target.checked)}
                    />
                  </td>
                )}
                {columns.map((column) => (
                  <td
                    key={String(column.key)}
                    className={cn(
                      'px-6 py-4 text-sm text-secondary-900',
                      column.className
                    )}
                  >
                    {column.render
                      ? column.render(row[column.key], row)
                      : String(row[column.key] ?? '')}
                  </td>
                ))}
                {actions && (actions.onEdit || actions.onDelete || actions.onView) && (
                  <td className="px-6 py-4 text-right text-sm">
                    <div className="flex items-center justify-end space-x-2">
                      {actions.onView && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => actions.onView!(row)}
                        >
                          View
                        </Button>
                      )}
                      {actions.onEdit && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => actions.onEdit!(row)}
                        >
                          Edit
                        </Button>
                      )}
                      {actions.onDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => actions.onDelete!(row)}
                          className="text-error-600 hover:text-error-700"
                        >
                          Delete
                        </Button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {data.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-sm text-secondary-500">No data available</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.total > pagination.pageSize && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-secondary-700">
            Showing {((pagination.current - 1) * pagination.pageSize) + 1} to{' '}
            {Math.min(pagination.current * pagination.pageSize, pagination.total)} of{' '}
            {pagination.total} results
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.current === 1}
              onClick={() => pagination.onChange(pagination.current - 1, pagination.pageSize)}
            >
              Previous
            </Button>
            <span className="text-sm text-secondary-700">
              Page {pagination.current} of {Math.ceil(pagination.total / pagination.pageSize)}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.current >= Math.ceil(pagination.total / pagination.pageSize)}
              onClick={() => pagination.onChange(pagination.current + 1, pagination.pageSize)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export { Table };