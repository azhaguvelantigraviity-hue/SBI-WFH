import React from 'react';
import { cn } from '../../utils/cn';

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className, 
  icon: Icon, 
  ...props 
}) {
  const variants = {
    primary: 'bg-accent hover:bg-accent-light text-white shadow-sm hover:shadow-accent/20',
    secondary: 'bg-background-dark/5 dark:bg-background/5 border border-border-light dark:border-border-dark text-text-secondary dark:text-text-dark-secondary hover:bg-background-dark/10 dark:hover:bg-background/10',
    ghost: 'bg-transparent border border-border-light dark:border-border-dark text-text-secondary dark:text-text-dark-secondary hover:bg-background-dark/5 dark:hover:bg-background/5',
    danger: 'bg-danger/10 border border-danger/30 text-danger hover:bg-danger/20',
    success: 'bg-success/10 border border-success/30 text-success hover:bg-success/20',
    outline: 'bg-transparent border border-accent text-accent hover:bg-accent/10',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-2.5 text-base',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {Icon && <Icon className={cn("w-4 h-4", size === 'sm' && "w-3.5 h-3.5")} />}
      {children}
    </button>
  );
}
