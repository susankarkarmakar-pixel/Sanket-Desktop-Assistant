import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function Button({ className, variant = 'primary', size = 'md', children, ...props }) {
  const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-bg';

  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-hover shadow-sm',
    secondary: 'bg-surface border border-border text-text hover:bg-black/5 dark:hover:bg-white/5',
    ghost: 'hover:bg-black/5 dark:hover:bg-white/5 text-text',
    danger: 'bg-danger text-white hover:bg-red-600 shadow-sm',
  };

  const sizes = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 py-2 text-sm',
    lg: 'h-12 px-8 text-base',
    icon: 'h-10 w-10',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}

export function Card({ className, children, ...props }) {
  return (
    <div
      className={cn('rounded-xl border border-border bg-surface text-text shadow-sm', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        'flex h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm placeholder:text-text/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  );
}

export function Badge({ className, variant = 'default', children, ...props }) {
  const variants = {
    default: 'bg-black/10 dark:bg-white/10 text-text',
    success: 'bg-success/20 text-success-700 dark:text-success-400',
    warning: 'bg-warning/20 text-warning-700 dark:text-warning-400',
    danger: 'bg-danger/20 text-danger-700 dark:text-danger-400',
    primary: 'bg-primary/20 text-primary-700 dark:text-primary-400',
  };

  return (
    <span
      className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors', variants[variant], className)}
      {...props}
    >
      {children}
    </span>
  );
}
