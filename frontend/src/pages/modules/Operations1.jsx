import React, { useEffect, useMemo, useRef, useState } from 'react';
import Layout from '../../components/Layout';
import { PageTitle, StatCards, Card, Btn, Badge, SearchBar, Table } from '../../components/Shared';
import { BookOpen, CheckCircle2, Clock, FileText, Plus, CalendarDays, Download, Paperclip, Send, MessageCircle, Smartphone, Loader2, Trash2, UsersRound } from 'lucide-react';
import { downloadCSV } from '../../utils';
import api from '../../api';

export const HomeworkManagement = () => {
  const [q, setQ] = useState('');
  const [structure, setStructure] = useState({ academic_year: '', classes: [] });
  const [homework, setHomework] = useState([]);
  const [form, setForm] = useState({ class_name: '', section: '', subject: '', due_date: '', instructions: '', send_parent_app: true, send_whatsapp: true });
  const [files, setFiles] = useState([]);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const fileRef = useRef(null);
  const load = async () => {
    try {
      const [setupResponse, homeworkResponse] = await Promise.all([api.get('/academic-structure'), api.get('/homework')]);
      setStructure(setupResponse.data || { academic_year: '', classes: [] }); setHomework(homeworkResponse.data || []);
    } catch { setNotice('Could not load Academic Setup or saved homework. Please restart the backend and try again.'); }
  };
  useEffect(() => { load(); }, []);
  const selectedClass = (structure.classes || []).find((item) => item.name === form.class_name);
  const sections = selectedClass?.sections || [];
  const selectedSection = sections.find((item) => item.name === form.section);
  const subjects = selectedSection?.subjects || [];
  const rows = homework.filter((item) => [item.subject, item.class_name, item.section, item.instructions].join(' ').toLowerCase().includes(q.toLowerCase()));
  const exportCSV = () => downloadCSV('homework.csv', ['Subject', 'Class', 'Section', 'Due date', 'Instructions', 'Parent App', 'WhatsApp'], rows.map((item) => [item.subject, item.class_name, item.section, item.due_date, item.instructions, item.send_parent_app ? 'Yes' : 'No', item.send_whatsapp ? 'Yes' : 'No']));
  const chooseClass = (event) => setForm((current) => ({ ...current, class_name: event.target.value, section: '', subject: '' }));
  const chooseSection = (event) => setForm((current) => ({ ...current, section: event.target.value, subject: '' }));
  const submit = async (event) => {
    event.preventDefault(); setNotice('');
    if (!form.class_name || !form.section || !form.instructions.trim() || !form.due_date) { setNotice('Choose Class and Section, enter homework and set a due date.'); return; }
    setSaving(true);
    try {
      const attachments = [];
      for (const file of files) { const data = new FormData(); data.append('file', file); const response = await api.post('/homework/attachment', data, { headers: { 'Content-Type': 'multipart/form-data' } }); attachments.push(response.data); }
      const response = await api.post('/homework', { ...form, instructions: form.instructions.trim(), attachments });
      setHomework((current) => [response.data, ...current]);
      setNotice(`Homework assigned successfully. ${response.data.notifications_queued || 0} parent notification(s) were queued.`);
      setForm({ class_name: '', section: '', subject: '', due_date: '', instructions: '', send_parent_app: true, send_whatsapp: true }); setFiles([]);
      if (fileRef.current) fileRef.current.value = '';
    } catch (error) { setNotice(error.response?.data?.detail || 'Could not assign homework. Please try again.'); }
    finally { setSaving(false); }
  };
  return (
    <Layout>
      <PageTitle title="Homework Management" subtitle="Admin and teachers can assign homework to a selected Class and Section."
        actions={<Btn variant="outline" icon={Download} onClick={exportCSV}>Export</Btn>} />
      <StatCards items={[
        { label: 'Active Homework', value: homework.filter((item) => item.status === 'Active').length, icon: BookOpen },
        { label: 'Classes Reached', value: new Set(homework.map((item) => `${item.class_name}-${item.section}`)).size, icon: CheckCircle2, tint: 'bg-green-50 text-green-600' },
        { label: 'Parent App Alerts', value: homework.filter((item) => item.send_parent_app).length, icon: Smartphone, tint: 'bg-blue-50 text-blue-600' },
        { label: 'WhatsApp Alerts', value: homework.filter((item) => item.send_whatsapp).length, icon: MessageCircle, tint: 'bg-amber-50 text-amber-600' },
      ]} />
      {notice && <div className={`mb-5 rounded-xl border px-4 py-3 text-[13px] ${notice.includes('successfully') ? 'border-green-200 bg-green-50 text-green-800' : 'border-amber-200 bg-amber-50 text-amber-800'}`}>{notice}</div>}
      <Card title="Assign Homework" subtitle="Choose the learning group first, then write the homework. Attachments are optional.">
        <form onSubmit={submit}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <label className="text-[11px] font-medium text-[#666]">Class<select value={form.class_name} onChange={chooseClass} className="mt-1.5 h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-[13px] outline-none focus:border-[#C4141B]"><option value="">Select class</option>{(structure.classes || []).map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}</select></label>
            <label className="text-[11px] font-medium text-[#666]">Section<select value={form.section} onChange={chooseSection} disabled={!form.class_name} className="mt-1.5 h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-[13px] outline-none focus:border-[#C4141B] disabled:opacity-50"><option value="">Select section</option>{sections.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}</select></label>
            <label className="text-[11px] font-medium text-[#666]">Subject <span className="font-normal text-[#aaa]">(optional)</span><select value={form.subject} onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))} disabled={!form.section} className="mt-1.5 h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-[13px] outline-none focus:border-[#C4141B] disabled:opacity-50"><option value="">General homework</option>{subjects.map((subject) => <option key={subject} value={subject}>{subject}</option>)}</select></label>
            <label className="text-[11px] font-medium text-[#666]">Due date<input value={form.due_date} onChange={(event) => setForm((current) => ({ ...current, due_date: event.target.value }))} type="date" className="mt-1.5 h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-[13px] outline-none focus:border-[#C4141B]" /></label>
          </div>
          <label className="mt-5 block text-[11px] font-medium text-[#666]">Homework instructions<textarea value={form.instructions} onChange={(event) => setForm((current) => ({ ...current, instructions: event.target.value }))} rows="4" placeholder="Type the homework students need to complete..." className="mt-1.5 w-full resize-y rounded-lg border border-gray-200 bg-white px-3 py-3 text-[13px] outline-none focus:border-[#C4141B]" /></label>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-[#fafafa] px-4 py-3">
            <div><input ref={fileRef} onChange={(event) => setFiles(Array.from(event.target.files || []))} type="file" multiple className="hidden" id="homework-files" /><label htmlFor="homework-files" className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-[12px] font-medium text-[#555] hover:bg-gray-50"><Paperclip className="h-4 w-4" /> Add images, PDFs or files</label>{files.length > 0 && <span className="ml-3 text-[12px] text-[#777]">{files.map((file) => file.name).join(', ')}</span>}</div>
            <div className="flex flex-wrap items-center gap-4"><label className="flex items-center gap-2 text-[12px] text-[#555]"><input checked={form.send_parent_app} onChange={(event) => setForm((current) => ({ ...current, send_parent_app: event.target.checked }))} type="checkbox" className="h-4 w-4 accent-[#C4141B]" /> Show in Parent App</label><label className="flex items-center gap-2 text-[12px] text-[#555]"><input checked={form.send_whatsapp} onChange={(event) => setForm((current) => ({ ...current, send_whatsapp: event.target.checked }))} type="checkbox" className="h-4 w-4 accent-[#C4141B]" /> Send WhatsApp message</label><Btn type="submit" icon={saving ? Loader2 : Send} disabled={saving}>{saving ? 'Assigning...' : 'Assign Homework'}</Btn></div>
          </div>
        </form>
      </Card>
      <Card title="Assigned Homework" subtitle="Saved assignments are visible to the selected class through the chosen delivery channels." action={<SearchBar placeholder="Search homework..." className="w-56" value={q} onChange={(e) => setQ(e.target.value)} />}>
        <Table columns={[{label:'Subject / Homework'},{label:'Class & Section'},{label:'Due Date'},{label:'Attachments'},{label:'Parent Delivery'},{label:'Status'}]}>
          {rows.map((h) => (
            <tr key={h.id} className="border-b border-gray-50 last:border-0 hover:bg-[#fafafa]">
              <td className="py-3 pr-4"><p className="text-[13px] font-medium text-[#1a1a1a]">{h.subject}</p><p className="mt-0.5 max-w-sm truncate text-[11px] text-[#888]">{h.instructions}</p></td>
              <td className="py-3 text-[13px] text-[#666]">{h.class_name}<span className="block text-[11px] text-[#999]">{h.section}</span></td>
              <td className="py-3 text-[13px] text-[#666]">{h.due_date}</td>
              <td className="py-3 text-[12px] text-[#666]">{h.attachments?.length ? h.attachments.map((file) => <a key={file.url} className="mr-2 text-[#C4141B] hover:underline" href={file.url} target="_blank" rel="noreferrer">{file.name}</a>) : 'None'}</td>
              <td className="py-3"><div className="flex flex-wrap gap-1">{h.send_parent_app && <Badge color="blue">Parent App</Badge>}{h.send_whatsapp && <Badge color="green">WhatsApp</Badge>}{!h.send_parent_app && !h.send_whatsapp && <span className="text-[12px] text-[#999]">Not sent</span>}</div></td>
              <td className="py-3"><Badge color={h.status === 'Active' ? 'blue' : 'gray'}>{h.status}</Badge></td>
            </tr>
          ))}
          {rows.length === 0 && <tr><td colSpan={6} className="py-10 text-center text-[13px] text-[#999]">No homework has been assigned yet.</td></tr>}
        </Table>
      </Card>
    </Layout>
  );
};

export const TimetableManagement = ({ mode = 'create' }) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const subjectStyles = ['bg-red-50 text-[#C4141B] border-red-100', 'bg-blue-50 text-blue-700 border-blue-100', 'bg-green-50 text-green-700 border-green-100', 'bg-purple-50 text-purple-700 border-purple-100', 'bg-amber-50 text-amber-700 border-amber-100', 'bg-cyan-50 text-cyan-700 border-cyan-100'];
  const [structure, setStructure] = useState({ academic_year: '', classes: [] });
  const [allocations, setAllocations] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [group, setGroup] = useState({ class_name: '', section: '' });
  const [form, setForm] = useState({ day: 'Monday', start_time: '08:30', end_time: '09:15', subject: '', room: '' });
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const [setup, allocationResponse, periodResponse] = await Promise.all([api.get('/academic-structure'), api.get('/teacher-allocations'), api.get('/timetable-periods')]);
      setStructure(setup.data || { academic_year: '', classes: [] });
      setAllocations(Array.isArray(allocationResponse.data) ? allocationResponse.data : []);
      setPeriods(Array.isArray(periodResponse.data) ? periodResponse.data : []);
    } catch { setNotice('Could not load the timetable. Please ensure the backend is running.'); }
  };
  useEffect(() => { load(); }, []);
  const selectedClass = (structure.classes || []).find((item) => item.name === group.class_name);
  const sections = selectedClass?.sections || [];
  const selectedSection = sections.find((item) => item.name === group.section);
  const subjects = selectedSection?.subjects || [];
  const groupPeriods = periods.filter((item) => item.class_name === group.class_name && item.section === group.section);
  const slots = [...new Set(groupPeriods.map((item) => `${item.start_time}|${item.end_time}`))].map((item) => { const [start_time, end_time] = item.split('|'); return { start_time, end_time }; }).sort((a, b) => a.start_time.localeCompare(b.start_time));
  const allocatedCount = new Set(groupPeriods.map((item) => item.teacher_id)).size;
  const teacherForSubject = allocations.find((item) => item.class_name === group.class_name && item.section === group.section && item.subject === form.subject);
  const pageCopy = {
    create: { title: 'Create Timetable', subtitle: 'Build a conflict-free weekly schedule from your Academic Setup and teacher allocations.' },
    view: { title: 'View Timetable', subtitle: 'Open the weekly timetable for the selected Class and Section.' },
    reports: { title: 'Timetable Reports', subtitle: 'View only the school days where every configured subject has been scheduled with an assigned teacher.' },
  }[mode] || { title: 'Timetable Management', subtitle: '' };
  const reportRows = useMemo(() => {
    const allGroups = (structure.classes || []).flatMap((classItem) => (classItem.sections || []).map((sectionItem) => ({ class_name: classItem.name, section: sectionItem.name, subjects: sectionItem.subjects || [] })));
    return allGroups.filter((item) => (!group.class_name || item.class_name === group.class_name) && (!group.section || item.section === group.section)).flatMap((item) => days.map((day) => {
      const dayPeriods = periods.filter((period) => period.class_name === item.class_name && period.section === item.section && period.day === day);
      const scheduledSubjects = new Set(dayPeriods.map((period) => period.subject));
      const everySubjectScheduled = item.subjects.length > 0 && item.subjects.every((subject) => scheduledSubjects.has(subject));
      const everyPeriodAllocated = dayPeriods.length > 0 && dayPeriods.every((period) => period.teacher_id && period.teacher_name);
      return { ...item, day, period_count: dayPeriods.length, teachers: new Set(dayPeriods.map((period) => period.teacher_name)).size, aligned: everySubjectScheduled && everyPeriodAllocated };
    })).filter((item) => item.aligned);
  }, [structure, periods, group, days]);
  const incompleteDays = useMemo(() => {
    const allDaysForFilter = (structure.classes || []).flatMap((classItem) => (classItem.sections || []).filter((sectionItem) => (!group.class_name || classItem.name === group.class_name) && (!group.section || sectionItem.name === group.section)).flatMap((sectionItem) => days.map((day) => ({ class_name: classItem.name, section: sectionItem.name, subjects: sectionItem.subjects || [], day }))));
    return allDaysForFilter.length - reportRows.length;
  }, [structure, group, days, reportRows]);
  const setClass = (class_name) => { setGroup({ class_name, section: '' }); setForm((current) => ({ ...current, subject: '' })); };
  const setSection = (section) => { setGroup((current) => ({ ...current, section })); setForm((current) => ({ ...current, subject: '' })); };
  const savePeriod = async () => {
    setNotice('');
    if (!group.class_name || !group.section || !form.subject || !form.start_time || !form.end_time) { setNotice('Select Class, Section and Subject, then complete the day and time.'); return; }
    setSaving(true);
    try {
      await api.post('/timetable-periods', { ...group, ...form, academic_year: structure.academic_year });
      setNotice(`${form.subject} was added to the timetable.`);
      setForm((current) => ({ ...current, subject: '', room: '' }));
      await load();
    } catch (error) { setNotice(error.response?.data?.detail || 'Could not save this timetable period.'); }
    finally { setSaving(false); }
  };
  const removePeriod = async (id) => {
    if (!window.confirm('Remove this period from the timetable?')) return;
    try { await api.delete(`/timetable-periods/${id}`); setNotice('Period removed.'); await load(); }
    catch (error) { setNotice(error.response?.data?.detail || 'Could not remove this period.'); }
  };
  return (
    <Layout>
      <PageTitle title={pageCopy.title} subtitle={pageCopy.subtitle}
        actions={<Btn variant="outline" icon={CalendarDays}>{structure.academic_year || 'Academic Year not set'}</Btn>} />
      {notice && <div className={`mb-5 rounded-xl border px-4 py-3 text-[13px] ${notice.includes('added') || notice.includes('removed') ? 'border-green-200 bg-green-50 text-green-800' : 'border-amber-200 bg-amber-50 text-amber-800'}`}>{notice}</div>}
      <Card title={mode === 'reports' ? 'Filter report' : '1. Select timetable group'} subtitle={mode === 'reports' ? 'Leave filters blank to see every Class and Section with fully aligned days.' : 'Choose the exact Class and Section whose schedule you want to create or view.'}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <label className="text-[12px] font-medium text-[#555]">Class<select value={group.class_name} onChange={(event) => setClass(event.target.value)} className="mt-1 h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-[13px] outline-none focus:border-red-300"><option value="">Select class</option>{(structure.classes || []).map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}</select></label>
          <label className="text-[12px] font-medium text-[#555]">Section<select value={group.section} disabled={!group.class_name} onChange={(event) => setSection(event.target.value)} className="mt-1 h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-[13px] outline-none focus:border-red-300 disabled:opacity-50"><option value="">Select section</option>{sections.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}</select></label>
          <div className="self-end rounded-lg bg-[#fafafa] px-4 py-3 text-[12px] text-[#666]">{mode === 'reports' ? <>Showing <span className="font-semibold text-[#333]">{reportRows.length}</span> fully aligned day{reportRows.length === 1 ? '' : 's'}.</> : group.section ? <><span className="font-semibold text-[#333]">{groupPeriods.length}</span> scheduled periods • <span className="font-semibold text-[#333]">{allocatedCount}</span> teachers in this timetable</> : 'Select both Class and Section to open its timetable.'}</div>
        </div>
      </Card>
      {mode === 'create' && group.section && <>
      <StatCards items={[{ label: 'Scheduled Periods', value: groupPeriods.length, icon: Clock }, { label: 'Teaching Days', value: new Set(groupPeriods.map((item) => item.day)).size, icon: CalendarDays, tint: 'bg-blue-50 text-blue-600' }, { label: 'Teachers Scheduled', value: allocatedCount, icon: UsersRound, tint: 'bg-green-50 text-green-600' }, { label: 'Open Subjects', value: Math.max(subjects.length - new Set(groupPeriods.map((item) => item.subject)).size, 0), icon: BookOpen, tint: 'bg-amber-50 text-amber-600' }]} />
      <Card title="2. Add a timetable period" subtitle="The selected subject must already have a teacher allocated. The system blocks class and teacher time clashes.">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          <label className="text-[12px] font-medium text-[#555]">Day<select value={form.day} onChange={(event) => setForm((current) => ({ ...current, day: event.target.value }))} className="mt-1 h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-[13px] outline-none focus:border-red-300">{days.map((day) => <option key={day}>{day}</option>)}</select></label>
          <label className="text-[12px] font-medium text-[#555]">Start time<input type="time" value={form.start_time} onChange={(event) => setForm((current) => ({ ...current, start_time: event.target.value }))} className="mt-1 h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-[13px] outline-none focus:border-red-300" /></label>
          <label className="text-[12px] font-medium text-[#555]">End time<input type="time" value={form.end_time} onChange={(event) => setForm((current) => ({ ...current, end_time: event.target.value }))} className="mt-1 h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-[13px] outline-none focus:border-red-300" /></label>
          <label className="text-[12px] font-medium text-[#555]">Subject<select value={form.subject} onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))} className="mt-1 h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-[13px] outline-none focus:border-red-300"><option value="">Select subject</option>{subjects.map((subject) => <option key={subject} value={subject}>{subject}</option>)}</select></label>
          <label className="text-[12px] font-medium text-[#555]">Room <span className="font-normal text-[#aaa]">(optional)</span><input value={form.room} onChange={(event) => setForm((current) => ({ ...current, room: event.target.value }))} placeholder="e.g. Room 101" className="mt-1 h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-[13px] outline-none focus:border-red-300" /></label>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#fafafa] px-4 py-3"><p className="text-[12px] text-[#666]">{form.subject ? (teacherForSubject ? <>Teacher: <span className="font-semibold text-[#333]">{teacherForSubject.teacher_name}</span></> : <span className="text-amber-700">No teacher is allocated to this subject yet. Allocate one first.</span>) : 'Choose a subject to see the allocated teacher.'}</p><Btn icon={saving ? Loader2 : Plus} onClick={savePeriod} disabled={saving}>{saving ? 'Adding…' : 'Add Period'}</Btn></div>
      </Card>
      </>}
      {mode === 'view' && group.section && <>
      <StatCards items={[{ label: 'Scheduled Periods', value: groupPeriods.length, icon: Clock }, { label: 'Teaching Days', value: new Set(groupPeriods.map((item) => item.day)).size, icon: CalendarDays, tint: 'bg-blue-50 text-blue-600' }, { label: 'Teachers Scheduled', value: allocatedCount, icon: UsersRound, tint: 'bg-green-50 text-green-600' }, { label: 'Configured Subjects', value: subjects.length, icon: BookOpen, tint: 'bg-amber-50 text-amber-600' }]} />
      <Card title={`${group.class_name} — ${group.section}: Weekly timetable`} subtitle="Each block shows the subject, assigned teacher and room.">
        <div className="overflow-x-auto">
          <table className="w-full border-separate" style={{ borderSpacing: '6px' }}>
            <thead><tr><th className="text-[11px] text-[#a0a0a0] font-medium w-24">Time</th>{days.map((day) => <th key={day} className="text-[12px] font-semibold text-[#333] py-2">{day}</th>)}</tr></thead>
            <tbody>
              {slots.map((slot) => (
                <tr key={`${slot.start_time}-${slot.end_time}`}>
                  <td className="text-[11px] text-[#777] font-medium text-center">{slot.start_time}<br />{slot.end_time}</td>
                  {days.map((day, index) => { const item = groupPeriods.find((period) => period.day === day && period.start_time === slot.start_time && period.end_time === slot.end_time); return <td key={day} className="min-w-[135px]">{item ? <div className={`min-h-[74px] rounded-lg border p-2 text-left ${subjectStyles[index % subjectStyles.length]}`}><p className="text-[12px] font-semibold">{item.subject}</p><p className="mt-1 text-[10px] opacity-80">{item.teacher_name}</p>{item.room && <p className="mt-0.5 text-[10px] opacity-70">{item.room}</p>}</div> : <div className="min-h-[74px] rounded-lg border border-dashed border-gray-100 bg-[#fcfcfc]" />}</td>; })}
                </tr>
              ))}
              {slots.length === 0 && <tr><td colSpan={7} className="py-12 text-center text-[13px] text-[#999]">No periods have been added for this Class and Section yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
      <Card title="Scheduled period list" subtitle="Current periods for this Class and Section." className="mt-5" pad="p-0"><div className="overflow-x-auto"><Table columns={[{ label: 'Day / Time' }, { label: 'Subject' }, { label: 'Teacher' }, { label: 'Room' }]}>{[...groupPeriods].sort((a, b) => days.indexOf(a.day) - days.indexOf(b.day) || a.start_time.localeCompare(b.start_time)).map((item) => <tr key={item.id} className="border-b border-gray-50 last:border-0"><td className="px-6 py-3 text-[13px] font-medium text-[#444]">{item.day}<span className="block text-[11px] font-normal text-[#999]">{item.start_time} – {item.end_time}</span></td><td className="py-3"><Badge color="blue">{item.subject}</Badge></td><td className="py-3 text-[13px] text-[#666]">{item.teacher_name}</td><td className="py-3 pr-6 text-[13px] text-[#666]">{item.room || '—'}</td></tr>)}</Table></div></Card>
      </>}
      {mode === 'reports' && <>
      <StatCards items={[{ label: 'Fully Aligned Days', value: reportRows.length, icon: CheckCircle2, tint: 'bg-green-50 text-green-600' }, { label: 'Classes Covered', value: new Set(reportRows.map((item) => item.class_name)).size, icon: CalendarDays, tint: 'bg-blue-50 text-blue-600' }, { label: 'Periods Included', value: reportRows.reduce((total, item) => total + item.period_count, 0), icon: Clock, tint: 'bg-purple-50 text-purple-600' }, { label: 'Incomplete Days Hidden', value: Math.max(incompleteDays, 0), icon: FileText, tint: 'bg-amber-50 text-amber-600' }]} />
      <Card title="Fully aligned days" subtitle="A day appears only when every subject configured for that Class and Section has a scheduled period with an allocated teacher." action={<Btn variant="outline" icon={Download} onClick={() => downloadCSV('timetable-alignment-report.csv', ['Class', 'Section', 'Day', 'Configured Subjects', 'Scheduled Periods', 'Teachers'], reportRows.map((item) => [item.class_name, item.section, item.day, item.subjects.length, item.period_count, item.teachers]))}>Export CSV</Btn>} pad="p-0"><div className="overflow-x-auto"><Table columns={[{ label: 'Class' }, { label: 'Section' }, { label: 'Day' }, { label: 'Subjects Aligned' }, { label: 'Periods' }, { label: 'Teachers' }, { label: 'Status' }]}>{reportRows.map((item) => <tr key={`${item.class_name}-${item.section}-${item.day}`} className="border-b border-gray-50 last:border-0"><td className="px-6 py-3 text-[13px] font-semibold text-[#333]">{item.class_name}</td><td className="py-3 text-[13px] text-[#666]">{item.section}</td><td className="py-3 text-[13px] text-[#666]">{item.day}</td><td className="py-3 text-[13px] text-[#666]">{item.subjects.length} of {item.subjects.length}</td><td className="py-3 text-[13px] text-[#666]">{item.period_count}</td><td className="py-3 text-[13px] text-[#666]">{item.teachers}</td><td className="py-3 pr-6"><Badge color="green">Aligned</Badge></td></tr>)}</Table>{!reportRows.length && <div className="py-14 text-center text-[13px] text-[#999]">No fully aligned timetable days yet. Add all configured subjects with allocated teachers for a day, then it will appear here.</div>}</div></Card>
      </>}
    </Layout>
  );
};
