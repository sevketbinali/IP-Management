/**
 * Badge Component
 * Industrial-grade badge for status indicators and labels
 */

import React from 'react';
import { cn } from '@/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', dot = false, children, ...props }, ref) => {
    const baseClasses = [
      'inline-flex items-center font-medium rounded-full',
      'transition-colors duration-200',
    ];

    const variantClasses = {
      default: 'bg-secondary-100 text-secondary-800',
      primary: 'bg-primary-100 text-primary-800',
      secondary: 'bg-secondary-100 text-secondary-800',
      success: 'bg-success-100 text-success-800',
      warning: 'bg-warning-100 text-warning-800',
      error: 'bg-error-100 text-error-800',
      outline: 'border border-secondary-300 text-secondary-700',
    };

    const sizeClasses = {
      sm: dot ? 'h-2 w-2' : 'px-2 py-0.5 text-xs',
      md: dot ? 'h-2.5 w-2.5' : 'px-2.5 py-0.5 text-sm',
      lg: dot ? 'h-3 w-3' : 'px-3 py-1 text-sm',
    };

    if (dot) {
      return (
        <span
          className={cn(
            baseClasses,
            variantClasses[variant],
            sizeClasses[size],
            className
          )}
          ref={ref}
          {...props}
        />
      );
    }

    return (
      <span
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge };