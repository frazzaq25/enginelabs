import type { PropsWithChildren, ReactNode } from 'react';
import { clsx } from 'clsx';
import { Label } from './Label';

type FormFieldProps = PropsWithChildren<{
  label: string;
  description?: ReactNode;
  error?: string;
  className?: string;
  htmlFor?: string;
}>;

export function FormField({ label, description, error, children, className, htmlFor }: FormFieldProps) {
  return (
    <div className={clsx('space-y-2', className)}>
      <div>
        <Label htmlFor={htmlFor} className="mb-0 block text-sm font-medium text-neutral-700">
          {label}
        </Label>
        {description ? <p className="mt-1 text-xs text-neutral-500">{description}</p> : null}
      </div>
      {children}
      {error ? <p className="text-xs text-rose-500">{error}</p> : null}
    </div>
  );
}
