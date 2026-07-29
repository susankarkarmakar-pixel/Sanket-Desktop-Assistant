import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function Button({ className, variant = 'primary', size = 'md', children, ...props }) {
  const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none ring-offset-transparent no-drag-region';

  const variants = {
    primary: 'bg-primary text-white shadow-[0_2px_4px_rgba(0,122,255,0.2)] hover:shadow-[0_4px_8px_rgba(0,122,255,0.3)]',
    secondary: 'bg-surface border border-border/50 text-text shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:bg-black/5 dark:hover:bg-white/10',
    ghost: 'hover:bg-black/5 dark:hover:bg-white/10 text-text',
    danger: 'bg-danger text-white shadow-[0_2px_4px_rgba(255,59,48,0.2)] hover:shadow-[0_4px_8px_rgba(255,59,48,0.3)]',
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
      className={cn('rounded-2xl border border-border/40 bg-surface/80 backdrop-blur-xl text-text shadow-[0_4px_24px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.2)] overflow-hidden', className)}
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
        'flex h-10 w-full rounded-lg border border-border/60 bg-surface/80 backdrop-blur-md px-3 py-2 text-sm placeholder:text-text/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary focus:bg-surface disabled:cursor-not-allowed disabled:opacity-50 transition-all no-drag-region shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]',
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
