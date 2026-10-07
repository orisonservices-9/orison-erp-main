import React from 'react';
import { Loader2, Search } from 'lucide-react';

const badgeColors = {
  green: 'border-emerald-100 bg-emerald-50 text-emerald-700',
  red: 'border-indigo-100 bg-indigo-50 text-[#4338CA]',
  blue: 'border-blue-100 bg-blue-50 text-blue-700',
  amber: 'border-amber-100 bg-amber-50 text-amber-700',
  gray: 'border-slate-200 bg-slate-50 text-slate-600',
  purple: 'border-purple-100 bg-purple-50 text-purple-700',
};

export const Badge = ({ children, color = 'gray', className = '' }) => (
  <span className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-semibold leading-4 ${badgeColors[color]} ${className}`}>
    {children}
  </span>
);

export const Btn = ({ children, icon: Icon, variant = 'primary', onClick, className = '', type = 'button', disabled = false, loading = false, loadingLabel }) => {
  const styles = {
    primary: 'orison-btn-primary',
    outline: 'border border-slate-200 bg-white text-slate-700 shadow-sm hover:border-indigo-200 hover:bg-indigo-50 hover:text-[#4338CA]',
    dark: 'bg-slate-900 hover:bg-slate-800 text-white shadow-[0_8px_16px_rgba(15,23,42,0.16)]',
    ghost: 'text-[#4F46E5] hover:bg-indigo-50',
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled || loading} aria-busy={loading || undefined} className={`orison-btn inline-flex items-center justify-center gap-2 h-10 px-4 text-[13px] font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : Icon && <Icon className="w-4 h-4" />}
      {loading && loadingLabel ? loadingLabel : children}
    </button>
  );
};

export const PageTitle = ({ title, meta, subtitle, actions }) => (
  <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
    <div className="min-w-0">
      <h2 className="truncate font-poppins text-[22px] font-semibold tracking-[-0.03em] text-slate-950">{title}</h2>
      {(meta || subtitle) ? <p className="mt-1 max-w-3xl text-[13px] font-medium leading-5 text-slate-600">{meta || subtitle}</p> : null}
    </div>
    {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
  </div>
);

export const Card = ({ title, subtitle, action, children, className = '', pad = 'p-5', interactive = false }) => {
  const flush = pad === 'p-0';
  return (
    <div className={`orison-surface overflow-hidden ${interactive ? 'is-interactive' : ''} ${flush ? '' : pad} ${className}`}>
      {(title || action) && (
        <div className={`flex items-start justify-between gap-4 ${flush ? 'border-b border-slate-100 px-5 pb-4 pt-5' : 'mb-4'}`}>
          <div className="min-w-0 pr-1">
            {title && <h3 className="font-poppins text-[16px] font-semibold tracking-[-0.02em] text-slate-900">{title}</h3>}
            {subtitle ? <p className="mt-1 text-[13px] font-medium leading-5 text-slate-600">{subtitle}</p> : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      )}
      {children}
    </div>
  );
};

export const StatCards = ({ items }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
    {items.map((s) => {
      const Icon = s.icon;
      return (
        <div key={s.label} className="orison-surface p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.tint || 'bg-indigo-50 text-[#4F46E5]'}`}>
              <Icon className="h-4 w-4" />
            </span>
            {s.delta && <span className="text-[12px] font-semibold text-emerald-600">{s.delta}</span>}
          </div>
          <p className="mt-4 font-poppins text-[24px] font-semibold tracking-[-0.03em] text-slate-900">{s.value}</p>
          <p className="mt-1 text-[13px] font-medium text-slate-600">{s.label}</p>
        </div>
      );
    })}
  </div>
);

export const SearchBar = ({ placeholder = 'Search...', className = '', value, onChange }) => (
  <div className={`relative ${className}`}>
    <Search className="w-4 h-4 text-[#b0b0b0] absolute left-3 top-1/2 -translate-y-1/2" />
    <input value={value} onChange={onChange} placeholder={placeholder} className="orison-field h-10 w-full border border-slate-200 bg-white pl-9 pr-3 text-[13px] text-slate-800 shadow-sm placeholder:text-slate-400 focus:border-[#4F46E5] focus:outline-none" />
  </div>
);

export const Field = ({ label, placeholder, value, select, type = 'text', options = [], onChange, name }) => (
  <div>
    {label && <label className="mb-1.5 block text-[13px] font-medium text-slate-700">{label}</label>}
    <div className="relative">
      {select ? (
        <select value={onChange ? value : undefined} defaultValue={onChange ? undefined : value} name={name} onChange={onChange} className="orison-field h-11 w-full border border-slate-200 bg-white px-3 text-[13px] text-slate-800 shadow-sm focus:border-[#4F46E5] focus:outline-none">
          {value && <option>{value}</option>}
          {options.map((o) => <option key={o}>{o}</option>)}
        </select>
      ) : (
        <input type={type} placeholder={placeholder} value={onChange ? (value || '') : undefined} defaultValue={onChange ? undefined : value} name={name} onChange={onChange} className="orison-field h-11 w-full border border-slate-200 bg-white px-3 text-[13px] text-slate-800 shadow-sm placeholder:text-slate-400 focus:border-[#4F46E5] focus:outline-none" />
      )}
    </div>
  </div>
);

export const Table = ({ columns, children }) => (
  <table className="w-full text-left">
    <thead>
      <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-600">
        {columns.map((c, i) => (
          <th key={i} className={`px-4 py-3 ${c.align === 'right' ? 'text-right' : c.align === 'center' ? 'text-center' : 'text-left'}`}>{c.label}</th>
        ))}
      </tr>
    </thead>
    <tbody>{children}</tbody>
  </table>
);

export const Avatar = ({ src, alt, size = 9 }) => (
  <img src={src} alt={alt} className={`w-${size} h-${size} rounded-full object-cover`} />
);

export const ProgressBar = ({ value, color = 'bg-gradient-to-r from-[#4F46E5] via-[#6366F1] to-[#8B5CF6]' }) => (
  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
    <div className={`liquid-progress h-full w-full rounded-full ${color}`} style={{ transform: `scaleX(${Math.max(0, Math.min(100, Number(value) || 0)) / 100})` }} />
  </div>
);

export const Toolbar = ({ children }) => (
  <div className="orison-surface mb-5 flex flex-wrap items-center gap-3 p-3">{children}</div>
);
