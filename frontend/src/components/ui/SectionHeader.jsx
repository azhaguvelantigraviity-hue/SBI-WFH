import React from 'react';
import { cn } from '../../utils/cn';

export function SectionHeader({ title, subtitle, action, className }) {
  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8", className)}>
      <div>
        <h2 className="text-2xl sm:text-3xl font-fraunces font-bold text-text-primary dark:text-text-dark-primary leading-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-text-secondary dark:text-text-dark-secondary mt-1.5 font-medium">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="flex items-center gap-3 shrink-0">{action}</div>}
    </div>
  );
}
