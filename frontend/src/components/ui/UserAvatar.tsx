import type { HTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  initials: string;
  name: string;
}

export function Avatar({ initials, name, className, ...props }: AvatarProps) {
  return (
    <div
      aria-label={name}
      className={clsx(
        'inline-flex h-9 w-9 items-center justify-center rounded-full bg-neutral-200 text-sm font-semibold text-neutral-700 ring-1 ring-inset ring-white/60',
        className
      )}
      role="img"
      {...props}
    >
      {initials}
    </div>
  );
}
