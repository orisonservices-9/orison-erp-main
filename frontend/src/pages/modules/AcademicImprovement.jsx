import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { Badge, Btn, Card, PageTitle, StatCards, Table } from '../../components/Shared';
import api from '../../api';
import { Activity, AlertTriangle, BookOpenCheck, CalendarClock, CheckCircle2, ClipboardPlus, HeartPulse, Plus, Users } from 'lucide-react';

const Select = ({ value, onChange, children }) => <select value={value} onChange={onChange} className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-[13px]">{children}</select>;
const Empty = ({ children }) => <div className="py-8 text-center text-[13px] text-[#999]">{children}</div>;

export const AcademicActionCenter = () => {
  const [data, setData] = useState({ actions: [], risks: [] }); const [loading, setLoading] = useState(true); const [notice, setNotice] = useState(''); const navigate = useNavigate();
  const load = useCallback(async () => { setLoading(true); try { setData((await api.get('/academic-intelligence')).data); } finally { setLoading(false); } }, []);
  useEffect(() => { load().catch(() => setLoading(false)); }, [load]);
  const run = async () => { const r = await api.post('/academic-intelligence/run'); setNotice(`${r.data.created} intervention case(s) created automatically; ${r.data.existing} existing case(s) kept.`); load(); };
  return <Layout><PageTitle title="Academic Action Center" subtitle="Data → risk → action → intervention → result." actions={<><Btn variant="outline" onClick={load}>Refresh</Btn><Btn icon={ClipboardPlus} onClick={run}>Auto-detect risks</Btn></>} />
    <StatCards items={[{ label: 'Academic Health Score', value: `${data.school_academic_score ?? '—'}/100`, icon: HeartPulse, tint: 'bg-green-50 text-green-600' }, { label: 'Students At Risk', value: data.at_risk_students || 0, icon: AlertTriangle, tint: 'bg-red-50 text-[#C4141B]' }, { label: 'Syllabus Behind', value: data.syllabus_behind || 0, icon: BookOpenCheck, tint: 'bg-amber-50 text-amber-600' }, { label: 'Open Interventions', value: data.interventions_open || 0, icon: ClipboardPlus, tint: 'bg-blue-50 text-blue-600' }]} />
    {notice && <div className="mb-5 rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-[13px] text-green-700">{notice}</div>}
    <Card title="Today's Priority Actions">{data.actions.length ? data.actions.map((a, i) => <div key={i} className="flex justify-between items-center py-3 border-b border-gray-50"><span className="text-[13px] font-medium text-[#333]">⚠️ {a.title}</span><button onClick={() => navigate(a.path)} className="text-[12px] font-medium text-[#C4141B]">Take action</button></div>) : <Empty>No critical actions today.</Empty>}</Card>
    <Card title="Students requiring attention" subtitle="Risk rules: attendance <75% or homework <60%." className="mt-5" pad="p-0"><div className="overflow-x-auto"><Table columns={[{ label: 'Student' }, { label: 'Class' }, { label: 'Risk signals' }, { label: 'Severity' }, { label: 'Action' }]}>{data.risks.map((r) => <tr key={r.student_id} className="border-b border-gray-50"><td className="px-6 py-3 text-[13px] font-medium">{r.student_name}</td><td className="py-3 text-[13px]">{r.class_name}</td><td className="py-3 text-[12px] text-[#666]">{r.indicators.join(' · ')}</td><td className="py-3"><Badge color={r.severity === 'High' ? 'red' : 'amber'}>{r.severity}</Badge></td><td className="py-3 pr-6"><button onClick={() => navigate('/academics/interventions')} className="text-[12px] font-medium text-[#C4141B]">Create intervention</button></td></tr>)}</Table>{!loading && !data.risks.length && <Empty>Record student health signals to identify risks.</Empty>}</div></Card>
  </Layout>;
};

export const StudentHealthSignals = () => {
  const [structure, setStructure] = useState({ classes: [] });
  const [students, setStudents] = useState([]);
  const [className, setClassName] = useState('');
  const [section, setSection] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState('');
  const loadSetup = useCallback(async () => {
    const [setup, studentResponse] = await Promise.all([api.get('/academic-structure'), api.get('/students')]);
    setStructure(setup.data || { classes: [] }); setStudents(studentResponse.data || []);
  }, []);
  useEffect(() => { loadSetup().catch(() => setNotice('Could not load the configured classes and students.')); }, [loadSetup]);
  const chosenClass = (structure.classes || []).find((item) => item.name === className);
  const sections = chosenClass?.sections || [];
  const loadDashboard = useCallback(async () => {
    if (!className || !section) { setData(null); return; }
    setLoading(true); setNotice('');
    try { setData((await api.get('/student-health-dashboard', { params: { class_name: className, section } })).data); }
    catch (_) { setNotice('Could not load health data for this class and section.'); }
    finally { setLoading(false); }
  }, [className, section]);
  useEffect(() => { loadDashboard(); }, [loadDashboard]);
  const fmt = (value) => value === null || value === undefined ? '—' : `${value}%`;
  return <Layout>
    <PageTitle title="Student Health Dashboard" subtitle="Select one class and section to review real student performance, attendance, assessment trends and participation." actions={<Btn variant="outline" onClick={loadDashboard}>Refresh</Btn>} />
    {notice && <div className="mb-5 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-[13px] text-amber-700">{notice}</div>}
    <Card title="Choose the teaching group" subtitle="This dashboard never combines different classes or sections."><div className="grid grid-cols-1 gap-4 md:grid-cols-3"><label className="text-[12px] font-medium text-[#555]">Class<Select value={className} onChange={(e) => { setClassName(e.target.value); setSection(''); }}><option value="">Select class</option>{(structure.classes || []).map((item) => <option key={item.id || item.name} value={item.name}>{item.name}</option>)}</Select></label><label className="text-[12px] font-medium text-[#555]">Section<Select value={section} onChange={(e) => setSection(e.target.value)}><option value="">Select section</option>{sections.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}</Select></label><div className="self-end text-[12px] text-[#777]">{className && section ? `${className} • ${section}` : 'Choose both filters to see the dashboard.'}</div></div></Card>
    {!className || !section ? <Card className="mt-5" title="Student Health Dashboard"><Empty>Select the exact Class and Section above. The system will show only those students.</Empty></Card> : <>
      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[{ label: 'Overall Performance', value: fmt(data?.summary?.overall_performance), icon: HeartPulse, tint: 'bg-red-50 text-[#C4141B]' }, { label: 'Average Attendance', value: fmt(data?.summary?.average_attendance), icon: Activity, tint: 'bg-blue-50 text-blue-600' }, { label: 'Class Participation', value: fmt(data?.summary?.average_participation), icon: Users, tint: 'bg-purple-50 text-purple-600' }, { label: 'Students Needing Support', value: data?.summary?.needs_attention ?? '—', icon: AlertTriangle, tint: 'bg-amber-50 text-amber-600' }].map(({ label, value, icon: Icon, tint }) => <div key={label} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"><span className={`flex h-11 w-11 items-center justify-center rounded-xl ${tint}`}><Icon size={21} /></span><p className="mt-4 font-poppins text-[24px] font-bold text-[#1a1a1a]">{loading ? '…' : value}</p><p className="text-[13px] text-[#888]">{label}</p></div>)}
      </div>
      <Card title="Class subject performance" subtitle="Latest recorded assessment average for each subject in the selected class and section." className="mt-5" pad="p-0"><div className="overflow-x-auto"><Table columns={[{ label: 'Subject' }, { label: 'Latest assessment' }, { label: 'Class average' }, { label: 'Performance' }]}>{(data?.subject_scores || []).map((item) => <tr key={item.subject} className="border-b border-gray-50"><td className="px-6 py-3 text-[13px] font-medium">{item.subject}</td><td className="py-3 text-[13px] text-[#666]">{item.assessment}</td><td className="py-3 text-[13px] font-medium">{fmt(item.average)}</td><td className="py-3 pr-6"><div className="h-2 w-36 overflow-hidden rounded-full bg-gray-100"><div className={`h-full ${item.average >= 75 ? 'bg-green-500' : item.average >= 50 ? 'bg-amber-400' : 'bg-[#C4141B]'}`} style={{ width: `${item.average || 0}%` }} /></div></td></tr>)}</Table>{!loading && !(data?.subject_scores || []).length && <Empty>No exam results have been entered for {className} {section} yet.</Empty>}</div></Card>
      <Card title="Student health and progress" subtitle="The system compares the latest two recorded exams and presents one simple progress result for each student." className="mt-5" pad="p-0"><div className="overflow-x-auto"><Table columns={[{ label: 'Student' }, { label: 'Roll' }, { label: 'Attendance' }, { label: 'Participation' }, { label: 'Exam Progress' }, { label: 'Health' }]}>{(data?.students || []).map((student) => { const needsSupport = (student.latest_score !== null && student.latest_score < 50) || (student.attendance_percent !== null && student.attendance_percent < 75); const trendColor = student.trend_status === 'Improved' ? 'green' : student.trend_status === 'Declined' ? 'red' : student.trend_status === 'Stable' ? 'blue' : 'gray'; return <tr key={student.student_id} className="border-b border-gray-50"><td className="px-6 py-3 text-[13px] font-medium">{student.student_name}</td><td className="py-3 text-[13px] text-[#666]">{student.roll || '—'}</td><td className="py-3 text-[13px]">{fmt(student.attendance_percent)}</td><td className="py-3 text-[13px]">{fmt(student.participation_percent)}</td><td className="py-3"><div className="flex items-start gap-2"><Badge color={trendColor}>{student.trend_status}</Badge><span className="max-w-[230px] text-[12px] leading-5 text-[#666]">{student.trend_message}</span></div></td><td className="py-3 pr-6"><Badge color={needsSupport ? 'red' : student.latest_score === null ? 'gray' : 'green'}>{needsSupport ? 'Needs support' : student.latest_score === null ? 'Awaiting data' : 'On track'}</Badge></td></tr>; })}</Table>{!loading && !(data?.students || []).length && <Empty>No students are enrolled in {className} {section}.</Empty>}</div></Card>
    </>}
  </Layout>;
};

export const CurriculumSyllabus = () => {
  const [units, setUnits] = useState([]);
  const [structure, setStructure] = useState({ academic_year: '', classes: [] });
  const [form, setForm] = useState({ class_name: '', section: '', subject: '', chapter: '', start_date: '', target_date: '' });
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [unitResponse, structureResponse] = await Promise.all([api.get('/curriculum-units'), api.get('/academic-structure')]);
    setUnits(unitResponse.data);
    setStructure(structureResponse.data || { academic_year: '', classes: [] });
    setLoading(false);
  }, []);

  useEffect(() => { load().catch(() => { setNotice('Could not load the academic setup. Please refresh and try again.'); setLoading(false); }); }, [load]);

  const selectedClass = (structure.classes || []).find((item) => item.name === form.class_name);
  const sections = selectedClass?.sections || [];
  const selectedSection = sections.find((item) => item.name === form.section);
  const subjects = selectedSection?.subjects || [];

  const updateClass = (className) => setForm({ ...form, class_name: className, section: '', subject: '' });
  const updateSection = (section) => setForm({ ...form, section, subject: '' });

  const save = async () => {
    setNotice('');
    try {
      await api.post('/curriculum-units', form);
      setNotice('Chapter plan saved. The assigned teacher can now complete it, and overdue plans will be escalated automatically.');
      setForm({ ...form, chapter: '', start_date: '', target_date: '' });
      await load();
    } catch (error) {
      setNotice(error.response?.data?.detail || 'Could not save the chapter plan. Please complete every field.');
    }
  };

  const complete = async (unit) => {
    try {
      await api.post(`/curriculum-units/${unit.id}/complete`);
      setNotice(`${unit.chapter} has been marked completed.`);
      await load();
    } catch (error) {
      setNotice(error.response?.data?.detail || 'Could not mark this chapter complete.');
    }
  };

  const statusColor = (status) => status === 'Completed' ? 'green' : status === 'Overdue' ? 'red' : status === 'In progress' ? 'blue' : 'amber';

  return <Layout>
    <PageTitle title="Curriculum & Syllabus" subtitle="Plan every chapter for the exact class, section and subject, then track completion against its teaching deadline." actions={<Btn icon={Plus} onClick={save}>Plan chapter</Btn>} />
    {notice && <div className={`mb-5 rounded-xl border px-4 py-3 text-[13px] ${notice.includes('saved') || notice.includes('marked') ? 'border-green-100 bg-green-50 text-green-700' : 'border-red-100 bg-red-50 text-[#C4141B]'}`}>{notice}</div>}
    {!loading && !(structure.classes || []).length && <Card className="mb-5" title="Academic Setup needed"><p className="text-[13px] text-[#666]">First create the Academic Year, classes, sections and their subjects in <strong>Academic Setup</strong>. Those exact choices will then appear here.</p></Card>}
    <Card title="1. Plan a chapter" subtitle="The Academic Coordinator selects the teaching group first; free-text classes and subjects are not allowed.">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <label className="text-[12px] font-medium text-[#555]">Class<Select value={form.class_name} onChange={(e) => updateClass(e.target.value)}><option value="">Select class</option>{(structure.classes || []).map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}</Select></label>
        <label className="text-[12px] font-medium text-[#555]">Section<Select value={form.section} onChange={(e) => updateSection(e.target.value)}><option value="">Select section</option>{sections.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}</Select></label>
        <label className="text-[12px] font-medium text-[#555]">Subject<Select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}><option value="">Select subject</option>{subjects.map((subject) => <option key={subject} value={subject}>{subject}</option>)}</Select></label>
        <label className="text-[12px] font-medium text-[#555]">Chapter<input value={form.chapter} onChange={(e) => setForm({ ...form, chapter: e.target.value })} placeholder="e.g. Addition within 100" className="mt-1 h-10 w-full rounded-lg border border-gray-200 px-3 text-[13px]" /></label>
        <label className="text-[12px] font-medium text-[#555]">Start date<input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className="mt-1 h-10 w-full rounded-lg border border-gray-200 px-3 text-[13px]" /></label>
        <label className="text-[12px] font-medium text-[#555]">Completion deadline<input type="date" value={form.target_date} min={form.start_date || undefined} onChange={(e) => setForm({ ...form, target_date: e.target.value })} className="mt-1 h-10 w-full rounded-lg border border-gray-200 px-3 text-[13px]" /></label>
      </div>
    </Card>
    <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
      <Card title="2. Completion and accountability" subtitle="The coordinator can record completion here. The teacher app can use the same action later."><div className="flex gap-3 text-[13px] text-[#666]"><CheckCircle2 className="mt-0.5 shrink-0 text-green-600" size={18} />A completed chapter is recorded with the completion time and no longer appears as behind schedule.</div></Card>
      <Card title="Automatic timeline alerts" subtitle="No manual percentage slider is required."><div className="flex gap-3 text-[13px] text-[#666]"><CalendarClock className="mt-0.5 shrink-0 text-amber-600" size={18} />If a chapter is not completed after its deadline, it becomes <strong>Overdue</strong> and an alert is created for the Principal, Director and Admin.</div></Card>
    </div>
    <Card title="3. Chapter timeline" subtitle="Overdue rows identify the teacher and teaching group that need follow-up." className="mt-5" pad="p-0"><div className="overflow-x-auto"><Table columns={[{ label: 'Class' }, { label: 'Section' }, { label: 'Subject' }, { label: 'Chapter' }, { label: 'Teacher' }, { label: 'Timeline' }, { label: 'Status' }, { label: 'Action' }]}>{units.map((u) => <tr key={u.id} className="border-b border-gray-50"><td className="px-6 py-3 text-[13px] font-medium">{u.class_name}</td><td className="py-3 text-[13px]">{u.section}</td><td className="py-3 text-[13px]">{u.subject}</td><td className="py-3 text-[13px]">{u.chapter}</td><td className="py-3 text-[12px] text-[#555]">{u.teacher_name || 'Unassigned'}</td><td className="py-3 text-[12px] text-[#666]">{u.start_date} → {u.target_date}</td><td className="py-3"><Badge color={statusColor(u.status)}>{u.status || 'Planned'}</Badge></td><td className="py-3 pr-6">{u.status !== 'Completed' && <button onClick={() => complete(u)} className="text-[12px] font-medium text-[#C4141B]">Mark complete</button>}</td></tr>)}</Table>{!loading && !units.length && <Empty>No chapter plans yet. Choose a class, section and subject above to create the first plan.</Empty>}</div></Card>
  </Layout>;
};

export const AcademicInterventions = () => {
  const blank = { class_name: '', section: '', subject: '', teacher_id: '', teacher_name: '', unit_name: '', observation_date: new Date().toISOString().slice(0, 10), plan_score: '', behaviour_score: '', engagement_score: '', notes: '', academic_year: '' };
  const [structure, setStructure] = useState({ academic_year: '', classes: [] });
  const [allocations, setAllocations] = useState([]);
  const [observations, setObservations] = useState([]);
  const [form, setForm] = useState(blank);
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);
  const load = useCallback(async () => {
    const [setup, allocationResponse, observationResponse] = await Promise.all([api.get('/academic-structure'), api.get('/teaching/setup'), api.get('/classroom-observations')]);
    setStructure(setup.data || { academic_year: '', classes: [] });
    setAllocations(allocationResponse.data.allocations || []);
    setObservations(observationResponse.data || []);
  }, []);
  useEffect(() => { load().catch(() => setNotice('Could not load academic setup, teacher allocations or observation records.')); }, [load]);
  const selectedClass = (structure.classes || []).find((item) => item.name === form.class_name);
  const sections = selectedClass?.sections || [];
  const selectedSection = sections.find((item) => item.name === form.section);
  const subjects = selectedSection?.subjects || [];
  const eligibleTeachers = allocations.filter((item) => item.class_name === form.class_name && item.section === form.section && item.subject === form.subject);
  const chooseTeacher = (teacherId) => { const allocation = eligibleTeachers.find((item) => item.teacher_id === teacherId); setForm({ ...form, teacher_id: teacherId, teacher_name: allocation?.teacher_name || '' }); };
  const save = async () => {
    setNotice('');
    if (Object.entries(form).filter(([key]) => ['class_name', 'section', 'subject', 'teacher_id', 'unit_name', 'observation_date', 'plan_score', 'behaviour_score', 'engagement_score'].includes(key)).some(([, value]) => value === '')) { setNotice('Complete the class, section, subject, allocated teacher, observation date, lesson/chapter and all three ratings.'); return; }
    setSaving(true);
    try { await api.post('/classroom-observations', { ...form, plan_score: Number(form.plan_score), behaviour_score: Number(form.behaviour_score), engagement_score: Number(form.engagement_score), academic_year: structure.academic_year }); setNotice('Classroom observation saved. It will feed into Teacher Performance for Principal review.'); setForm({ ...blank, academic_year: structure.academic_year }); await load(); }
    catch (error) { setNotice(error.response?.data?.detail || 'Could not save the observation.'); }
    finally { setSaving(false); }
  };
  const total = [form.plan_score, form.behaviour_score, form.engagement_score].reduce((sum, value) => sum + (Number(value) || 0), 0);
  const visibleObservations = observations.filter((item) => !form.class_name || (item.class_name === form.class_name && (!form.section || item.section === form.section)));
  const rating = (key, label, help) => <label key={key} className="rounded-xl bg-[#fafafa] p-4"><span className="text-[13px] font-medium text-[#333]">{label}</span><span className="mt-1 block text-[11px] text-[#888]">{help}</span><Select value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}><option value="">Rating out of 5</option>{[1, 2, 3, 4, 5].map((number) => <option key={number} value={number}>{number} / 5</option>)}</Select></label>;
  return <Layout>
    <PageTitle title="Academic Interventions" subtitle="Academic Coordinator workspace for physical classroom observation, student involvement and subject-teacher performance." actions={<Btn icon={Plus} onClick={save}>{saving ? 'Saving…' : 'Save observation'}</Btn>} />
    {notice && <div className={`mb-5 rounded-xl border px-4 py-3 text-[13px] ${notice.includes('saved') ? 'border-green-100 bg-green-50 text-green-700' : 'border-amber-100 bg-amber-50 text-amber-700'}`}>{notice}</div>}
    <Card title="Physical classroom observation" subtitle="Choose the exact class, section and subject before selecting its allocated teacher."><div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4"><label className="text-[12px] font-medium text-[#555]">Class<Select value={form.class_name} onChange={(e) => setForm({ ...form, class_name: e.target.value, section: '', subject: '', teacher_id: '', teacher_name: '' })}><option value="">Select class</option>{(structure.classes || []).map((item) => <option key={item.id || item.name} value={item.name}>{item.name}</option>)}</Select></label><label className="text-[12px] font-medium text-[#555]">Section<Select value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value, subject: '', teacher_id: '', teacher_name: '' })}><option value="">Select section</option>{sections.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}</Select></label><label className="text-[12px] font-medium text-[#555]">Subject<Select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value, teacher_id: '', teacher_name: '' })}><option value="">Select subject</option>{subjects.map((item) => <option key={item} value={item}>{item}</option>)}</Select></label><label className="text-[12px] font-medium text-[#555]">Allocated teacher<Select value={form.teacher_id} onChange={(e) => chooseTeacher(e.target.value)}><option value="">Select allocated teacher</option>{eligibleTeachers.map((item) => <option key={item.id} value={item.teacher_id}>{item.teacher_name}</option>)}</Select></label><label className="text-[12px] font-medium text-[#555]">Observation date<input type="date" value={form.observation_date} onChange={(e) => setForm({ ...form, observation_date: e.target.value })} className="mt-1 h-10 w-full rounded-lg border border-gray-200 px-3 text-[13px]" /></label><label className="text-[12px] font-medium text-[#555] xl:col-span-2">Lesson / chapter observed<input value={form.unit_name} onChange={(e) => setForm({ ...form, unit_name: e.target.value })} placeholder="e.g. Fractions — equivalent fractions" className="mt-1 h-10 w-full rounded-lg border border-gray-200 px-3 text-[13px]" /></label><label className="text-[12px] font-medium text-[#555]">Observation notes (optional)<input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Key evidence noticed" className="mt-1 h-10 w-full rounded-lg border border-gray-200 px-3 text-[13px]" /></label></div>{form.class_name && form.section && form.subject && !eligibleTeachers.length && <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-[12px] text-amber-700">No teacher is allocated for this Class, Section and Subject. Create the allocation first in Teaching Excellence → Setup & Teacher Allocations.</p>}</Card>
    <Card title="Rate the observed lesson" subtitle="Each score is out of 5 and is saved against this specific subject teacher, class and section." className="mt-5"><div className="grid grid-cols-1 gap-4 md:grid-cols-3">{rating('plan_score', 'Teaching & subject delivery', 'Clarity, planning and subject understanding')}{rating('engagement_score', 'Student active involvement', 'Questioning, participation and activity involvement')}{rating('behaviour_score', 'Classroom management', 'Learning environment, behaviour and time use')}</div><p className="mt-4 text-right text-[13px] font-semibold text-[#444]">Observation score: <span className="text-[#C4141B]">{total}/15</span></p></Card>
    <Card title="Observation records" subtitle="These observations will later feed the Principal’s Teacher Performance view." className="mt-5" pad="p-0"><div className="overflow-x-auto"><Table columns={[{ label: 'Teacher' }, { label: 'Class / Section / Subject' }, { label: 'Lesson' }, { label: 'Date' }, { label: 'Delivery' }, { label: 'Student involvement' }, { label: 'Management' }, { label: 'Total' }]}>{visibleObservations.map((item) => <tr key={item.id} className="border-b border-gray-50"><td className="px-6 py-3 text-[13px] font-medium">{item.teacher_name}</td><td className="py-3 text-[12px] text-[#666]">{item.class_name} · {item.section} · {item.subject}</td><td className="py-3 text-[13px] text-[#666]">{item.unit_name}</td><td className="py-3 text-[13px] text-[#666]">{item.observation_date}</td><td className="py-3 text-[13px]">{item.plan_score}/5</td><td className="py-3 text-[13px]">{item.engagement_score}/5</td><td className="py-3 text-[13px]">{item.behaviour_score}/5</td><td className="py-3 pr-6"><Badge color={(item.total_score || 0) >= 12 ? 'green' : 'amber'}>{item.total_score || 0}/15</Badge></td></tr>)}</Table>{!visibleObservations.length && <Empty>No physical classroom observations recorded for this selection yet.</Empty>}</div></Card>
  </Layout>;
};
