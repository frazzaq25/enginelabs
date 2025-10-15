import type { SVGProps } from 'react';

export function IconMenu(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeWidth={1.5} d="M3 5h14M3 10h14M3 15h10" />
    </svg>
  );
}
