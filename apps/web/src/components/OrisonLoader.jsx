import React, { useId } from 'react';

const SIZES = { sm: 'h-5 w-5', md: 'h-14 w-14', lg: 'h-20 w-20' };

export function OrisonLoader({ size = 'md', label = 'Loading', className = '' }) {
  const id = useId().replace(/:/g, '');
  return (
    <div className={`relative inline-flex items-center justify-center ${SIZES[size] || SIZES.md} ${className}`} role="status" aria-label={label}>
      <span className="orison-loader-glow" />
      <svg viewBox="0 0 100 100" className="relative h-full w-full overflow-visible" aria-hidden="true">
        <defs>
          <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#818CF8" />
            <stop offset="100%" stopColor="#4F46E5" />
          </linearGradient>
        </defs>
        <circle className="orison-ring-outer" cx="50" cy="50" r="44" fill="none" stroke="#C7D2FE" strokeWidth="1.25" />
        <circle className="orison-ring-inner" cx="50" cy="50" r="34" fill="none" stroke={`url(#${id})`} strokeWidth="2.2" strokeLinecap="round" strokeDasharray="46 170" />
        <circle className="orison-loader-core" cx="50" cy="50" r="5.5" fill="#4F46E5" />
        <g className="orison-loader-orbit">
          <circle cx="50" cy="8" r="3" fill="#E01E26" />
        </g>
      </svg>
    </div>
  );
}

export function LoadingState({ label = 'Loading workspace', className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-4 py-16 ${className}`} role="status">
      <OrisonLoader size="lg" label={label} />
      <p className="text-[13px] font-semibold tracking-[-0.01em] text-slate-800">{label}</p>
    </div>
  );
}

export function SkeletonBlock({ className = '' }) {
  return <div className={`shimmer rounded-xl ${className}`} aria-hidden="true" />;
}
