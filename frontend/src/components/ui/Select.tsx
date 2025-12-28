/**
 * Select Component
 * Industrial-grade select dropdown with search and accessibility
 */

import React, { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { ChevronUpDownIcon, CheckIcon } from '@heroicons/react/20/solid';
import { cn } from '@/utils';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  description?: string;
}

export interface SelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  fullWidth?: boolean;
  className?: string;
}

const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      label,
      value,
      onChange,
      options,
      placeholder = 'Select an option',
      error,
      helperText,
      disabled = false,
      required = false,
      fullWidth = false,
      className,
    },
    ref
  ) => {
    const selectId = `select-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = Boolean(error);

    const selectedOption = options.find(option => option.value === value);

    const baseClasses = [
      'relative w-full cursor-default rounded-md py-2 pl-3 pr-10 text-left',
      'focus:outline-none focus-visible:border-primary-500 focus-visible:ring-2',
      'focus-visible:ring-primary-500 focus-visible:ring-offset-2',
      'transition-colors duration-200',
      'sm:text-sm',
    ];

    const stateClasses = hasError
      ? [
          'border-error-300 text-error-900',
          'focus-visible:border-error-500 focus-visible:ring-error-500',
        ]
      : [
          'border-secondary-300 text-secondary-900',
        ];

    const backgroundClasses = disabled
      ? 'bg-secondary-50 cursor-not-allowed'
      : 'bg-white';

    const widthClasses = fullWidth ? 'w-full' : '';

    return (
      <div className={cn('space-y-1', widthClasses, className)}>
        {label && (
          <label
            htmlFor={selectId}
            className={cn(
              'block text-sm font-medium',
              hasError ? 'text-error-700' : 'text-secondary-700',
              required && "after:content-['*'] after:ml-0.5 after:text-error-500"
            )}
          >
            {label}
          </label>
        )}

        <Listbox value={value} onChange={onChange} disabled={disabled}>
          <div className="relative">
            <Listbox.Button
              ref={ref}
              id={selectId}
              className={cn(
                baseClasses,
                stateClasses,
                backgroundClasses,
                'border h-10'
              )}
              aria-invalid={hasError}
              aria-describedby={
                error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined
              }
            >
              <span className="block truncate">
                {selectedOption ? selectedOption.label : placeholder}
              </span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronUpDownIcon
                  className="h-5 w-5 text-secondary-400"
                  aria-hidden="true"
                />
              </span>
            </Listbox.Button>

            <Transition
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {options.map((option) => (
                  <Listbox.Option
                    key={option.value}
                    className={({ active, disabled: optionDisabled }) =>
                      cn(
                        'relative cursor-default select-none py-2 pl-10 pr-4',
                        active && !optionDisabled
                          ? 'bg-primary-100 text-primary-900'
                          : 'text-secondary-900',
                        optionDisabled && 'opacity-50 cursor-not-allowed'
                      )
                    }
                    value={option.value}
                    disabled={option.disabled}
                  >
                    {({ selected }) => (
                      <>
                        <div className="flex flex-col">
                          <span
                            className={cn(
                              'block truncate',
                              selected ? 'font-medium' : 'font-normal'
                            )}
                          >
                            {option.label}
                          </span>
                          {option.description && (
                            <span className="text-xs text-secondary-500">
                              {option.description}
                            </span>
                          )}
                        </div>
                        {selected ? (
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary-600">
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </Listbox>

        {error && (
          <p
            id={`${selectId}-error`}
            className="text-sm text-error-600"
            role="alert"
          >
            {error}
          </p>
        )}

        {helperText && !error && (
          <p
            id={`${selectId}-helper`}
            className="text-sm text-secondary-500"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export { Select };