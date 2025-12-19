import React from 'react';

interface Column<T> {
  header: React.ReactNode;
  accessor: keyof T | ((item: T) => React.ReactNode);
  align?: 'left' | 'center' | 'right';
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  renderRowActions?: (item: T) => React.ReactNode;
  getRowClassName?: (item: T) => string;
  onRowClick?: (item: T) => void;
  isScrollable?: boolean;
}

function Table<T extends { id: string | number }>({ columns, data, renderRowActions, getRowClassName, onRowClick, isScrollable = false }: TableProps<T>) {
  
  const tableContent = (
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            {columns.map((col, index) => (
              <th key={index} className={`px-6 py-4 text-${col.align || 'center'} text-xs font-semibold text-gray-500 uppercase tracking-wider bg-white`}>
                {col.header}
              </th>
            ))}
            {renderRowActions && <th className={`px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider bg-white`}>Actions</th>}
          </tr>
        </thead>
        <tbody className="bg-white">
          {data.map((item) => (
            <tr
              key={item.id}
              className={`border-b border-gray-100 ${getRowClassName ? getRowClassName(item) : ''} ${onRowClick ? 'cursor-pointer' : ''}`}
              onClick={() => onRowClick && onRowClick(item)}
            >
              {columns.map((col, index) => (
                <td key={index} className={`px-6 py-4 text-gray-700 text-${col.align || 'center'} align-middle whitespace-nowrap`}>
                  {typeof col.accessor === 'function'
                    ? col.accessor(item)
                    : String(item[col.accessor])}
                </td>
              ))}
               {renderRowActions && (
                <td className="px-6 py-4 text-center align-middle">
                  {renderRowActions(item)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
  );

  if (isScrollable) {
    return (
        <div className="overflow-auto scrollbar-none">
            {tableContent}
        </div>
    );
  }

  return (
    <div className="overflow-x-auto">
        {tableContent}
    </div>
  );
}

export default Table;