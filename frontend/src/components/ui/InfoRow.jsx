import React from 'react';
import { cn } from '../../utils/cn';

export function InfoRow({ label, value, mono, className }) {
  return (
    <div className={cn("flex items-center p-3 bg-background-dark/5 dark:bg-background/5 rounded-xl border border-border-light/50 dark:border-border-dark/50 mb-2", className)}>
      <div className="w-32 shrink-0 text-[10px] font-bold text-text-muted dark:text-text-dark-muted uppercase tracking-widest">
        {label}
      </div>
      <div className={cn(
        "flex-1 text-sm text-text-primary dark:text-text-dark-primary font-semibold",
        mono && "font-mono text-xs"
      )}>
        {value}
      </div>
    </div>
  );
}
