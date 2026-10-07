import React, { useLayoutEffect, useRef, useState } from 'react';

export function useLiquidFrame(ref, value) {
  const [frame, setFrame] = useState({ x: 0, y: 0, w: 0, h: 0, ready: false });

  useLayoutEffect(() => {
    const root = ref.current;
    const active = root?.querySelector('[aria-selected="true"]');
    if (!root || !active) return undefined;
    const measure = () => {
      setFrame({
        x: active.offsetLeft,
        y: active.offsetTop,
        w: active.offsetWidth,
        h: active.offsetHeight,
        ready: true,
      });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    return () => observer.disconnect();
  }, [ref, value]);

  return frame;
}

export function LiquidUnderline({ tabs, value, onChange, color = '#4F46E5' }) {
  const ref = useRef(null);
  const frame = useLiquidFrame(ref, value);

  return (
    <div ref={ref} className="relative flex items-center gap-8" role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          role="tab"
          aria-selected={value === tab}
          onClick={() => onChange(tab)}
          className={`relative pb-3 text-[14px] ${value === tab ? 'text-[#1a1a1a] font-semibold' : 'text-[#9a9a9a] hover:text-[#555]'}`}
        >
          {tab}
        </button>
      ))}
      <span
        aria-hidden="true"
        className="liquid-tabline pointer-events-none absolute bottom-0 left-0 h-0.5 rounded-full"
        style={{
          width: frame.w,
          background: color,
          opacity: frame.ready ? 1 : 0,
          transform: `translateX(${frame.x}px)`,
        }}
      />
    </div>
  );
}

const PILL_TONE = {
  brand: 'bg-[#C4141B] shadow-md shadow-red-100',
  indigo: 'bg-indigo-600',
  paper: 'bg-white shadow-sm ring-1 ring-slate-100',
};

export function LiquidPills({ tabs, value, onChange, tone = 'indigo', className = '' }) {
  const ref = useRef(null);
  const frame = useLiquidFrame(ref, value);
  const activeText = tone === 'paper' ? 'text-[#C4141B]' : 'text-white';

  return (
    <div ref={ref} role="tablist" className={`relative flex gap-1 ${className}`}>
      <span
        aria-hidden="true"
        className={`liquid-pill pointer-events-none absolute left-0 top-0 rounded-xl ${PILL_TONE[tone] || PILL_TONE.indigo}`}
        style={{
          width: frame.w,
          height: frame.h,
          opacity: frame.ready ? 1 : 0,
          transform: `translate(${frame.x}px, ${frame.y}px)`,
        }}
      />
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const selected = value === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(tab.id)}
            className={`relative z-[1] flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2.5 text-[10px] font-semibold ${selected ? activeText : 'text-slate-500 hover:bg-slate-50'}`}
          >
            {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
