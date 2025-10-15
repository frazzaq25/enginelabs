import type { PropsWithChildren, ReactNode } from 'react';
import { clsx } from 'clsx';

interface PageHeaderProps extends PropsWithChildren {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({ title, description, actions, children, className }: PageHeaderProps) {
  return (
    <div className={clsx('flex flex-col gap-6 rounded-2xl border border-neutral-200 bg-surface p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between', className)}>
      <div className="space-y-2">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-brand">Foundation</p>
          <h1 className="text-2xl font-semibold text-neutral-900">{title}</h1>
        </div>
        {description ? <p className="text-sm text-neutral-600">{description}</p> : null}
        {children ? <div className="pt-2 text-xs text-neutral-500">{children}</div> : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-3">{actions}</div> : null}
    </div>
  );
}
