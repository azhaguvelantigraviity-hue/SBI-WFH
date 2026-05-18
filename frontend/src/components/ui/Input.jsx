import React, { useState } from 'react';
import { cn } from '../../utils/cn';
import { Eye, EyeOff } from 'lucide-react';

export function Input({ 
  label, 
  error, 
  className, 
  mono, 
  required, 
  hint, 
  type = 'text',
  ...props 
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <label className="block text-[11px] font-bold text-text-muted dark:text-text-dark-muted uppercase tracking-wider mb-1.5 ml-1">
          {label}
          {required && <span className="text-danger ml-0.5">*</span>}
        </label>
      )}
      <div className={cn(isPassword && "relative")}>
        <input
          type={isPassword ? (showPassword ? 'text' : 'password') : type}
          className={cn(
            "w-full bg-background-dark/5 dark:bg-background/5 border border-border-light dark:border-border-dark rounded-lg px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent",
            isPassword && "pr-10",
            mono && "font-mono",
            error && "border-danger focus:ring-danger/20 focus:border-danger",
            "placeholder:text-text-muted dark:placeholder:text-text-dark-muted"
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors focus:outline-none"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {hint && <p className="mt-1 text-[10px] text-text-muted dark:text-text-dark-muted ml-1">{hint}</p>}
      {error && <p className="mt-1 text-[10px] text-danger ml-1 font-medium">{error}</p>}
    </div>
  );
}

