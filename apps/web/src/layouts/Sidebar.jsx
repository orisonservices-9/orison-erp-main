import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, LogOut } from 'lucide-react';
import OrisonLogo from '../components/OrisonLogo';
import { useAuth } from '../providers/AuthProvider';
import { activeChild, matchesPath, navigationFor } from './navigation';

const Sidebar = ({ open = false, collapsed = false, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;
  const { auth, logout } = useAuth();
  const asideRef = useRef(null);
  const navRef = useRef(null);
  const closeTimer = useRef(null);
  const [desktop, setDesktop] = useState(() => window.matchMedia('(min-width: 1024px)').matches);
  const [collapsedSections, setCollapsedSections] = useState(() => new Set());
  const [flyoutKey, setFlyoutKey] = useState('');
  const [flyoutTop, setFlyoutTop] = useState(0);
  const [indicator, setIndicator] = useState({ y: 0, h: 18, visible: false });

  const isPlatform = auth?.role === 'platform_admin';
  const items = navigationFor(auth);
  const rail = collapsed && desktop;
  const collapsedKey = [...collapsedSections].join('|');
  const isExpanded = (key) => !collapsedSections.has(key);
  const flyout = items.find((item) => item.key === flyoutKey);
  const initials = (auth?.name || 'Admin').split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();

  useEffect(() => {
    const media = window.matchMedia('(min-width: 1024px)');
    const sync = () => setDesktop(media.matches);
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  useLayoutEffect(() => {
    const nav = navRef.current;
    if (!nav || rail) {
      setIndicator((current) => ({ ...current, visible: false }));
      return undefined;
    }
    let frame = 0;
    const measure = () => {
      const active = nav.querySelector('[data-nav-current="true"]');
      if (!active) {
        setIndicator((current) => ({ ...current, visible: false }));
        return;
      }
      const top = active.getBoundingClientRect().top - nav.getBoundingClientRect().top + nav.scrollTop;
      const next = { y: top + 8, h: Math.max(16, active.offsetHeight - 16), visible: true };
      setIndicator((current) => (
        current.visible === next.visible && current.h === next.h && Math.abs(current.y - next.y) < 0.5 ? current : next
      ));
    };
    const started = performance.now();
    const tick = (now) => {
      measure();
      if (now - started < 360) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    nav.addEventListener('scroll', measure, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      nav.removeEventListener('scroll', measure);
    };
  }, [path, collapsedKey, rail]);

  const go = (next) => {
    setFlyoutKey('');
    onClose?.();
    if (next !== path) navigate(next);
  };

  const toggleSection = (key) => {
    setCollapsedSections((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const showFlyout = (item, node) => {
    if (!rail || !item.children) return;
    window.clearTimeout(closeTimer.current);
    const rect = node.getBoundingClientRect();
    setFlyoutKey(item.key);
    setFlyoutTop(Math.max(12, Math.min(rect.top, window.innerHeight - 280)));
  };

  const hideFlyout = () => {
    closeTimer.current = window.setTimeout(() => setFlyoutKey(''), 140);
  };

  return (
    <>
      {open && <div className="liquid-backdrop fixed inset-0 z-40 bg-[#10151c]/50 lg:hidden" onClick={onClose} />}
      <aside
        ref={asideRef}
        className={`orison-sidebar liquid-drawer ${open ? 'is-open' : ''} ${rail ? 'is-collapsed' : ''} fixed inset-y-0 left-0 z-50 flex h-full shrink-0 flex-col overflow-hidden bg-gradient-to-b from-[#081126] via-[#111B3E] to-[#241A57] shadow-[14px_0_40px_rgba(15,23,42,0.16)] lg:static`}
      >
        <div className={`shrink-0 ${rail ? 'px-3 pb-3 pt-4' : 'px-4 pb-3 pt-5'}`}>
          <div className={`flex items-center ${rail ? 'justify-center' : 'px-1'}`}>
            {rail ? <span className="orison-logo text-[22px]">o</span> : <OrisonLogo size="sm" align="start" />}
          </div>
          <div className="sidebar-meta mt-4 overflow-hidden rounded-xl border border-white/12 bg-white/[0.07] px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]">
            <p className="sidebar-copy truncate text-[13px] font-semibold leading-4 text-white">{isPlatform ? 'Orison Platform' : 'Orison Main Campus'}</p>
            <p className="sidebar-copy mt-0.5 truncate text-[12px] font-medium leading-4 text-indigo-100">{isPlatform ? 'All schools' : 'Hyderabad'}</p>
          </div>
        </div>

        <nav ref={navRef} className="sidebar-scroll relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-2.5 pb-4" aria-label="Primary">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-1 top-0 z-[1] w-[3px] rounded-full bg-[#A5B4FC] shadow-[0_0_12px_rgba(129,140,248,0.85)]"
            style={{
              height: indicator.h,
              opacity: indicator.visible ? 1 : 0,
              transform: `translateY(${indicator.y}px)`,
              transition: 'transform var(--motion-standard) var(--ease-liquid), height var(--motion-standard) var(--ease-liquid), opacity var(--motion-fast) var(--ease-soft)',
            }}
          />
          <div className="space-y-3 pt-1">
            {items.map((item) => {
              const Icon = item.icon;
              const child = activeChild(item, path);
              const sectionActive = Boolean(child) || (item.path && matchesPath(item.path, path));
              const expanded = Boolean(item.children) && isExpanded(item.key);

              if (!item.children) {
                const active = item.path && matchesPath(item.path, path);
                return (
                  <button
                    key={item.key}
                    type="button"
                    title={item.label}
                    data-nav-current={active ? 'true' : undefined}
                    onClick={() => go(item.path)}
                    className={`relative flex h-10 w-full items-center rounded-lg text-left text-[13.5px] leading-5 ${rail ? 'justify-center gap-0 px-0' : 'gap-3 px-3'} ${active ? 'bg-white/10 font-semibold text-white' : 'font-medium text-white hover:bg-white/[0.06]'}`}
                  >
                    <Icon className="h-4 w-4 shrink-0 text-indigo-100" />
                    <span className="sidebar-copy truncate">{item.label}</span>
                  </button>
                );
              }

              return (
                <div key={item.key} onMouseEnter={(event) => showFlyout(item, event.currentTarget)} onMouseLeave={hideFlyout}>
                  <button
                    type="button"
                    title={item.label}
                    aria-expanded={expanded}
                    onClick={(event) => {
                      if (rail) {
                        showFlyout(item, event.currentTarget);
                        return;
                      }
                      toggleSection(item.key);
                    }}
                    className={`flex h-8 w-full items-center rounded-md text-left ${rail ? 'justify-center gap-0 px-0' : 'gap-2 px-2.5'}`}
                  >
                    {rail && <Icon className="h-4 w-4 shrink-0 text-indigo-100" />}
                    <span className={`sidebar-copy min-w-0 flex-1 truncate text-left text-[11px] font-bold uppercase tracking-[0.11em] ${sectionActive ? 'text-white' : 'text-indigo-100'}`}>
                      {item.label}
                    </span>
                    <ChevronDown className={`sidebar-copy h-3.5 w-3.5 shrink-0 text-indigo-100 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
                  </button>
                  <div className={`liquid-submenu ${expanded ? 'is-open' : ''}`}>
                    <div>
                      <div className="ml-3 space-y-0.5 border-l border-white/15 py-1 pl-1.5">
                        {item.children.map((entry) => {
                          const ChildIcon = entry.icon;
                          const active = child?.path === entry.path;
                          return (
                            <button
                              key={entry.path}
                              type="button"
                              title={entry.label}
                              onClick={() => go(entry.path)}
                              data-nav-current={active && expanded ? 'true' : undefined}
                              className={`relative flex h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-left text-[13.5px] leading-5 ${active ? 'bg-white/[0.08] font-semibold text-white' : 'font-medium text-white hover:bg-white/[0.05]'}`}
                            >
                              <ChildIcon className={`h-3.5 w-3.5 shrink-0 ${active ? 'text-white' : 'text-indigo-200'}`} />
                              <span className="truncate">{entry.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </nav>

        <div className="shrink-0 border-t border-white/10 px-3 py-3">
          <div className={`sidebar-copy mb-2 flex items-center gap-2.5 px-1 ${rail ? 'hidden' : ''}`}>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#4F46E5] text-[11px] font-bold text-white">{initials}</span>
            <span className="min-w-0">
              <span className="block truncate text-[13px] font-semibold leading-4 text-white">{auth?.name || 'Administrator'}</span>
              <span className="block truncate text-[12px] font-medium capitalize leading-4 text-indigo-100">{(auth?.role || 'admin').replaceAll('_', ' ')}</span>
            </span>
          </div>
          <button type="button" onClick={() => { logout(); navigate('/'); }} className={`flex h-10 w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.06] text-[13px] font-semibold text-white hover:bg-white/[0.12] ${rail ? 'justify-center px-0' : 'px-3'}`}>
            <LogOut className="h-4 w-4 shrink-0 text-indigo-100" />
            <span className="sidebar-copy">Sign out</span>
          </button>
        </div>
      </aside>

      {rail && flyout?.children && (
        <div
          className="sidebar-flyout liquid-pop rounded-xl border border-white/10 bg-[#111B3E] p-2 shadow-[14px_18px_40px_rgba(15,23,42,0.28)]"
          style={{ top: flyoutTop, left: (asideRef.current?.getBoundingClientRect().right || 84) + 8 }}
          onMouseEnter={() => window.clearTimeout(closeTimer.current)}
          onMouseLeave={hideFlyout}
        >
          <p className="px-3 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-indigo-100">{flyout.label}</p>
          {flyout.children.map((child) => {
            const active = activeChild(flyout, path)?.path === child.path;
            return (
              <button
                key={child.path}
                type="button"
                onClick={() => go(child.path)}
                className={`flex h-9 w-full items-center rounded-lg px-3 text-left text-[13px] ${active ? 'bg-white/10 font-semibold text-white' : 'font-medium text-white hover:bg-white/[0.06]'}`}
              >
                {child.label}
              </button>
            );
          })}
        </div>
      )}
    </>
  );
};

export default Sidebar;
