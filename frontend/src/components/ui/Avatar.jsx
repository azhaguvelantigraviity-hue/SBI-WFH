import React from 'react';
import { cn } from '../../utils/cn';

export function Avatar({ name, src, size = 'md', className }) {
  const sizes = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-[12px]',
    md: 'w-10 h-10 text-[14px]',
    lg: 'w-14 h-14 text-[18px]',
    xl: 'w-20 h-20 text-[24px]',
  };

  const getInitials = (n) => {
    if (!n) return '??';
    return n.split(' ').map(part => part[0]).slice(0, 2).join('').toUpperCase();
  };

  // Deterministic background based on name
  const getGradient = (n) => {
    const colors = [
      'from-accent to-accent-light',
      'from-success to-teal',
      'from-danger to-warning',
      'from-info to-purple',
      'from-purple to-danger',
    ];
    const charCodeSum = (n || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[charCodeSum % colors.length];
  };

  if (src) {
    return (
      <img
        src={src}
        alt={name || 'Avatar'}
        className={cn(
          "rounded-full object-cover shrink-0 shadow-sm border-2 border-white dark:border-border-dark",
          sizes[size] || size,
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "rounded-full bg-gradient-to-br flex items-center justify-center font-bold font-fraunces text-white shrink-0 shadow-sm border-2 border-white dark:border-border-dark",
        sizes[size] || size,
        getGradient(name || ''),
        className
      )}
    >
      {getInitials(name)}
    </div>
  );
}
