import React from 'react';
import { cn } from '../../utils/cn';

export function ProgressBar({ 
  value, 
  color = 'accent', 
  height = 'h-1.5', 
  className 
}) {
  const colors = {
    accent: 'bg-accent',
    green: 'bg-success',
    amber: 'bg-warning',
    red: 'bg-danger',
    blue: 'bg-info',
    teal: 'bg-teal',
    purple: 'bg-purple',
  };

  const bgColors = {
    accent: 'bg-accent/10',
    green: 'bg-success/10',
    amber: 'bg-warning/10',
    red: 'bg-danger/10',
    blue: 'bg-info/10',
    teal: 'bg-teal/10',
    purple: 'bg-purple/10',
  };

  return (
    <div className={cn("w-full overflow-hidden rounded-full", height, bgColors[color] || 'bg-background-dark/10 dark:bg-background/10', className)}>
      <div
        className={cn("h-full rounded-full transition-all duration-700 ease-out", colors[color] || 'bg-accent')}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
