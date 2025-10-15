import type { InputHTMLAttributes } from 'react';
import { forwardRef } from 'react';
import { clsx } from 'clsx';
import { Label } from './Label';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, containerClassName, className, id, name, ...props }, ref) => {
    const inputId = id ?? name;

    return (
      <div className={clsx('space-y-1.5', containerClassName)}>
        {label ? <Label htmlFor={inputId}>{label}</Label> : null}
        <input
          ref={ref}
          id={inputId}
          name={name}
          className={clsx(
            'w-full rounded-md border border-neutral-200 bg-surface px-3 py-2 text-sm text-neutral-900 shadow-sm transition focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/20 disabled:cursor-not-allowed disabled:bg-neutral-100',
            error && 'border-rose-400 focus:border-rose-500 focus:ring-rose-200/60',
            className
          )}
          {...props}
        />
        {error ? <p className="text-xs text-rose-500">{error}</p> : null}
        {hint && !error ? <p className="text-xs text-neutral-500">{hint}</p> : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
