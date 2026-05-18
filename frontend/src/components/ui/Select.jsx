import React from 'react';
import { cn } from '../../utils/cn';

export function Select({ 
  label, 
  options = [], 
  className, 
  selectClassName,
  required, 
  error, 
  ...props 
}) {
  return (
    <div className={cn("w-full", className)}>
      {label && (
        <label className="block text-[11px] font-bold text-text-muted dark:text-text-dark-muted uppercase tracking-wider mb-1.5 ml-1">
          {label}
          {required && <span className="text-danger ml-0.5">*</span>}
        </label>
      )}
      <div className="relative group">
        <select
          className={cn(
            "w-full bg-white dark:bg-background-dark/5 border border-border-light dark:border-border-dark rounded-xl px-4 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent cursor-pointer appearance-none shadow-sm group-hover:border-accent/30",
            error && "border-danger focus:ring-danger/20 focus:border-danger",
            selectClassName
          )}
          {...props}
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value} className="bg-white dark:bg-card-dark text-text-primary dark:text-text-dark-primary">
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted group-hover:text-accent transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m19 9-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error && <p className="mt-1 text-[10px] text-danger ml-1 font-medium">{error}</p>}
    </div>
  );
}
