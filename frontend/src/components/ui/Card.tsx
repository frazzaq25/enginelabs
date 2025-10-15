import type { PropsWithChildren, ReactNode } from 'react';
import { clsx } from 'clsx';

interface CardProps extends PropsWithChildren {
  title?: ReactNode;
  description?: ReactNode;
  className?: string;
  headerAction?: ReactNode;
}

export function Card({ title, description, headerAction, className, children }: CardProps) {
  return (
    <section className={clsx('rounded-2xl bg-surface p-6 shadow-card ring-1 ring-neutral-100', className)}>
      {(title || description || headerAction) && (
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            {title ? <h2 className="text-lg font-semibold text-neutral-900">{title}</h2> : null}
            {description ? <p className="text-sm text-neutral-500">{description}</p> : null}
          </div>
          {headerAction}
        </header>
      )}
      <div className="space-y-4">{children}</div>
    </section>
  );
}
