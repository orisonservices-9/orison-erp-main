import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { Users, Wallet, CalendarCheck, GraduationCap, ArrowUpRight, TrendingUp, AlertTriangle, Receipt, Award, Percent, RefreshCw, Sparkles, Bell, ClipboardCheck, BookOpenCheck, ChevronRight, CheckCircle2, CircleDollarSign, School, UserCheck, CalendarDays, Clock3 } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const fmtL = (n) => `₹${(n / 100000).toFixed(1)}L`;
const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const PIE = ['#4F46E5', '#f59e0b', '#3b82f6'];

const useAnalytics = (url) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const load = useCallback(() => {
    setLoading(true); setError(false);
    api.get(url)
      .then(({ data }) => { setData(data); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, [url]);
  useEffect(() => { load(); }, [load]);
  return { data, loading, error, reload: load };
};

const StatSkeleton = () => (
  <div className="bg-white/90 rounded-2xl border border-white ring-1 ring-slate-100 shadow-[0_12px_32px_rgba(15,23,42,0.055)] p-5 animate-pulse">
    <div className="w-11 h-11 rounded-xl bg-gray-100" />
    <div className="h-7 w-24 bg-gray-100 rounded mt-4" />
    <div className="h-3 w-20 bg-gray-100 rounded mt-2.5" />
  </div>
);

const StatGrid = ({ items, loading }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
    {loading
      ? [0, 1, 2, 3].map((i) => <StatSkeleton key={i} />)
      : items.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} data-testid={`stat-${s.label.toLowerCase().replace(/\s+/g, '-')}`} className="group relative overflow-hidden bg-white/90 rounded-2xl border border-white ring-1 ring-slate-100 shadow-[0_12px_32px_rgba(15,23,42,0.055)] p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_18px_38px_rgba(15,23,42,0.09)]">
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-indigo-50 to-transparent" />
              <div className="flex items-center justify-between">
                <span className={`relative w-11 h-11 rounded-xl flex items-center justify-center shadow-sm ${s.tint}`}><Icon className="w-5 h-5" /></span>
                {s.delta && <span className="flex items-center gap-1 text-[12px] font-semibold text-green-600"><TrendingUp className="w-3.5 h-3.5" /> {s.delta}</span>}
              </div>
              <p className="text-[26px] font-poppins font-bold tracking-[-0.04em] text-slate-900 mt-4">{s.value}</p>
              <p className="text-[11px] font-medium text-slate-500">{s.label}</p>
            </div>
          );
        })}
  </div>
);

const ErrorState = ({ onRetry }) => (
  <div data-testid="dashboard-error" className="bg-white/90 rounded-2xl border border-indigo-100 shadow-[0_12px_32px_rgba(15,23,42,0.055)] p-12 text-center">
    <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-4"><AlertTriangle className="w-7 h-7 text-[#4F46E5]" /></div>
    <p className="text-[15px] font-semibold text-[#1a1a1a]">Couldn't load dashboard data</p>
    <p className="text-[13px] text-[#8a8a8a] mt-1">Please check your connection and try again.</p>
    <button onClick={onRetry} data-testid="dashboard-retry-btn" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#4F46E5] via-[#6366F1] to-[#8B5CF6] px-5 py-2.5 text-[12px] font-bold text-white shadow-[0_9px_18px_rgba(79,70,229,0.24)] transition hover:-translate-y-0.5">
      <RefreshCw className="w-4 h-4" /> Retry
    </button>
  </div>
);

const ChartCard = ({ title, loading, empty, emptyText, children }) => (
  <div className="relative overflow-hidden bg-white/90 rounded-2xl border border-white ring-1 ring-slate-100 shadow-[0_12px_32px_rgba(15,23,42,0.055)] p-6 transition-all hover:shadow-[0_18px_38px_rgba(15,23,42,0.075)]">
    <div className="mb-4 flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#635BFF]" /><h3 className="font-poppins text-[16px] font-bold tracking-[-0.02em] text-slate-900">{title}</h3></div>
    {loading ? (
      <div className="h-[220px] rounded-xl bg-gray-50 animate-pulse" />
    ) : empty ? (
      <div className="h-[220px] flex items-center justify-center text-[13px] text-[#999]">{emptyText || 'No data yet.'}</div>
    ) : children}
  </div>
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { data, loading, error, reload } = useAnalytics('/analytics/dashboard');
  const quick = [
    { label: 'Add student', hint: 'Single or bulk admission', path: '/students/add', icon: Users },
    { label: 'Mark attendance', hint: 'Students, teachers & staff', path: '/attendance/add', icon: CalendarCheck },
    { label: 'Collect fee', hint: 'Search and issue receipt', path: '/fee/collect', icon: CircleDollarSign },
    { label: 'Create exam', hint: 'Schedule an assessment', path: '/exams/create', icon: CalendarDays },
  ];
  const priorityTone = {
    critical: 'border-rose-200 bg-rose-50 text-rose-700',
    high: 'border-orange-200 bg-orange-50 text-orange-700',
    medium: 'border-amber-200 bg-amber-50 text-amber-700',
    low: 'border-blue-200 bg-blue-50 text-blue-700',
    clear: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  };
  const hasAttendanceTrend = data?.attendance_trend?.some((item) => item.rate != null);
  const collection = data?.stats || {};
  const collectionProgress = Math.max(0, Math.min(100, Number(collection.collection_efficiency || 0)));
  const formattedDate = new Intl.DateTimeFormat('en-IN', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
  if (error) return <ErrorState onRetry={reload} />;
  return (
    <div className="space-y-5 pb-8">
      <section className="relative overflow-hidden rounded-[28px] bg-[linear-gradient(118deg,#111827_0%,#272B67_54%,#5B4FE9_100%)] px-6 py-7 text-white shadow-[0_24px_60px_rgba(49,46,129,0.22)] sm:px-8">
        <div className="absolute -right-16 -top-28 h-72 w-72 rounded-full border border-white/10 bg-white/5" />
        <div className="absolute -bottom-28 right-52 h-56 w-56 rounded-full bg-violet-400/10 blur-2xl" />
        <div className="relative flex flex-col justify-between gap-7 xl:flex-row xl:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-100">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1.5 text-emerald-200"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" /> Live school pulse</span>
              <span>{data?.academic_year || 'Academic year not configured'}</span>
            </div>
            <div className="mt-4 flex items-center gap-3"><Sparkles className="h-6 w-6 text-violet-300" /><h1 className="font-poppins text-[28px] font-bold tracking-[-0.045em] sm:text-[34px]">School Command Center</h1></div>
            <p className="mt-2 max-w-2xl text-[12px] leading-6 text-indigo-100/75">A decision-first view of attendance, academics, collections and operations—updated from your live school records.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 backdrop-blur"><p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-indigo-200">Today</p><p className="mt-1 text-[12px] font-semibold">{formattedDate}</p></div>
            <button onClick={() => navigate('/management/action-center')} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3.5 text-[11px] font-bold text-slate-900 shadow-lg transition hover:-translate-y-0.5"><ClipboardCheck className="h-4 w-4 text-[#5B4FE9]" /> Open operations center <ArrowUpRight className="h-4 w-4" /></button>
          </div>
        </div>
      </section>

      {loading ? <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{[0, 1, 2, 3].map((i) => <StatSkeleton key={i} />)}</div> : (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Enrolled students', value: Number(collection.students || 0).toLocaleString('en-IN'), note: `${collection.classes || 0} classes · ${collection.sections || 0} sections`, icon: Users, tone: 'from-indigo-500 to-violet-500', path: '/students/view' },
            { label: 'Attendance today', value: collection.attendance == null ? 'Not marked' : `${collection.attendance}%`, note: collection.attendance_marked ? `${collection.present_today} present · ${collection.absent_today} absent` : `${collection.attendance_unmarked || 0} students awaiting status`, icon: UserCheck, tone: 'from-cyan-500 to-blue-500', path: '/attendance/view' },
            { label: 'Collection efficiency', value: `${collection.collection_efficiency || 0}%`, note: `${fmt(collection.fees_collected)} collected`, icon: Wallet, tone: 'from-emerald-500 to-teal-500', path: '/fee/collections' },
            { label: 'Teaching team', value: Number(collection.teachers || 0).toLocaleString('en-IN'), note: `${collection.staff || 0} non-teaching staff`, icon: GraduationCap, tone: 'from-amber-500 to-orange-500', path: '/teachers/view' },
          ].map((item) => <button key={item.label} onClick={() => navigate(item.path)} className="group rounded-[22px] border border-slate-200/70 bg-white p-5 text-left shadow-[0_12px_35px_rgba(15,23,42,0.055)] transition hover:-translate-y-1 hover:border-indigo-200 hover:shadow-[0_18px_45px_rgba(79,70,229,0.11)]"><div className="flex items-start justify-between"><span className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${item.tone} text-white shadow-lg`}><item.icon className="h-5 w-5" /></span><ArrowUpRight className="h-4 w-4 text-slate-300 transition group-hover:text-indigo-500" /></div><p className="mt-5 font-poppins text-[25px] font-bold tracking-[-0.04em] text-slate-950">{item.value}</p><p className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">{item.label}</p><p className="mt-2 text-[10px] text-slate-500">{item.note}</p></button>)}
        </section>
      )}

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <div className="rounded-[24px] border border-slate-200/70 bg-white p-6 shadow-[0_14px_40px_rgba(15,23,42,0.055)] xl:col-span-7">
          <div className="flex items-start justify-between"><div><p className="text-[9px] font-bold uppercase tracking-[0.15em] text-indigo-500">Management queue</p><h2 className="mt-1 font-poppins text-[19px] font-bold tracking-[-0.03em] text-slate-950">Today’s priority actions</h2><p className="mt-1 text-[10px] text-slate-400">Highest-impact issues, automatically ranked from live records.</p></div><button onClick={reload} className="rounded-xl border border-slate-200 p-2 text-slate-400 transition hover:text-indigo-600"><RefreshCw className="h-4 w-4" /></button></div>
          <div className="mt-5 divide-y divide-slate-100">
            {(data?.priorities || []).map((item, index) => <button key={`${item.title}-${index}`} onClick={() => navigate(item.path)} className="group flex w-full items-center gap-4 py-4 text-left"><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border ${priorityTone[item.level] || priorityTone.low}`}>{item.level === 'clear' ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}</span><span className="min-w-0 flex-1"><span className="block text-[12px] font-bold text-slate-800">{item.title}</span><span className="mt-1 block truncate text-[10px] text-slate-400">{item.detail}</span></span>{item.value > 0 && <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">{item.value}</span>}<ChevronRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-indigo-500" /></button>)}
          </div>
        </div>

        <div className="rounded-[24px] border border-slate-200/70 bg-white p-6 shadow-[0_14px_40px_rgba(15,23,42,0.055)] xl:col-span-5">
          <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-emerald-600">Finance health</p><div className="mt-1 flex items-end justify-between"><div><h2 className="font-poppins text-[19px] font-bold tracking-[-0.03em] text-slate-950">Fee collection</h2><p className="mt-1 text-[10px] text-slate-400">Expected versus realised for the current data set.</p></div><span className="text-[22px] font-bold text-emerald-600">{collectionProgress}%</span></div>
          <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-[linear-gradient(90deg,#10B981,#14B8A6)] transition-all" style={{ width: `${collectionProgress}%` }} /></div>
          <div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-emerald-50 p-4"><p className="text-[9px] font-bold uppercase tracking-wider text-emerald-600">Collected</p><p className="mt-2 text-[16px] font-bold text-slate-900">{fmt(collection.fees_collected)}</p></div><div className="rounded-2xl bg-rose-50 p-4"><p className="text-[9px] font-bold uppercase tracking-wider text-rose-500">Outstanding</p><p className="mt-2 text-[16px] font-bold text-slate-900">{fmt(collection.fees_outstanding)}</p></div></div>
          <button onClick={() => navigate('/collections')} className="mt-4 flex w-full items-center justify-between rounded-2xl bg-slate-950 px-4 py-3 text-[10px] font-bold text-white transition hover:bg-indigo-700"><span>Open collection intelligence</span><ArrowUpRight className="h-4 w-4" /></button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <div className="rounded-[24px] border border-slate-200/70 bg-white p-6 shadow-[0_14px_40px_rgba(15,23,42,0.055)] xl:col-span-7">
          <div className="flex items-start justify-between"><div><p className="text-[9px] font-bold uppercase tracking-[0.15em] text-blue-600">7-day view</p><h2 className="mt-1 font-poppins text-[19px] font-bold tracking-[-0.03em] text-slate-950">Attendance movement</h2></div><button onClick={() => navigate('/attendance/reports')} className="text-[10px] font-bold text-indigo-600">View report →</button></div>
          {hasAttendanceTrend ? <div className="mt-5"><ResponsiveContainer width="100%" height={210}><AreaChart data={data?.attendance_trend || []} margin={{ left: -24, right: 8, top: 8 }}><defs><linearGradient id="adminAtt" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#4F46E5" stopOpacity={0.30} /><stop offset="100%" stopColor="#4F46E5" stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#EEF2F7" vertical={false} /><XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} /><YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} /><Tooltip formatter={(value) => [`${value}%`, 'Attendance']} contentStyle={{ borderRadius: 14, border: '1px solid #E2E8F0', fontSize: 11 }} /><Area connectNulls type="monotone" dataKey="rate" stroke="#4F46E5" strokeWidth={3} fill="url(#adminAtt)" /></AreaChart></ResponsiveContainer></div> : <div className="mt-5 flex h-[210px] flex-col items-center justify-center rounded-2xl bg-slate-50"><CalendarCheck className="h-7 w-7 text-slate-300" /><p className="mt-3 text-[11px] font-semibold text-slate-500">No attendance history yet</p><button onClick={() => navigate('/attendance/add')} className="mt-2 text-[10px] font-bold text-indigo-600">Mark today’s attendance</button></div>}
        </div>

        <div className="rounded-[24px] border border-slate-200/70 bg-white p-6 shadow-[0_14px_40px_rgba(15,23,42,0.055)] xl:col-span-5">
          <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-violet-600">Learning operations</p><h2 className="mt-1 font-poppins text-[19px] font-bold tracking-[-0.03em] text-slate-950">Academic pulse</h2>
          <div className="mt-5 grid grid-cols-2 gap-3">{[
            { label: 'Upcoming exams', value: data?.academic_pulse?.upcoming_exams || 0, icon: CalendarDays, path: '/exams/view', tone: 'bg-indigo-50 text-indigo-600' },
            { label: 'Syllabus behind', value: data?.academic_pulse?.syllabus_behind || 0, icon: Clock3, path: '/academics/syllabus', tone: 'bg-amber-50 text-amber-600' },
            { label: 'Open interventions', value: data?.academic_pulse?.open_interventions || 0, icon: BookOpenCheck, path: '/academics/interventions', tone: 'bg-rose-50 text-rose-600' },
            { label: 'Teacher allocation', value: `${data?.academic_pulse?.teacher_allocation_coverage || 0}%`, icon: School, path: '/teachers/allocations', tone: 'bg-emerald-50 text-emerald-600' },
          ].map((item) => <button key={item.label} onClick={() => navigate(item.path)} className="rounded-2xl border border-slate-100 p-4 text-left transition hover:border-indigo-200 hover:bg-indigo-50/30"><span className={`flex h-9 w-9 items-center justify-center rounded-xl ${item.tone}`}><item.icon className="h-4 w-4" /></span><p className="mt-3 text-[18px] font-bold text-slate-900">{item.value}</p><p className="mt-1 text-[9px] font-semibold text-slate-400">{item.label}</p></button>)}</div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <div className="rounded-[24px] border border-slate-200/70 bg-white p-6 shadow-[0_14px_40px_rgba(15,23,42,0.055)] xl:col-span-7"><div className="flex items-center justify-between"><div><p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400">Audit trail</p><h2 className="mt-1 font-poppins text-[17px] font-bold text-slate-950">Recent school activity</h2></div><Bell className="h-5 w-5 text-slate-300" /></div><div className="mt-4 divide-y divide-slate-100">{(data?.recent_activity || []).length ? data.recent_activity.slice(0, 5).map((event, index) => <div key={`${event.id || event.title}-${index}`} className="flex items-start gap-3 py-3"><span className={`mt-1.5 h-2 w-2 rounded-full ${event.type === 'warning' ? 'bg-amber-400' : event.type === 'success' ? 'bg-emerald-400' : 'bg-indigo-400'}`} /><div className="min-w-0"><p className="text-[11px] font-bold text-slate-700">{event.title}</p><p className="mt-1 truncate text-[9px] text-slate-400">{event.body}</p></div></div>) : <p className="py-8 text-center text-[10px] text-slate-400">Activity will appear as school operations are completed.</p>}</div></div>
        <div className="rounded-[24px] border border-slate-200/70 bg-white p-6 shadow-[0_14px_40px_rgba(15,23,42,0.055)] xl:col-span-5"><p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400">Daily shortcuts</p><h2 className="mt-1 font-poppins text-[17px] font-bold text-slate-950">Quick actions</h2><div className="mt-4 space-y-2">{quick.map((item) => <button key={item.path} onClick={() => navigate(item.path)} className="group flex w-full items-center gap-3 rounded-2xl border border-slate-100 p-3 text-left transition hover:border-indigo-200 hover:bg-indigo-50/40"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition group-hover:bg-indigo-100 group-hover:text-indigo-600"><item.icon className="h-4 w-4" /></span><span className="flex-1"><span className="block text-[11px] font-bold text-slate-700">{item.label}</span><span className="mt-0.5 block text-[9px] text-slate-400">{item.hint}</span></span><ChevronRight className="h-4 w-4 text-slate-300" /></button>)}</div></div>
      </section>
    </div>
  );
};

const FeeDashboard = () => {
  const { data, loading, error, reload } = useAnalytics('/analytics/fee');
  if (error) return <ErrorState onRetry={reload} />;
  return (
    <>
      <StatGrid loading={loading} items={data ? [
        { label: 'Total Collected', value: fmtL(data.stats.collected), delta: '+8.1%', icon: Wallet, tint: 'bg-green-50 text-green-600' },
        { label: 'Pending Dues', value: fmt(data.stats.pending), icon: AlertTriangle, tint: 'bg-indigo-50 text-[#4F46E5]' },
        { label: 'Total Billed', value: fmtL(data.stats.total), icon: TrendingUp, tint: 'bg-blue-50 text-blue-600' },
        { label: 'Invoices', value: data.stats.invoices, icon: Receipt, tint: 'bg-amber-50 text-amber-600' },
      ] : []} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-6">
        <ChartCard title="Monthly Collections" loading={loading} empty={!!data && !data.monthly?.length}>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={data?.monthly || []} margin={{ left: -10, right: 10, top: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#999' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => `${v / 100000}L`} tick={{ fontSize: 11, fill: '#999' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => fmtL(v)} contentStyle={{ borderRadius: 10, border: '1px solid #eee', fontSize: 12 }} />
              <Bar dataKey="amount" fill="#4F46E5" radius={[6, 6, 0, 0]} barSize={26} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Payment Method Split" loading={loading} empty={!!data && !data.method_split?.length}>
          <ResponsiveContainer width="100%" height={230}>
            <PieChart>
              <Pie data={data?.method_split || []} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80} paddingAngle={3}>
                {(data?.method_split || []).map((e, i) => <Cell key={i} fill={PIE[i % PIE.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #eee', fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-1">
            {(data?.method_split || []).map((e, i) => <span key={i} className="flex items-center gap-1.5 text-[11px] text-[#888]"><span className="w-2 h-2 rounded-full" style={{ background: PIE[i % PIE.length] }} /> {e.name}</span>)}
          </div>
        </ChartCard>
        <ChartCard title="Top Outstanding Dues" loading={loading} empty={!!data && !data.top_dues?.length} emptyText="No pending dues 🎉">
          <div className="space-y-3">
            {(data?.top_dues || []).map((d, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3"><img src={d.avatar} alt="" className="w-8 h-8 rounded-full object-cover" /><span className="text-[13px] font-medium text-[#333]">{d.name}</span></div>
                <span className="text-[13px] font-bold text-[#4F46E5]">{fmt(d.due)}</span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </>
  );
};

const PrincipalDashboard = () => {
  const { data, loading, error, reload } = useAnalytics('/analytics/academic');
  if (error) return <ErrorState onRetry={reload} />;
  return (
    <>
      <StatGrid loading={loading} items={data ? [
        { label: 'Pass Rate', value: `${data.stats.pass_rate}%`, delta: '+1.2%', icon: Award, tint: 'bg-green-50 text-green-600' },
        { label: 'Class Average', value: `${data.stats.avg}%`, icon: Percent, tint: 'bg-blue-50 text-blue-600' },
        { label: 'Attendance', value: data.stats.attendance == null ? '—' : `${data.stats.attendance}%`, icon: CalendarCheck, tint: 'bg-amber-50 text-amber-600' },
        { label: 'Students', value: data.stats.students, icon: Users, tint: 'bg-indigo-50 text-[#5B5FEF]' },
      ] : []} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6">
        <ChartCard title="Attendance Trend" loading={loading} empty={!!data && !data.attendance_trend?.length}>
          <ResponsiveContainer width="100%" height={230}>
            <LineChart data={data?.attendance_trend || []} margin={{ left: -20, right: 10, top: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#999' }} axisLine={false} tickLine={false} />
              <YAxis domain={[80, 100]} tick={{ fontSize: 11, fill: '#999' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #eee', fontSize: 12 }} />
              <Line type="monotone" dataKey="rate" stroke="#4F46E5" strokeWidth={2.5} dot={{ r: 4, fill: '#4F46E5' }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Subject-wise Scores" loading={loading} empty={!!data && !data.subject_scores?.length}>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={data?.subject_scores || []} margin={{ left: -10, right: 10, top: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="subject" tick={{ fontSize: 11, fill: '#999' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#999' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #eee', fontSize: 12 }} />
              <Bar dataKey="score" fill="#4F46E5" radius={[6, 6, 0, 0]} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
      <div className="bg-white/90 rounded-2xl border border-white ring-1 ring-slate-100 shadow-[0_12px_32px_rgba(15,23,42,0.055)] p-6 mt-6">
        <div className="mb-4 flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#635BFF]" /><h3 className="font-poppins text-[16px] font-bold tracking-[-0.02em] text-slate-900">Top Performers</h3></div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">{[0, 1, 2, 3, 4].map((i) => <div key={i} className="h-24 rounded-xl bg-gray-50 animate-pulse" />)}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {(data?.results_top || []).map((r, i) => (
              <div key={i} className="rounded-xl border border-gray-100 bg-[#fafafa] p-4 text-center">
                <p className="text-[11px] text-[#a0a0a0]">Rank #{r.rank}</p>
                <p className="text-[13px] font-semibold text-[#1a1a1a] mt-1 truncate">{r.name}</p>
                <p className="text-[16px] font-poppins font-bold text-[#4F46E5] mt-1">{r.percent}%</p>
              </div>
            ))}
            {(!data || !data.results_top?.length) && <p className="text-[13px] text-[#999] col-span-5 text-center py-4">No results published yet.</p>}
          </div>
        )}
      </div>
    </>
  );
};

const Dashboard = () => {
  const { auth } = useAuth();
  const role = auth?.role;
  return (
    <Layout>
      {role === 'fee_manager' ? <FeeDashboard /> : role === 'principal' ? <PrincipalDashboard /> : <AdminDashboard />}
    </Layout>
  );
};

export default Dashboard;
