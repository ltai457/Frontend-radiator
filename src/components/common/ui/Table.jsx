import React from 'react';

export const Table = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow overflow-hidden ${className}`}>
    <div className="overflow-x-auto">
      <table className="w-full table-auto border-collapse text-sm">
        {children}
      </table>
    </div>
  </div>
);

export const TableHeader = ({ children, className = '' }) => (
  <thead className={`bg-gray-50 ${className}`}>
    {children}
  </thead>
);

export const TableHead = ({ children, className = '' }) => (
  <th
    className={`px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${className}`}
  >
    {children}
  </th>
);

export const TableBody = ({ children, className = '' }) => (
  <tbody className={`divide-y divide-gray-200 ${className}`}>
    {children}
  </tbody>
);

export const TableRow = ({ children, onClick, className = '' }) => (
  <tr
    className={`hover:bg-gray-50 ${onClick ? 'cursor-pointer' : ''} ${className}`}
    onClick={onClick}
  >
    {children}
  </tr>
);

export const TableCell = ({ children, className = '' }) => (
  <td className={`px-3 py-2 align-middle whitespace-nowrap ${className}`}>
    {children}
  </td>
);
