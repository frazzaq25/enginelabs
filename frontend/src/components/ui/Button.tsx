import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { clsx } from 'clsx';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-brand text-brand-foreground shadow-sm hover:bg-brand-dark focus-visible:outline-brand-dark',
  secondary: 'bg-brand/10 text-brand-dark hover:bg-brand/20 focus-visible:outline-brand',
  outline:
    'border border-neutral-200 bg-surface text-neutral-700 hover:bg-neutral-50 focus-visible:outline-brand',
  ghost: 'text-neutral-600 hover:bg-neutral-100 focus-visible:outline-brand'
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 rounded-md px-3 text-sm',
  md: 'h-10 rounded-lg px-4 text-sm font-medium',
  lg: 'h-12 rounded-lg px-6 text-base font-semibold',
  icon: 'h-9 w-9 rounded-md p-0'
};

export function Button({
  variant = 'primary',
  size = 'md',
  asChild,
  className,
  children,
  type,
  ...props
}: PropsWithChildren<ButtonProps>) {
  const combinedClassName = clsx(
    'inline-flex items-center justify-center gap-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
    variantStyles[variant],
    sizeStyles[size],
    className
  );

  if (asChild) {
    return (
      <Slot className={combinedClassName} {...props}>
        {children}
      </Slot>
    );
  }

  return (
    <button className={combinedClassName} type={type ?? 'button'} {...props}>
      {children}
    </button>
  );
}
