import type { HTMLAttributes } from 'react';
import { clsx } from 'clsx';

export function Page({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx('min-h-[60vh] rounded-2xl bg-surface p-10 shadow-card', className)} {...props} />
  );
}
