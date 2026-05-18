import React from 'react';
import { cn } from '../../utils/cn';

export function Table({ columns, rows, onRowClick, className }) {
  return (
    <div className={cn("w-full overflow-x-auto", className)}>
      <table className="w-full border-collapse text-left text-sm">
        <thead className="border-b-2 border-border-light dark:border-border-dark">
          <tr>
            {columns.map(col => (
              <th 
                key={col.key} 
                className="px-4 py-3 text-[11px] font-bold text-text-muted dark:text-text-dark-muted uppercase tracking-wider whitespace-nowrap"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border-light/50 dark:divide-border-dark/50">
          {rows.map((row, idx) => (
            <tr 
              key={idx} 
              onClick={() => onRowClick?.(row)}
              className={cn(
                "group transition-colors hover:bg-background-dark/5 dark:hover:bg-background/5",
                onRowClick && "cursor-pointer"
              )}
            >
              {columns.map(col => (
                <td 
                  key={col.key} 
                  className={cn(
                    "px-4 py-3 align-middle",
                    col.muted ? "text-text-muted dark:text-text-dark-muted" : "text-text-primary dark:text-text-dark-primary font-medium"
                  )}
                >
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && (
        <div className="py-20 flex flex-col items-center justify-center text-text-muted dark:text-text-dark-muted">
          <div className="text-3xl mb-2 opacity-20">○</div>
          <p className="text-sm">No records found</p>
        </div>
      )}
    </div>
  );
}
