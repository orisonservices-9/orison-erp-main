import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { FileText, Clock, ListChecks, CalendarClock, Loader2, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import api from '../api';

const Field = ({ label, children }) => <label className="block text-[11px] font-semibold uppercase tracking-wide text-[#777]">{label}<div className="mt-2">{children}</div></label>;
const control = 'h-11 w-full rounded-lg border border-[#e6e6e8] bg-[#f7f7f8] px-3.5 text-[13px] text-[#333] outline-none transition focus:border-[#C4141B] focus:ring-2 focus:ring-red-100 disabled:cursor-not-allowed disabled:opacity-60';

const CreateExam = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [loadingSetup, setLoadingSetup] = useState(true);
  const [structure, setStructure] = useState({ academic_year: '', classes: [] });
  const [gradeScheme, setGradeScheme] = useState([]);
  const [f, setF] = useState({ title: '', class_name: '', section: '', subject_mode: 'all', subject: '', date: '', room: '', start_time: '', end_time: '', max_marks: '100', passing_marks: '' });

  useEffect(() => {
    api.get('/academic-structure').then(({ data }) => setStructure(data || { academic_year: '', classes: [] })).catch(() => setStructure({ academic_year: '', classes: [] })).finally(() => setLoadingSetup(false));
  }, []);

  const selectedClass = useMemo(() => (structure.classes || []).find((item) => item.name === f.class_name), [structure, f.class_name]);
  const sections = useMemo(() => selectedClass?.sections || [], [selectedClass]);
  const selectedSection = useMemo(() => sections.find((item) => item.name === f.section), [sections, f.section]);
  const subjects = selectedSection?.subjects || [];
  const chosenSubjects = f.subject_mode === 'all' ? subjects : (f.subject ? [f.subject] : []);
  const set = (key) => (event) => setF((current) => ({ ...current, [key]: event.target.value }));
  const changeClass = (event) => setF((current) => ({ ...current, class_name: event.target.value, section: '', subject: '' }));
  const changeSection = (event) => setF((current) => ({ ...current, section: event.target.value, subject: '' }));
  const changeGrade = (index, key, value) => setGradeScheme((current) => current.map((item, row) => row === index ? { ...item, [key]: value } : item));
  const addGrade = () => setGradeScheme((current) => [...current, { grade: '', from: '', to: '', point: '', result: 'Pass' }]);
  const removeGrade = (index) => setGradeScheme((current) => current.filter((_, row) => row !== index));

  const schedule = async (status) => {
    if (!f.title.trim() || !f.class_name || !f.section || !chosenSubjects.length) {
      alert('Enter an exam name and select the Class, Section and Subject(s) from Academic Setup.');
      return;
    }
    const invalidGrade = gradeScheme.some((item) => !item.grade.trim() || item.from === '' || item.to === '');
    if (invalidGrade) { alert('Complete or remove every grade range before saving.'); return; }
    setSaving(true);
    try {
      await api.post('/exams', {
        title: f.title.trim(), class_name: f.class_name, section: f.section,
        subject: f.subject_mode === 'all' ? 'All Subjects' : f.subject,
        subjects: chosenSubjects, date: f.date, room: f.room, start_time: f.start_time, end_time: f.end_time,
        max_marks: Number(f.max_marks) || 100, passing_marks: Number(f.passing_marks) || 0,
        grade_scheme: gradeScheme.map((item) => ({ ...item, from: Number(item.from), to: Number(item.to), point: item.point === '' ? null : Number(item.point) })), status,
      });
      navigate('/exams/view');
    } catch (error) {
      alert(error?.response?.data?.detail || 'Could not save the examination. Please try again.');
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between">
        <div><h2 className="font-poppins text-[24px] font-bold text-[#1a1a1a]">Create New Exam</h2><p className="mt-1 text-[13px] text-[#888]">Create an exam only for classes, sections and subjects already added in Academic Setup.</p></div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-[#666]"><CalendarClock className="h-5 w-5" /></div>
      </div>

      {loadingSetup ? <div className="flex justify-center py-20 text-[#888]"><Loader2 className="h-7 w-7 animate-spin" /></div> : !structure.classes?.length ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-[14px] text-amber-800">Please complete <strong>Academic Setup</strong> first. Add the Academic Year, Class, Section and Subjects, then return here to create an exam.</div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <section className="rounded-2xl border border-gray-100 bg-[#fafafa] p-6">
              <h3 className="mb-4 flex items-center gap-2 font-poppins text-[15px] font-bold text-[#1a1a1a]"><FileText className="h-4 w-4 text-[#C4141B]" /> 1. Examination Details</h3>
              <div className="mb-5"><Field label="Exam Name"><input className={control} placeholder="e.g., Term 1 Examination" value={f.title} onChange={set('title')} /></Field></div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Class"><select className={control} value={f.class_name} onChange={changeClass}><option value="">Select class</option>{(structure.classes || []).map((item) => <option key={item.id || item.name} value={item.name}>{item.name}</option>)}</select></Field>
                <Field label="Section"><select className={control} value={f.section} onChange={changeSection} disabled={!f.class_name}><option value="">Select section</option>{sections.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}</select></Field>
              </div>
              <div className="mt-5"><p className="text-[11px] font-semibold uppercase tracking-wide text-[#777]">Subjects</p>
                <div className="mt-2 flex flex-wrap gap-3">
                  <button type="button" onClick={() => setF((current) => ({ ...current, subject_mode: 'all' }))} disabled={!f.section} className={`rounded-lg border px-4 py-2.5 text-[13px] font-semibold ${f.subject_mode === 'all' ? 'border-[#C4141B] bg-red-50 text-[#C4141B]' : 'border-gray-200 bg-white text-[#666]'} disabled:opacity-50`}>All Subjects ({subjects.length})</button>
                  <button type="button" onClick={() => setF((current) => ({ ...current, subject_mode: 'single' }))} disabled={!f.section} className={`rounded-lg border px-4 py-2.5 text-[13px] font-semibold ${f.subject_mode === 'single' ? 'border-[#C4141B] bg-red-50 text-[#C4141B]' : 'border-gray-200 bg-white text-[#666]'} disabled:opacity-50`}>Single Subject</button>
                  {f.subject_mode === 'single' && <select className={`${control} max-w-xs`} value={f.subject} onChange={set('subject')}><option value="">Select subject</option>{subjects.map((subject) => <option key={subject} value={subject}>{subject}</option>)}</select>}
                </div>
                {f.section && !subjects.length && <p className="mt-3 text-[12px] text-red-600">No subjects are configured for this Class and Section. Add them in Academic Setup.</p>}
                {f.section && chosenSubjects.length > 0 && <p className="mt-3 text-[12px] text-[#6f7a8a]">This exam will cover: <strong>{chosenSubjects.join(', ')}</strong></p>}
              </div>
            </section>

            <section className="rounded-2xl border border-gray-100 bg-[#fafafa] p-6">
              <h3 className="mb-4 flex items-center gap-2 font-poppins text-[15px] font-bold text-[#1a1a1a]"><Clock className="h-4 w-4 text-[#C4141B]" /> 2. Date & Time</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2"><Field label="Exam Date"><input className={control} type="date" value={f.date} onChange={set('date')} /></Field><Field label="Hall / Room Number"><input className={control} placeholder="e.g., Room 101" value={f.room} onChange={set('room')} /></Field><Field label="Start Time"><input className={control} type="time" value={f.start_time} onChange={set('start_time')} /></Field><Field label="End Time"><input className={control} type="time" value={f.end_time} onChange={set('end_time')} /></Field></div>
            </section>

            <section className="rounded-2xl border border-gray-100 bg-[#fafafa] p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h3 className="flex items-center gap-2 font-poppins text-[15px] font-bold text-[#1a1a1a]"><ListChecks className="h-4 w-4 text-[#C4141B]" /> 3. Grading Parameters</h3><button type="button" onClick={addGrade} className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-3 py-2 text-[12px] font-semibold text-[#C4141B]"><Plus className="h-3.5 w-3.5" /> Add Grade Range</button></div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2"><Field label="Maximum Marks"><input className={control} type="number" min="1" value={f.max_marks} onChange={set('max_marks')} /></Field><Field label="Pass Marks"><input className={control} type="number" min="0" placeholder="School pass mark" value={f.passing_marks} onChange={set('passing_marks')} /></Field></div>
              <p className="mt-4 text-[12px] text-[#777]">Grade ranges are fully editable for this exam. Add only the grades your school uses, then set the mark range, grade point and Pass/Fail result.</p>
              {gradeScheme.length ? <><div className="mt-4 overflow-x-auto rounded-xl border border-gray-200 bg-white"><table className="w-full min-w-[680px] text-left"><thead className="bg-gray-50 text-[10px] uppercase tracking-wide text-[#888]"><tr><th className="px-3 py-3">Grade</th><th className="px-3 py-3">From %</th><th className="px-3 py-3">To %</th><th className="px-3 py-3">Grade Point</th><th className="px-3 py-3">Result</th><th className="px-3 py-3" /></tr></thead><tbody>{gradeScheme.map((item, index) => <tr key={index} className="border-t border-gray-100"><td className="p-2"><input className="h-9 w-full rounded border border-gray-200 px-2 text-[13px]" placeholder="A+" value={item.grade} onChange={(event) => changeGrade(index, 'grade', event.target.value)} /></td><td className="p-2"><input className="h-9 w-full rounded border border-gray-200 px-2 text-[13px]" type="number" min="0" max="100" placeholder="95" value={item.from} onChange={(event) => changeGrade(index, 'from', event.target.value)} /></td><td className="p-2"><input className="h-9 w-full rounded border border-gray-200 px-2 text-[13px]" type="number" min="0" max="100" placeholder="100" value={item.to} onChange={(event) => changeGrade(index, 'to', event.target.value)} /></td><td className="p-2"><input className="h-9 w-full rounded border border-gray-200 px-2 text-[13px]" type="number" min="0" step="0.1" placeholder="10" value={item.point} onChange={(event) => changeGrade(index, 'point', event.target.value)} /></td><td className="p-2"><select className="h-9 w-full rounded border border-gray-200 px-2 text-[13px]" value={item.result} onChange={(event) => changeGrade(index, 'result', event.target.value)}><option>Pass</option><option>Fail</option></select></td><td className="p-2 text-right"><button type="button" onClick={() => removeGrade(index)} className="rounded p-2 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button></td></tr>)}</tbody></table></div><button type="button" onClick={addGrade} className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[#C4141B] px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-[#a91116]"><Plus className="h-4 w-4" /> Add Another Grade</button></> : <div className="mt-4 rounded-xl border border-dashed border-gray-300 bg-white p-5 text-center text-[13px] text-[#888]">No grade ranges added yet. Click <strong>Add Grade Range</strong> to create your school’s grading scale.</div>}
            </section>
          </div>

          <aside className="space-y-4 self-start">
            <div className="rounded-2xl border border-gray-100 bg-[#fafafa] p-6"><h3 className="mb-4 font-poppins text-[15px] font-bold text-[#1a1a1a]">Quick Summary</h3><div className="space-y-3 text-[13px]"><div className="flex justify-between gap-3"><span className="text-[#888]">Academic Year</span><span className="font-semibold text-[#333]">{structure.academic_year || 'Not set'}</span></div><div className="flex justify-between gap-3"><span className="text-[#888]">Class / Section</span><span className="text-right font-semibold text-[#333]">{f.class_name && f.section ? `${f.class_name} · ${f.section}` : 'Not selected'}</span></div><div className="flex justify-between gap-3"><span className="text-[#888]">Subjects</span><span className="text-right font-semibold text-[#333]">{chosenSubjects.length || '—'}</span></div><div className="flex justify-between gap-3"><span className="text-[#888]">Pass Mark</span><span className="font-semibold text-[#333]">{f.passing_marks || 'Not set'}</span></div><div className="flex justify-between gap-3"><span className="text-[#888]">Grade Ranges</span><span className="font-semibold text-[#333]">{gradeScheme.length}</span></div></div></div>
            <button onClick={() => schedule('Scheduled')} disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#C4141B] py-3.5 text-[14px] font-medium text-white shadow-sm transition hover:bg-[#a91116] disabled:opacity-70">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} Schedule Exam</button>
            <button onClick={() => schedule('Draft')} disabled={saving} className="w-full py-1 text-center text-[13px] text-[#888] hover:text-[#555]">Save as Draft</button>
          </aside>
        </div>
      )}
    </Layout>
  );
};

export default CreateExam;
