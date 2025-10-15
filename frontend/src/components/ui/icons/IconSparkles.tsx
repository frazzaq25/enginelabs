import type { SVGProps } from 'react';

export function IconSparkles(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M12 3 10.5 7.5 6 9l4.5 1.5L12 15l1.5-4.5L18 9l-4.5-1.5L12 3ZM5 18.5 4.25 21 3 21.75 5.5 21 6.25 18.5 7.5 17.75 5 18.5ZM19 16l-.75 2.5L16 19.25 18.5 18.5 19.25 16 20.5 15.25 19 16Z"
      />
    </svg>
  );
}
