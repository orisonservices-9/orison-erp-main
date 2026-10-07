import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OrisonLogo from '../../components/OrisonLogo';
import { useAuth } from '../../providers/AuthProvider';
import { ShieldCheck, GraduationCap, Building2, BookOpen, Wallet, Landmark, ArrowRight, Loader2, Server } from 'lucide-react';

const roles = [
  { role: 'admin', name: 'Administrator', desc: 'System settings, user accounts and institutional master control', tag: 'Full Authority', icon: ShieldCheck, tone: 'from-[#4F46E5] to-[#7C3AED]', pill: 'border-indigo-400/20 bg-indigo-400/10 text-indigo-200' },
  { role: 'principal', name: 'Principal / Headmaster', desc: 'Academic pulse, faculty governance and student discipline', tag: 'Academic Lead', icon: GraduationCap, tone: 'from-[#2563EB] to-[#4F46E5]', pill: 'border-blue-400/20 bg-blue-400/10 text-blue-200' },
  { role: 'director', name: 'Board Director', desc: 'Campus network, approvals and high-level oversight', tag: 'Governance', icon: Building2, tone: 'from-[#7C3AED] to-[#9333EA]', pill: 'border-purple-400/20 bg-purple-400/10 text-purple-200' },
  { role: 'academic_coordinator', name: 'Academic Coordinator', desc: 'Syllabus milestones, examination cycles and teacher schedules', tag: 'Curriculum', icon: BookOpen, tone: 'from-[#059669] to-[#0D9488]', pill: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200' },
  { role: 'fee_manager', name: 'Finance & Accounts', desc: 'Student dues, fee receipts, payment reconciliation and audits', tag: 'Accounts', icon: Wallet, tone: 'from-[#D97706] to-[#EA580C]', pill: 'border-amber-400/20 bg-amber-400/10 text-amber-200' },
  { role: 'platform_admin', name: 'Platform Administrator', desc: 'Schools, plans, subscriptions and platform users across the product', tag: 'Platform', icon: Landmark, tone: 'from-[#0F172A] to-[#334155]', pill: 'border-slate-300/20 bg-slate-400/10 text-slate-200' },
];

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState('');
  const [loginError, setLoginError] = useState('');

  const handle = async (role) => {
    setLoginError('');
    setLoading(role);
    try {
      await login(role);
      navigate(role === 'platform_admin' ? '/platform/schools' : '/dashboard');
    } catch (error) {
      setLoading('');
      setLoginError(error?.response?.data?.detail || 'The school server is unavailable. Check the connection and try again.');
    }
  };

  return (
    <div className="login-canvas relative flex min-h-screen w-full flex-col justify-between overflow-x-hidden p-4 sm:p-6 lg:p-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-10 top-20 h-96 w-96 rounded-full bg-indigo-500/15 blur-[120px]" />
        <div className="absolute -right-10 bottom-20 h-96 w-96 rounded-full bg-violet-600/15 blur-[120px]" />
      </div>

      <header className="relative z-10 mx-auto w-full max-w-6xl">
        <div className="login-glass flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-white/80 bg-white/95 px-3.5 py-1.5">
              <OrisonLogo size="sm" />
            </div>
            <span className="hidden h-4 w-px bg-white/15 sm:inline-block" />
            <span className="hidden text-[11px] font-semibold tracking-wide text-slate-300 sm:inline-block">
              Orison Main Campus · 2026-27 Academic Workspace
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <div className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider">System Live</span>
            </div>
            <div className="hidden items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-medium text-slate-300 md:flex">
              <Server className="h-3 w-3 text-indigo-300" />
              <span>School API</span>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto my-auto w-full max-w-6xl py-8 sm:py-10">
        {loginError && (
          <div role="alert" className="mb-6 w-full rounded-xl border border-rose-400/30 bg-rose-500/15 p-3.5 text-center text-[12px] font-medium leading-relaxed text-rose-200">
            {loginError}
          </div>
        )}
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="flex flex-col justify-center text-left lg:col-span-5">
            <span className="inline-flex items-center self-start rounded-full border border-indigo-400/20 bg-indigo-400/10 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-200">
              Institutional Access
            </span>
            <h1 className="mt-4 font-poppins text-3xl font-bold leading-[1.15] tracking-[-0.035em] text-white sm:text-4xl lg:text-5xl">
              Select Your Workspace
            </h1>
            <p className="mt-4 text-[13px] leading-relaxed text-slate-300/85 sm:text-[14px]">
              Sign in with your designated institutional role to access management, academics, attendance, and campus operations.
            </p>
            <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-6">
              {['Role-based permission enforcement', 'Daily operational queue', 'Unified student and fee lifecycle'].map((item) => (
                <div key={item} className="flex items-center gap-3 text-[12px] text-slate-300">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white/10 text-[11px] font-bold text-emerald-300">✓</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col space-y-3 lg:col-span-7">
            {roles.map((item) => {
              const Icon = item.icon;
              const isCurrent = loading === item.role;
              return (
                <button
                  key={item.role}
                  type="button"
                  onClick={() => handle(item.role)}
                  disabled={!!loading}
                  className="login-tile group flex w-full cursor-pointer items-center justify-between gap-4 rounded-2xl p-4 text-left disabled:opacity-60"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${item.tone} text-white`}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-poppins text-[15px] font-bold text-white">{item.name}</h2>
                        <span className={`inline-block rounded-md border px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider ${item.pill}`}>{item.tag}</span>
                      </div>
                      <p className="mt-0.5 text-[11px] leading-relaxed text-slate-300/75">{item.desc}</p>
                    </div>
                  </div>
                  {isCurrent ? (
                    <span className="flex items-center gap-2 text-[11px] font-semibold text-indigo-200">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="hidden sm:inline">Signing in...</span>
                    </span>
                  ) : (
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white">
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </main>

      <footer className="relative z-10 mx-auto w-full max-w-6xl py-2 text-center">
        <p className="text-[11px] text-slate-400/80">© 2026 Orison Services Pvt. Ltd. • School Operations Platform</p>
      </footer>
    </div>
  );
};

export default Login;
