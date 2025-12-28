/**
 * Input Component
 * Industrial-grade input field with validation and accessibility
 */

import React from 'react';
import { cn } from '@/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      required,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = Boolean(error);

    const baseClasses = [
      'flex h-10 w-full rounded-md border px-3 py-2 text-sm',
      'file:border-0 file:bg-transparent file:text-sm file:font-medium',
      'placeholder:text-secondary-500',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'transition-colors duration-200',
    ];

    const stateClasses = hasError
      ? [
          'border-error-300 text-error-900',
          'focus-visible:border-error-500 focus-visible:ring-error-500',
        ]
      : [
          'border-secondary-300 text-secondary-900',
          'focus-visible:border-primary-500 focus-visible:ring-primary-500',
        ];

    const backgroundClasses = disabled
      ? 'bg-secondary-50'
      : 'bg-white';

    const widthClasses = fullWidth ? 'w-full' : '';

    return (
      <div className={cn('space-y-1', widthClasses)}>
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'block text-sm font-medium',
              hasError ? 'text-error-700' : 'text-secondary-700',
              required && "after:content-['*'] after:ml-0.5 after:text-error-500"
            )}
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400">
              {leftIcon}
            </div>
          )}
          
          <input
            type={type}
            className={cn(
              baseClasses,
              stateClasses,
              backgroundClasses,
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className
            )}
            ref={ref}
            id={inputId}
            disabled={disabled}
            required={required}
            aria-invalid={hasError}
            aria-describedby={
              error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
            }
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400">
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <p
            id={`${inputId}-error`}
            className="text-sm text-error-600"
            role="alert"
          >
            {error}
          </p>
        )}

        {helperText && !error && (
          <p
            id={`${inputId}-helper`}
            className="text-sm text-secondary-500"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };