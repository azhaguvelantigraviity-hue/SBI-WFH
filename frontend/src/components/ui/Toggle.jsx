import React, { useState } from 'react';
import { cn } from '../../utils/cn';

export function Toggle({ defaultOn = false, onChange, className }) {
  const [on, setOn] = useState(defaultOn);

  const handleToggle = () => {
    const newState = !on;
    setOn(newState);
    onChange?.(newState);
  };

  return (
    <button
      onClick={handleToggle}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-accent/20",
        on ? "bg-accent" : "bg-background-dark/20 dark:bg-background/20",
        className
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 shadow-sm",
          on ? "translate-x-6" : "translate-x-1"
        )}
      />
    </button>
  );
}
