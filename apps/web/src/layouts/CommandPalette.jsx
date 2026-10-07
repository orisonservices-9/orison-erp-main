import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Search } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../providers/AuthProvider';
import { commandItems } from './navigation';

export function openCommandPalette() {
  window.dispatchEvent(new CustomEvent('orison:command'));
}

const CommandPalette = () => {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState(0);
  const [records, setRecords] = useState([]);
  const commands = useMemo(() => commandItems(auth), [auth]);

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const pages = commands.filter((item) => !needle || `${item.title} ${item.group} ${item.keywords || ''}`.toLowerCase().includes(needle));
    const people = records.map((item) => ({ ...item, id: `record-${item.path}-${item.title}`, keywords: item.title }));
    return [...pages, ...people].slice(0, 14);
  }, [commands, query, records]);

  const groups = useMemo(() => {
    const order = [];
    const map = new Map();
    results.forEach((item, itemIndex) => {
      if (!map.has(item.group)) {
        map.set(item.group, []);
        order.push(item.group);
      }
      map.get(item.group).push({ ...item, itemIndex });
    });
    return order.map((label) => ({ label, items: map.get(label) }));
  }, [results]);

  useEffect(() => { setIndex(0); }, [query, open]);

  const close = () => setOpen(false);

  useEffect(() => {
    const onKey = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener('keydown', onKey);
    window.addEventListener('orison:command', onOpen);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('orison:command', onOpen);
    };
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
    };
    window.addEventListener('keydown', onKey, true);
    const timer = window.setTimeout(() => inputRef.current?.focus(), 20);
    return () => {
      window.removeEventListener('keydown', onKey, true);
      window.clearTimeout(timer);
    };
  }, [open]);

  useEffect(() => {
    const node = listRef.current?.querySelector('[data-command-active="true"]');
    node?.scrollIntoView({ block: 'nearest' });
  }, [index, open]);

  useEffect(() => {
    const needle = query.trim();
    if (!open || needle.length < 2 || auth?.role === 'platform_admin') { setRecords([]); return undefined; }
    let active = true;
    api.get('/search', { params: { q: needle } }).then(({ data }) => {
      if (!active) return;
      const students = (data.students || []).slice(0, 4).map((student) => ({
        title: student.name,
        group: 'Students',
        detail: student.class_name || student.admission_no || 'Student record',
        path: `/students/profile?id=${student.id}`,
      }));
      const teachers = (data.teachers || []).slice(0, 3).map((teacher) => ({
        title: teacher.name,
        group: 'Teachers',
        detail: teacher.subject || 'Teacher',
        path: '/teachers/view',
      }));
      setRecords([...students, ...teachers]);
    }).catch(() => { if (active) setRecords([]); });
    return () => { active = false; };
  }, [query, open, auth]);

  const choose = (item) => {
    if (!item) return;
    setOpen(false);
    navigate(item.path);
  };

  const onKeyDown = (event) => {
    if (event.key === 'ArrowDown') { event.preventDefault(); setIndex((value) => (value + 1) % (results.length || 1)); }
    else if (event.key === 'ArrowUp') { event.preventDefault(); setIndex((value) => (value - 1 + (results.length || 1)) % (results.length || 1)); }
    else if (event.key === 'Enter') { event.preventDefault(); choose(results[index]); }
    else if (event.key === 'Escape') close();
  };

  if (!open) return null;

  return (
    <div className="command-layer is-open fixed inset-0 z-[80] flex items-start justify-center px-4 pt-[10vh]">
      <div className="command-backdrop absolute inset-0 bg-[#0f172a]/50" onMouseDown={close} />
      <div className="command-surface relative z-10 flex max-h-[min(560px,72vh)] w-full max-w-[40rem] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_64px_rgba(15,23,42,0.22)]" onMouseDown={(event) => event.stopPropagation()}>
        <div className="flex h-12 shrink-0 items-center gap-3 border-b border-slate-200 px-4">
          <Search className="h-4 w-4 shrink-0 text-slate-500" />
          <input ref={inputRef} value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={onKeyDown} placeholder="Search modules, students, actions" className="command-input h-full min-w-0 flex-1 border-0 bg-transparent text-[14px] font-medium text-slate-950 shadow-none outline-none ring-0 placeholder:text-slate-500 focus:border-0 focus:shadow-none focus:outline-none focus:ring-0" />
          <kbd className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">Esc</kbd>
        </div>
        <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto p-2">
          {results.length === 0 ? (
            <p className="px-3 py-12 text-center text-[13px] font-medium text-slate-600">No matching modules or records.</p>
          ) : groups.map((group) => (
            <div key={group.label} className="mb-1">
              <p className="px-3 pb-1 pt-2 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">{group.label}</p>
              {group.items.map((item) => {
                const selected = item.itemIndex === index;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    data-command-active={selected ? 'true' : undefined}
                    onMouseEnter={() => setIndex(item.itemIndex)}
                    onClick={() => choose(item)}
                    className={`flex h-12 w-full items-center gap-3 rounded-xl px-3 text-left ${selected ? 'bg-indigo-50 text-[#3730A3]' : 'text-slate-900 hover:bg-slate-50'}`}
                  >
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${selected ? 'bg-[#4F46E5] text-white' : 'bg-slate-100 text-slate-700'}`}>
                      {Icon ? <Icon className="h-4 w-4" /> : <span className="text-[12px] font-bold">{item.title.slice(0, 1)}</span>}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13.5px] font-semibold leading-5">{item.title}</span>
                      <span className={`block truncate text-[12px] font-medium leading-4 ${selected ? 'text-indigo-700' : 'text-slate-600'}`}>{item.detail || item.group}</span>
                    </span>
                    <ArrowRight className={`h-4 w-4 shrink-0 transition-transform ${selected ? 'translate-x-0.5 text-[#4F46E5]' : 'text-slate-400'}`} />
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        <div className="flex h-10 shrink-0 items-center justify-between border-t border-slate-100 bg-slate-50 px-4 text-[11px] font-semibold text-slate-600">
          <span>↑↓ to move</span>
          <span>Enter to open</span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
