import type { SVGProps } from 'react';

export function IconSettings(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M12 15.75a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5ZM4.5 12a7.5 7.5 0 0 1 .09-1.179l-1.8-1.382 1.5-2.598 2.136.578A7.51 7.51 0 0 1 8.7 5.1l.09-2.34h3.42l.09 2.34a7.51 7.51 0 0 1 2.274 1.342l2.136-.578 1.5 2.598-1.8 1.382c.06.385.09.776.09 1.179s-.03.794-.09 1.179l1.8 1.382-1.5 2.598-2.136-.578A7.51 7.51 0 0 1 12.3 18.9l-.09 2.34H8.79l-.09-2.34a7.51 7.51 0 0 1-2.274-1.342l-2.136.578-1.5-2.598 1.8-1.382A7.5 7.5 0 0 1 4.5 12Z"
      />
    </svg>
  );
}
