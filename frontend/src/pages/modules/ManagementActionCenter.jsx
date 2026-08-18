import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { Btn, Card, PageTitle, StatCards } from '../../components/Shared';
import api from '../../api';
import { AlertTriangle, BadgeIndianRupee, GraduationCap, HeartPulse, Users } from 'lucide-react';

const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

export default function ManagementActionCenter() {
  const [data, setData] = useState({ academic: {}, admissions: {}, collections: {} }); const [loading, setLoading] = useState(true); const navigate = useNavigate();
  const load = useCallback(async () => { setLoading(true); try { const [academic, admissions, collections] = await Promise.all([api.get('/academic-intelligence'), api.get('/admissions-intelligence'), api.get('/collections-intelligence')]); setData({ academic: academic.data, admissions: admissions.data, collections: collections.data }); } finally { setLoading(false); } }, []);
  useEffect(() => { load().catch(() => setLoading(false)); }, [load]);
  const health = Math.round(((data.academic.school_academic_score || 100) + (data.admissions.conversion || 0) + (data.collections.outstanding ? 70 : 90)) / 3);
  const actions = [
    { danger: data.academic.at_risk_students > 0, text: `${data.academic.at_risk_students || 0} students need academic attention`, button: 'View interventions', path: '/academics/interventions' },
    { danger: data.admissions.stale?.length > 0, text: `${data.admissions.stale?.length || 0} admission leads have no follow-up for 48 hours`, button: 'Review leads', path: '/admissions' },
    { danger: data.collections.outstanding > 0, text: `${money(data.collections.outstanding)} is outstanding in fee collections`, button: 'Collection queue', path: '/collections' },
    { danger: data.academic.syllabus_behind > 0, text: `${data.academic.syllabus_behind || 0} syllabus units are behind plan`, button: 'Review syllabus', path: '/academics/syllabus' },
  ];
  return <Layout><PageTitle title="Management Action Center" subtitle="One view of the school’s health, risks and next actions." actions={<Btn variant="outline" onClick={load}>Refresh</Btn>} />
    <StatCards items={[{ label: 'School Health Score', value: `${health}/100`, icon: HeartPulse, tint: 'bg-green-50 text-green-600' }, { label: 'Academic Risk', value: data.academic.at_risk_students || 0, icon: GraduationCap, tint: 'bg-red-50 text-[#C4141B]' }, { label: 'Admission Conversion', value: `${data.admissions.conversion || 0}%`, icon: Users, tint: 'bg-blue-50 text-blue-600' }, { label: 'Outstanding Fees', value: money(data.collections.outstanding), icon: BadgeIndianRupee, tint: 'bg-amber-50 text-amber-600' }]} />
    <Card title="Today's priority actions" subtitle="Every alert has a direct action for the responsible team.">{loading ? <p className="py-6 text-[13px] text-[#999]">Loading management insights…</p> : actions.map((a, i) => <div key={i} className="flex items-center justify-between gap-4 py-4 border-b border-gray-50 last:border-0"><div className="flex items-center gap-3"><AlertTriangle className={`w-5 h-5 ${a.danger ? 'text-[#C4141B]' : 'text-green-500'}`} /><span className="text-[13px] font-medium text-[#333]">{a.text}</span></div><button onClick={() => navigate(a.path)} className="whitespace-nowrap text-[12px] font-medium text-[#C4141B]">{a.button}</button></div>)}</Card>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-5"><Card title="Academic improvement"><p className="text-[13px] text-[#666]">Open interventions: <b>{data.academic.interventions_open || 0}</b></p><p className="text-[13px] text-[#666] mt-2">Students at risk: <b>{data.academic.at_risk_students || 0}</b></p></Card><Card title="Admissions health"><p className="text-[13px] text-[#666]">Enquiry to admission: <b>{data.admissions.conversion || 0}%</b></p><p className="text-[13px] text-[#666] mt-2">Stale follow-ups: <b>{data.admissions.stale?.length || 0}</b></p></Card><Card title="Collection forecast"><p className="text-[13px] text-[#666]">Expected collection: <b>{money(data.collections.expected_collection_low)}–{money(data.collections.expected_collection_high)}</b></p><p className="text-[13px] text-[#666] mt-2">Outstanding: <b>{money(data.collections.outstanding)}</b></p></Card></div>
  </Layout>;
}
