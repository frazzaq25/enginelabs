import type { LabelHTMLAttributes, PropsWithChildren } from 'react';
import { clsx } from 'clsx';

export function Label({ className, children, ...props }: PropsWithChildren<LabelHTMLAttributes<HTMLLabelElement>>) {
  return (
    <label
      className={clsx('block text-sm font-medium text-neutral-700', className)}
      {...props}
    >
      {children}
    </label>
  );
}
