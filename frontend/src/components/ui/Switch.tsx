import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(({ className, ...props }, ref) => {
  return (
    <label className="inline-flex cursor-pointer items-center">
      <input
        ref={ref}
        type="checkbox"
        className="peer sr-only"
        {...props}
      />
      <span
        className={clsx(
          'relative inline-flex h-5 w-10 items-center rounded-full bg-neutral-300 transition-colors peer-checked:bg-brand',
          className
        )}
      >
        <span className="absolute left-0.5 h-4 w-4 transform rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
      </span>
    </label>
  );
});

Switch.displayName = 'Switch';
