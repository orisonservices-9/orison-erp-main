import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bell, Check, ChevronDown, LogOut, Menu, PanelLeftClose, PanelLeftOpen, School, Search, Settings } from 'lucide-react';
import { useAuth } from '../providers/AuthProvider';
import CommandPalette, { openCommandPalette } from './CommandPalette';
import { breadcrumbsFor } from './navigation';

const NOTICES = [
  { title: 'Attendance registers', detail: 'Open today’s attendance', path: '/attendance/add' },
  { title: 'Fee collections', detail: 'Receipts and outstanding dues', path: '/fee/collections' },
  { title: 'Leave requests', detail: 'Approvals waiting for review', path: '/leave/requests' },
];

const TopBar = ({ onOpenNav, onToggleSidebar, collapsed = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { auth, logout } = useAuth();
  const [panel, setPanel] = useState('');
  const barRef = useRef(null);
  const platform = auth?.role === 'platform_admin';
  const crumbs = useMemo(() => breadcrumbsFor(location.pathname, platform), [location.pathname, platform]);
  const initials = (auth?.name || 'Admin').split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
  const canOpen = (key) => !auth?.menu || auth.menu.includes(key);
  const school = platform ? 'Orison Platform' : 'Orison Main Campus';
  const place = platform ? 'All schools' : 'Hyderabad';

  useEffect(() => { setPanel(''); }, [location.pathname]);
  useEffect(() => {
    const close = (event) => {
      if (barRef.current && !barRef.current.contains(event.target)) setPanel('');
    };
    const onKey = (event) => { if (event.key === 'Escape') setPanel(''); };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const toggle = (name) => setPanel((current) => (current === name ? '' : name));

  return (
    <>
      <header ref={barRef} className="orison-header sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-3 px-3 lg:px-5">
        <div className="flex min-w-0 items-center gap-2">
          <button type="button" onClick={onOpenNav} aria-label="Open navigation" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-800 lg:hidden">
            <Menu className="h-4 w-4" />
          </button>
          <button type="button" onClick={onToggleSidebar} aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'} className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-800 lg:flex">
            {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>

          <div className="relative">
            <button type="button" onClick={() => toggle('tenant')} aria-expanded={panel === 'tenant'} className={`hidden h-10 items-center gap-2.5 rounded-xl border bg-white px-2.5 text-left sm:flex ${panel === 'tenant' ? 'border-[#4F46E5] ring-2 ring-indigo-100' : 'border-slate-200 hover:border-indigo-200'}`}>
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#4F46E5] text-white">
                <School className="h-3.5 w-3.5" />
              </span>
              <span className="min-w-0 pr-1">
                <span className="block max-w-[180px] truncate text-[13px] font-semibold leading-4 text-slate-950">{school}</span>
                <span className="block truncate text-[11px] font-medium leading-4 text-slate-600">{place}</span>
              </span>
              <ChevronDown className={`h-3.5 w-3.5 shrink-0 text-slate-500 ${panel === 'tenant' ? 'rotate-180' : ''}`} />
            </button>
            {panel === 'tenant' && (
              <div className="liquid-pop absolute left-0 top-12 w-64 rounded-xl border border-slate-200 bg-white p-1.5 shadow-[0_18px_40px_rgba(15,23,42,0.14)]">
                <p className="px-2.5 pb-1 pt-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">School</p>
                <div className="flex items-center gap-2 rounded-lg bg-indigo-50 px-2.5 py-2 text-[#3730A3]">
                  <Check className="h-4 w-4 shrink-0" />
                  <span className="min-w-0">
                    <span className="block truncate text-[13px] font-semibold">{school}</span>
                    <span className="block text-[12px] font-medium text-indigo-700">{place}</span>
                  </span>
                </div>
              </div>
            )}
          </div>

          <nav aria-label="Breadcrumb" className="hidden min-w-0 items-center gap-2 pl-1 text-[13px] xl:flex">
            {crumbs.map((crumb, index) => (
              <span key={`${crumb.label}-${index}`} className="flex min-w-0 items-center gap-2">
                {index > 0 ? <span className="text-slate-300">/</span> : null}
                {crumb.to && index < crumbs.length - 1 ? (
                  <Link to={crumb.to} className="truncate font-medium text-slate-600 hover:text-[#4F46E5]">{crumb.label}</Link>
                ) : (
                  <span className="truncate font-semibold text-slate-950">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button type="button" onClick={openCommandPalette} className="hidden h-10 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-[13px] font-medium text-slate-700 hover:border-indigo-200 hover:bg-white hover:text-slate-950 sm:flex">
            <Search className="h-3.5 w-3.5" />
            <span>Quick search</span>
            <kbd className="rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-bold text-slate-600">Ctrl K</kbd>
          </button>
          <button type="button" onClick={openCommandPalette} aria-label="Quick search" className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-800 sm:hidden">
            <Search className="h-4 w-4" />
          </button>
          {canOpen('notifications') && (
            <div className="relative">
              <button type="button" onClick={() => toggle('alerts')} aria-label="Open notifications" aria-expanded={panel === 'alerts'} className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-800 hover:border-indigo-200 hover:text-[#4F46E5]">
                <Bell className="h-4 w-4" />
                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#4F46E5]" />
              </button>
              {panel === 'alerts' && (
                <div className="liquid-pop absolute right-0 top-12 w-72 rounded-xl border border-slate-200 bg-white p-1.5 shadow-[0_18px_40px_rgba(15,23,42,0.14)]">
                  <p className="px-2.5 pb-1 pt-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">Notifications</p>
                  {NOTICES.map((item) => (
                    <button key={item.path} type="button" onClick={() => { setPanel(''); navigate(item.path); }} className="flex w-full flex-col rounded-lg px-2.5 py-2 text-left hover:bg-slate-50">
                      <span className="text-[13px] font-semibold text-slate-950">{item.title}</span>
                      <span className="text-[12px] font-medium text-slate-600">{item.detail}</span>
                    </button>
                  ))}
                  <button type="button" onClick={() => { setPanel(''); navigate('/notifications'); }} className="mt-1 flex h-9 w-full items-center justify-center rounded-lg text-[12px] font-semibold text-[#4F46E5] hover:bg-indigo-50">
                    View all
                  </button>
                </div>
              )}
            </div>
          )}
          <div className="relative">
            <button type="button" onClick={() => toggle('account')} aria-expanded={panel === 'account'} className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white py-1 pl-1 pr-2 hover:border-indigo-200">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#4F46E5] text-[11px] font-bold text-white">{initials}</span>
              <span className="hidden text-left md:block">
                <span className="block max-w-[128px] truncate text-[13px] font-semibold leading-4 text-slate-950">{auth?.name || 'Administrator'}</span>
                <span className="block text-[11px] font-medium capitalize leading-4 text-slate-600">{(auth?.role || 'admin').replaceAll('_', ' ')}</span>
              </span>
              <ChevronDown className={`hidden h-3.5 w-3.5 text-slate-500 md:block ${panel === 'account' ? 'rotate-180' : ''}`} />
            </button>
            {panel === 'account' && (
              <div className="liquid-pop absolute right-0 top-12 w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-[0_18px_40px_rgba(15,23,42,0.14)]">
                <p className="px-2.5 py-2 text-[12px] font-medium text-slate-600">Signed in as {auth?.name || 'Administrator'}</p>
                {canOpen('settings') && <button type="button" onClick={() => { setPanel(''); navigate('/settings'); }} className="flex h-9 w-full items-center gap-2 rounded-lg px-2.5 text-[13px] font-semibold text-slate-900 hover:bg-slate-50"><Settings className="h-4 w-4 text-slate-500" /> Settings</button>}
                <button type="button" onClick={() => { logout(); navigate('/'); }} className="flex h-9 w-full items-center gap-2 rounded-lg px-2.5 text-[13px] font-semibold text-[#4F46E5] hover:bg-indigo-50"><LogOut className="h-4 w-4" /> Sign out</button>
              </div>
            )}
          </div>
        </div>
      </header>
      <CommandPalette />
    </>
  );
};

export default TopBar;
