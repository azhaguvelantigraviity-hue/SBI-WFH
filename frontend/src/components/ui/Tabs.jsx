import React from 'react';
import { cn } from '../../utils/cn';

export function Tabs({ tabs, active, onChange, className }) {
  return (
    <div className={cn("inline-flex items-center p-1 bg-background-dark/5 dark:bg-background/5 rounded-xl border border-border-light/50 dark:border-border-dark/50", className)}>
      {tabs.map(tab => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={cn(
            "px-4 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 whitespace-nowrap",
            active === tab.value 
              ? "bg-card-light dark:bg-card-dark text-accent shadow-sm ring-1 ring-border-light dark:ring-border-dark" 
              : "text-text-muted dark:text-text-dark-muted hover:text-text-secondary dark:hover:text-text-dark-secondary"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
