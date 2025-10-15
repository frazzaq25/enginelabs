import type { SVGProps } from 'react';

export function IconDashboard(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M3 13.5V18a3 3 0 0 0 3 3h4.5v-7.5H3Zm7.5 0H21V9a3 3 0 0 0-3-3h-4.5v7.5Zm0 0V6H6a3 3 0 0 0-3 3v4.5h7.5Z"
      />
    </svg>
  );
}
