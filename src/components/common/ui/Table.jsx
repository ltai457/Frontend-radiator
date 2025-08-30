import React from 'react';

export const Table = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow overflow-hidden ${className}`}>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        {children}
      </table>
    </div>
  </div>
);

export const TableHead = ({ children }) => (
  <thead className="bg-gray-50">
    {children}
  </thead>
);

export const TableHeader = ({ children, className = '' }) => (
  <th className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${className}`}>
    {children}
  </th>
);

export const TableBody = ({ children }) => (
  <tbody className="bg-white divide-y divide-gray-200">
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
  <td className={`px-6 py-4 whitespace-nowrap ${className}`}>
    {children}
  </td>
);