import React from 'react';
import { cn } from '../../utils/cn';

export function Card({ children, className, hover = false, padding = true }) {
  return (
    <div
      className={cn(
        'bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-2xl transition-all duration-300',
        padding && 'p-5',
        hover && 'hover:border-accent/40 hover:-translate-y-0.5 hover:shadow-premium dark:hover:shadow-premium-dark',
        className
      )}
    >
      {children}
    </div>
  );
}
