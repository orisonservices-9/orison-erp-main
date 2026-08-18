import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { Download, Users, ClipboardList, Loader2, CheckCircle2 } from 'lucide-react';
import api from '../api';
import { downloadCSV } from '../utils';

const selectStyle = 'h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-[13px] text-[#333] outline-none focus:border-[#C4141B] focus:ring-2 focus:ring-red-100 disabled:cursor-not-allowed disabled:opacity-60';

const AttendanceBadge = ({ status }) => {
  const display = status || 'Not marked';
  const color = display === 'Present' ? 'bg-green-50 text-green-700'
    : display === 'Absent' ? 'bg-red-50 text-red-700'
      : display === 'Late' ? 'bg-amber-50 text-amber-700'
        : 'bg-gray-100 text-gray-500';
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${color}`}>{display}</span>;
};

const AddMarks = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exams, setExams] = useState([]);
  const [students, setStudents] = useState([]);
  const [rows, setRows] = useState([]);
  const [notice, setNotice] = useState('');
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [meta, setMeta] = useState({ exam_id: '', class_name: '', section: '', exam_title: '', subject: '' });

  useEffect(() => {
    Promise.all([api.get('/exams'), api.get('/students')])
      .then(([examResponse, studentResponse]) => { setExams(examResponse.data || []); setStudents(studentResponse.data || []); })
      .catch(() => setNotice('Could not load scheduled exams or student records. Please restart the backend and try again.'))
      .finally(() => setLoading(false));
  }, []);

  const scheduledExams = useMemo(() => exams.filter((exam) => exam.status === 'Scheduled'), [exams]);
  const classOptions = useMemo(() => [...new Set(scheduledExams.map((exam) => exam.class_name).filter(Boolean))].sort(), [scheduledExams]);
  const sectionOptions = useMemo(() => [...new Set(scheduledExams.filter((exam) => exam.class_name === selectedClass).map((exam) => exam.section).filter(Boolean))].sort(), [scheduledExams, selectedClass]);
  const matchingExams = useMemo(() => scheduledExams.filter((exam) => exam.class_name === selectedClass && exam.section === selectedSection), [scheduledExams, selectedClass, selectedSection]);
  const selectedExam = useMemo(() => scheduledExams.find((exam) => exam.id === meta.exam_id), [scheduledExams, meta.exam_id]);
  const subjects = selectedExam ? (selectedExam.subjects?.length ? selectedExam.subjects : [selectedExam.subject]).filter((subject) => subject && subject !== 'All Subjects') : [];
  const maxMarks = Number(selectedExam?.max_marks || 100);
  const passMarks = Number(selectedExam?.passing_marks || 0);
  const performanceFor = (score) => {
    const total = Number(score || 0);
    const percent = maxMarks ? (total / maxMarks) * 100 : 0;
    const scheme = selectedExam?.grade_scheme || [];
    const match = scheme.find((item) => Number(item.from) <= percent && percent <= Number(item.to));
    const result = match?.result || (total >= passMarks ? 'Pass' : 'Fail');
    return { total, percent: Math.min(100, percent), grade: match?.grade || '—', point: match?.point ?? '—', result };
  };
  const enteredCount = rows.filter((row) => row.written !== '').length;

  const chooseClass = (event) => {
    setSelectedClass(event.target.value); setSelectedSection(''); setMeta({ exam_id: '', class_name: '', section: '', exam_title: '', subject: '' }); setRows([]); setNotice('');
  };
  const chooseSection = (event) => {
    setSelectedSection(event.target.value); setMeta({ exam_id: '', class_name: '', section: '', exam_title: '', subject: '' }); setRows([]); setNotice('');
  };
  const chooseExam = (event) => {
    const exam = matchingExams.find((item) => item.id === event.target.value);
    setMeta({ exam_id: exam?.id || '', exam_title: exam?.title || '', class_name: exam?.class_name || '', section: exam?.section || '', subject: '' });
    setRows([]); setNotice('');
  };
  const loadList = async () => {
    if (!selectedExam || !meta.subject) { setNotice('Select a scheduled exam and one subject before loading the student list.'); return; }
    const matchingStudents = students.filter((student) => student.class_name === selectedExam.class_name && student.section === selectedExam.section && student.status !== 'Inactive');
    setLoadingRoster(true);
    try {
      const response = await api.get('/attendance/records', { params: { attendance_role: 'student', class_name: selectedExam.class_name, section: selectedExam.section } });
      const latestAttendance = {};
      (response.data || []).forEach((record) => {
        if (record.entity_id && latestAttendance[record.entity_id] === undefined) latestAttendance[record.entity_id] = record.status;
      });
      setRows(matchingStudents.map((student) => ({ student_id: student.id, roll: student.roll || student.admission_no || student.id, name: student.name, attendance: latestAttendance[student.id] || 'Not marked', written: '' })));
      setNotice(matchingStudents.length ? '' : `No active students are available in ${selectedExam.class_name} — ${selectedExam.section}.`);
    } catch {
      setRows(matchingStudents.map((student) => ({ student_id: student.id, roll: student.roll || student.admission_no || student.id, name: student.name, attendance: 'Not marked', written: '' })));
      setNotice('Students were loaded, but their attendance could not be read. Save attendance in Attendance Management and try again.');
    } finally {
      setLoadingRoster(false);
    }
  };
  const setRow = (index, key, value) => setRows((current) => current.map((row, rowIndex) => rowIndex === index ? { ...row, [key]: value } : row));
  const exportList = () => downloadCSV('marks-entry-list.csv', ['Roll / Admission No', 'Student', 'Class', 'Section', 'Subject'], rows.map((row) => [row.roll, row.name, meta.class_name, meta.section, meta.subject]));

  const submit = async () => {
    if (!selectedExam || !meta.subject || !rows.length) { setNotice('Load a real class list before submitting marks.'); return; }
    setSaving(true);
    try {
      await api.post('/marks', {
        exam_id: selectedExam.id, exam_title: selectedExam.title, class_name: selectedExam.class_name, section: selectedExam.section, subject: meta.subject,
        max_written: maxMarks, max_practical: 0, passing_marks: passMarks, grade_scheme: selectedExam.grade_scheme || [],
        rows: rows.map((row) => ({ student_id: row.student_id, roll: row.roll, name: row.name, attendance: row.attendance, written: Number(row.written || 0), practical: 0 })),
      });
      navigate('/marks/results');
    } catch (error) {
      setNotice(error?.response?.data?.detail || 'Could not submit marks. Please try again.');
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="mb-2 text-[12px] text-[#a0a0a0]">EXAMS / <span className="font-medium text-[#C4141B]">MARKS MANAGEMENT</span></div>
      <div className="mb-5 flex items-start justify-between"><div><h2 className="font-poppins text-[19px] font-bold text-[#1a1a1a]">Add Examination Marks</h2><p className="text-[13px] text-[#8a8a8a]">Select Class and Section first. The system then shows only the scheduled exams for that group.</p></div>{rows.length > 0 && <button onClick={exportList} className="flex items-center gap-2 rounded-lg border border-gray-200 px-3.5 py-2 text-[12px] text-[#555] hover:bg-gray-50"><Download className="h-3.5 w-3.5" /> Export List</button>}</div>

      {notice && <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-800">{notice}</div>}
      {loading ? <div className="flex justify-center py-20 text-[#888]"><Loader2 className="h-7 w-7 animate-spin" /></div> : !scheduledExams.length ? <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-[14px] text-amber-800">There are no scheduled exams yet. Create and schedule an exam first, then return here to enter marks.</div> : <>
        <div className="mb-5 rounded-2xl border border-gray-100 bg-[#fafafa] p-5">
          <h3 className="mb-4 font-poppins text-[15px] font-bold text-[#1a1a1a]">1. Select Class, Section and Exam</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
            <label className="text-[10px] uppercase tracking-wide text-[#888]">Class<select className={`${selectStyle} mt-1.5`} value={selectedClass} onChange={chooseClass}><option value="">Select class</option>{classOptions.map((className) => <option key={className} value={className}>{className}</option>)}</select></label>
            <label className="text-[10px] uppercase tracking-wide text-[#888]">Section<select className={`${selectStyle} mt-1.5`} value={selectedSection} onChange={chooseSection} disabled={!selectedClass}><option value="">Select section</option>{sectionOptions.map((section) => <option key={section} value={section}>{section}</option>)}</select></label>
            <label className="text-[10px] uppercase tracking-wide text-[#888]">Scheduled exam<select className={`${selectStyle} mt-1.5`} value={meta.exam_id} onChange={chooseExam} disabled={!selectedSection || !matchingExams.length}><option value="">Select exam</option>{matchingExams.map((exam) => <option key={exam.id} value={exam.id}>{exam.title}</option>)}</select></label>
            <label className="text-[10px] uppercase tracking-wide text-[#888]">Subject<select className={`${selectStyle} mt-1.5`} value={meta.subject} onChange={(event) => { setMeta((current) => ({ ...current, subject: event.target.value })); setRows([]); }} disabled={!selectedExam}><option value="">Select subject</option>{subjects.map((subject) => <option key={subject} value={subject}>{subject}</option>)}</select></label>
            <div className="flex items-end"><button onClick={loadList} disabled={loadingRoster} className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#1a1a1a] text-[12px] font-semibold text-white hover:bg-black disabled:opacity-70">{loadingRoster && <Loader2 className="h-4 w-4 animate-spin" />}{loadingRoster ? 'LOADING' : 'LOAD STUDENTS'}</button></div>
          </div>
          {selectedClass && selectedSection && !matchingExams.length && <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-[13px] text-amber-800">Exams are not updated for <strong>{selectedClass} — {selectedSection}</strong>. Create and schedule an exam for this Class and Section first.</p>}
        </div>

        {selectedExam && <div className="mb-5 flex flex-wrap items-center gap-8 px-1"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50"><Users className="h-4 w-4 text-blue-500" /></span><div><p className="text-[10px] uppercase text-[#a0a0a0]">Students Loaded</p><p className="text-[15px] font-bold text-[#1a1a1a]">{rows.length}</p></div></div><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50"><ClipboardList className="h-4 w-4 text-[#C4141B]" /></span><div><p className="text-[10px] uppercase text-[#a0a0a0]">Marks Entered</p><p className="text-[15px] font-bold text-[#1a1a1a]">{enteredCount} / {rows.length}</p></div></div><div className="text-[12px] text-[#777]">Total marks: <strong>{maxMarks}</strong> · Pass marks: <strong>{passMarks || 'Not set'}</strong> · Attendance below is automatically read from Attendance Management.</div></div>}

        <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="min-w-[940px]">
            <div className="grid grid-cols-[115px_1fr_120px_130px_100px_80px_105px_80px] gap-2 bg-[#f7f7f8] px-6 py-3 text-[10px] font-medium uppercase tracking-wide text-[#a0a0a0]"><span>Roll No</span><span>Student Name</span><span>Attendance</span><span>Score / {maxMarks}</span><span>Total / {maxMarks}</span><span>%</span><span>Grade / Point</span><span>Result</span></div>
            {rows.map((row, index) => {
              const performance = performanceFor(row.written);
              return <div key={row.student_id} className="grid grid-cols-[115px_1fr_120px_130px_100px_80px_105px_80px] items-center gap-2 border-b border-gray-50 px-6 py-3.5 last:border-0"><span className="text-[13px] text-[#666]">{row.roll}</span><span className="text-[13px] font-medium text-[#333]">{row.name}</span><AttendanceBadge status={row.attendance} /><input value={row.written} onChange={(event) => setRow(index, 'written', event.target.value)} type="number" min="0" max={maxMarks} placeholder="Score" className="h-9 w-24 rounded-lg border border-gray-200 bg-[#f6f6f7] px-2 text-center text-[13px] outline-none focus:ring-2 focus:ring-red-100" /><span className="text-[13px] font-bold text-[#1a1a1a]">{performance.total}</span><span className="text-[13px] font-semibold text-[#333]">{performance.percent.toFixed(1)}%</span><span className="text-[12px] font-bold text-[#333]">{performance.grade} · {performance.point}</span><span className={`text-[11px] font-bold ${performance.result === 'Fail' ? 'text-red-600' : 'text-green-600'}`}>{performance.result}</span></div>;
            })}
          </div>
          {!rows.length && <div className="py-12 text-center text-[13px] text-[#999]">Select Class and Section, then choose the scheduled exam and subject to load students.</div>}
        </div>

        {rows.length > 0 && <div className="mt-6 flex items-center justify-center gap-4"><button onClick={submit} disabled={saving} className="flex h-11 items-center gap-2 rounded-lg bg-[#C4141B] px-6 text-[12px] font-semibold text-white shadow-sm hover:bg-[#a91116] disabled:opacity-70">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} SUBMIT & FINALIZE</button></div>}
      </>}
    </Layout>
  );
};

export default AddMarks;
