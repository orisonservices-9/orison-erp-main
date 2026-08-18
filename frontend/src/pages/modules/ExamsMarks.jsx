import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { PageTitle, StatCards, Card, Btn, Badge, SearchBar, Table } from '../../components/Shared';
import { RESULTS } from '../../mock2';
import { GRADE_SHEET, STUDENT } from '../../mock';
import { FileText, CalendarClock, CheckCircle2, Plus, Download, Trophy, Award, Printer, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { filterRows, downloadCSV, printPage } from '../../utils';

export const ViewExam = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  useEffect(() => { api.get('/exams').then(({ data }) => { setExams(data); setLoading(false); }).catch(() => setLoading(false)); }, []);
  const cnt = (s) => exams.filter((e) => e.status === s).length;
  const classOptions = [...new Set(exams.map((exam) => exam.class_name).filter(Boolean))].sort();
  const sectionOptions = [...new Set(exams.filter((exam) => !selectedClass || exam.class_name === selectedClass).map((exam) => exam.section).filter(Boolean))].sort();
  const rows = filterRows(exams, q, ['title', 'class_name', 'subject', 'status']).filter((exam) => exam.status === 'Scheduled' && (!selectedClass || exam.class_name === selectedClass) && (!selectedSection || exam.section === selectedSection));
  const exportCSV = () => downloadCSV('exams.csv', ['Title', 'Class', 'Subject', 'Date', 'Room', 'Status'], rows.map((e) => [e.title, e.class_name, e.subject, e.date, e.room, e.status]));
  return (
    <Layout>
      <PageTitle title="View Exams" subtitle="All scheduled, draft and completed examinations."
        actions={<><Btn variant="outline" icon={Download} onClick={exportCSV}>Export</Btn><Btn icon={Plus} onClick={() => navigate('/exams/create')}>Create Exam</Btn></>} />
      <StatCards items={[
        { label: 'Total Exams', value: exams.length, icon: FileText },
        { label: 'Scheduled', value: cnt('Scheduled'), icon: CalendarClock, tint: 'bg-blue-50 text-blue-600' },
        { label: 'Completed', value: cnt('Completed'), icon: CheckCircle2, tint: 'bg-green-50 text-green-600' },
        { label: 'Drafts', value: cnt('Draft'), icon: FileText, tint: 'bg-amber-50 text-amber-600' },
      ]} />
      <Card title="Scheduled Exams" subtitle="Choose a Class and Section to narrow the list. Without filters, all scheduled exams are shown class-wise.">
        <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-3">
          <select value={selectedClass} onChange={(event) => { setSelectedClass(event.target.value); setSelectedSection(''); }} className="h-11 rounded-lg border border-gray-200 bg-white px-3 text-[13px] font-medium text-[#444] outline-none focus:border-[#C4141B]">
            <option value="">All Classes</option>{classOptions.map((className) => <option key={className} value={className}>{className}</option>)}
          </select>
          <select value={selectedSection} onChange={(event) => setSelectedSection(event.target.value)} className="h-11 rounded-lg border border-gray-200 bg-white px-3 text-[13px] font-medium text-[#444] outline-none focus:border-[#C4141B]">
            <option value="">All Sections</option>{sectionOptions.map((section) => <option key={section} value={section}>{section}</option>)}
          </select>
          <SearchBar placeholder="Search scheduled exams..." value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        {loading ? <div className="flex justify-center py-10 text-[#999]"><Loader2 className="w-6 h-6 animate-spin" /></div> : (
          <Table columns={[{label:'Exam Title'},{label:'Class'},{label:'Subject'},{label:'Date'},{label:'Room'},{label:'Status'}]}>
            {rows.map((e) => (
              <tr key={e.id} className="border-b border-gray-50 last:border-0 hover:bg-[#fafafa]">
                <td className="py-3 text-[13px] font-medium text-[#1a1a1a]">{e.title}</td>
                <td className="py-3 text-[13px] text-[#666]">{e.class_name}{e.section ? <span className="block text-[11px] text-[#999]">{e.section}</span> : null}</td>
                <td className="py-3 text-[13px] text-[#666]">{e.subject === 'All Subjects' ? (e.subjects || []).join(', ') || 'All Subjects' : e.subject}</td>
                <td className="py-3 text-[13px] text-[#666]">{e.date || '—'}</td>
                <td className="py-3 text-[13px] text-[#666]">{e.room || '—'}</td>
                <td className="py-3"><Badge color={e.status==='Completed'?'green':e.status==='Scheduled'?'blue':'amber'}>{e.status}</Badge></td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={6} className="py-10 text-center text-[13px] text-[#999]">No scheduled exams match this Class and Section.</td></tr>}
          </Table>
        )}
      </Card>
    </Layout>
  );
};

export const Results = () => {
  const [data, setData] = useState(null);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [loading, setLoading] = useState(true);
  const loadResults = (className = '', section = '') => {
    setLoading(true);
    api.get('/results', { params: className && section ? { class_name: className, section } : {} })
      .then(({ data: resultData }) => setData(resultData))
      .catch(() => setData({ available_groups: [], selected: false, rows: [] }))
      .finally(() => setLoading(false));
  };
  useEffect(() => { loadResults(); }, []);
  const rows = data?.rows || [];
  const classOptions = [...new Set((data?.available_groups || []).map((group) => group.class_name))].sort();
  const sectionOptions = [...new Set((data?.available_groups || []).filter((group) => group.class_name === selectedClass).map((group) => group.section))].sort();
  const chooseClass = (event) => { setSelectedClass(event.target.value); setSelectedSection(''); loadResults(); };
  const chooseSection = (event) => {
    const value = event.target.value;
    setSelectedSection(value);
    if (selectedClass && value) loadResults(selectedClass, value);
  };
  const topScorer = data?.top_scorer;
  return (
    <Layout>
      <PageTitle title="Results" subtitle={data?.selected ? `${data.exam_title} • ${data.class} • ${data.subject}` : 'Choose Class and Section to see its exam results.'}
        actions={<><Btn variant="outline" icon={Download} onClick={() => downloadCSV('results.csv', ['Rank', 'Roll', 'Student', 'Total', 'Percent', 'Grade'], rows.map((r) => [r.rank, r.roll, r.name, r.total, r.percent, r.grade]))}>Export</Btn><Btn icon={Trophy} onClick={printPage}>Publish Results</Btn></>} />
      <Card title="Select result group" subtitle="Results are available only for classes and sections where marks have been submitted.">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <select value={selectedClass} onChange={chooseClass} className="h-11 rounded-lg border border-gray-200 bg-white px-3 text-[13px] font-medium text-[#444] outline-none focus:border-[#C4141B]">
            <option value="">Select class</option>{classOptions.map((className) => <option key={className} value={className}>{className}</option>)}
          </select>
          <select value={selectedSection} onChange={chooseSection} disabled={!selectedClass} className="h-11 rounded-lg border border-gray-200 bg-white px-3 text-[13px] font-medium text-[#444] outline-none focus:border-[#C4141B] disabled:opacity-50">
            <option value="">Select section</option>{sectionOptions.map((section) => <option key={section} value={section}>{section}</option>)}
          </select>
        </div>
      </Card>
      {data?.selected && <>
        <StatCards items={[
          { label: 'Class Average', value: `${data.class_average}%`, icon: Award, tint: 'bg-green-50 text-green-600' },
          { label: 'Highest Scorer', value: topScorer?.name || '—', delta: topScorer ? `${topScorer.total}/${data.total_max} • ${topScorer.percent}%` : '', icon: Trophy, tint: 'bg-amber-50 text-amber-600' },
          { label: 'Pass Rate', value: `${data.pass_rate}%`, icon: CheckCircle2, tint: 'bg-blue-50 text-blue-600' },
          { label: 'Students', value: data.students, icon: FileText },
        ]} />
      <Card title="Student exam marks" subtitle={`${data.exam_title} • ${data.subject} • Total marks: ${data.total_max}`}>
        {loading ? <div className="flex justify-center py-10 text-[#999]"><Loader2 className="w-6 h-6 animate-spin" /></div> : (
          <Table columns={[{label:'Rank'},{label:'Roll No'},{label:'Student'},{label:'Exam Score'},{label:'Percentage'},{label:'Grade / Point'},{label:'Result'}]}>
            {rows.map((r) => (
              <tr key={r.roll} className="border-b border-gray-50 last:border-0 hover:bg-[#fafafa]">
                <td className="py-3"><Badge color={r.rank<=3?'amber':'gray'}>#{r.rank}</Badge></td>
                <td className="py-3 text-[13px] text-[#666]">{r.roll}</td>
                <td className="py-3 text-[13px] font-medium text-[#1a1a1a]">{r.name}</td>
                <td className="py-3 text-[13px] text-[#666]">{r.total} / {data.total_max}</td>
                <td className="py-3 text-[13px] font-semibold text-[#333]">{r.percent}%</td>
                <td className="py-3"><Badge color={r.result === 'Pass' ? 'green' : 'red'}>{r.grade} · {r.grade_point}</Badge></td>
                <td className="py-3"><Badge color={r.result === 'Pass' ? 'green' : 'red'}>{r.result}</Badge></td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={7} className="py-10 text-center text-[13px] text-[#999]">No marks have been submitted for this Class and Section yet.</td></tr>}
          </Table>
        )}
      </Card>
      </>}
      {!loading && !data?.selected && <div className="mt-5 rounded-2xl border border-dashed border-gray-200 bg-white py-10 text-center text-[13px] text-[#999]">Select a Class and Section to view its result summary and student marks.</div>}
    </Layout>
  );
};

export const ReportCard = () => {
  const [groups, setGroups] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingCard, setLoadingCard] = useState(false);
  useEffect(() => {
    Promise.all([api.get('/results'), api.get('/students')])
      .then(([resultResponse, studentResponse]) => { setGroups(resultResponse.data?.available_groups || []); setStudents(studentResponse.data || []); })
      .finally(() => setLoading(false));
  }, []);
  const classOptions = [...new Set(groups.map((group) => group.class_name))].sort();
  const sectionOptions = [...new Set(groups.filter((group) => group.class_name === selectedClass).map((group) => group.section))].sort();
  const filteredStudents = students.filter((student) => student.class_name === selectedClass && student.section === selectedSection && student.status !== 'Inactive').sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  const chooseClass = (event) => { setSelectedClass(event.target.value); setSelectedSection(''); setSelectedStudent(''); setData(null); };
  const chooseSection = (event) => { setSelectedSection(event.target.value); setSelectedStudent(''); setData(null); };
  const chooseStudent = async (event) => {
    const studentId = event.target.value;
    setSelectedStudent(studentId); setData(null);
    if (!studentId) return;
    setLoadingCard(true);
    try { const response = await api.get(`/report-card/${studentId}`); setData(response.data); }
    finally { setLoadingCard(false); }
  };
  const student = data?.student;
  const marks = data?.marks || [];
  const summary = data?.summary;
  return (
    <Layout>
      <PageTitle title="Report Card" subtitle="Select Class, Section and Student to generate a report card from submitted exam marks."
        actions={<><Btn variant="outline" icon={Printer} onClick={printPage}>Print</Btn><Btn icon={Download} onClick={printPage}>Download PDF</Btn></>} />
      <Card title="Select student" subtitle="Only students from Class and Section with submitted marks are available.">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <select value={selectedClass} onChange={chooseClass} disabled={loading} className="h-11 rounded-lg border border-gray-200 bg-white px-3 text-[13px] font-medium text-[#444] outline-none focus:border-[#C4141B] disabled:opacity-50"><option value="">Select class</option>{classOptions.map((className) => <option key={className} value={className}>{className}</option>)}</select>
          <select value={selectedSection} onChange={chooseSection} disabled={!selectedClass} className="h-11 rounded-lg border border-gray-200 bg-white px-3 text-[13px] font-medium text-[#444] outline-none focus:border-[#C4141B] disabled:opacity-50"><option value="">Select section</option>{sectionOptions.map((section) => <option key={section} value={section}>{section}</option>)}</select>
          <select value={selectedStudent} onChange={chooseStudent} disabled={!selectedSection} className="h-11 rounded-lg border border-gray-200 bg-white px-3 text-[13px] font-medium text-[#444] outline-none focus:border-[#C4141B] disabled:opacity-50"><option value="">Select student</option>{filteredStudents.map((item) => <option key={item.id} value={item.id}>{item.name} {item.roll ? `• Roll ${item.roll}` : ''}</option>)}</select>
        </div>
      </Card>
      {loadingCard && <div className="flex justify-center py-12 text-[#999]"><Loader2 className="h-7 w-7 animate-spin" /></div>}
      {data && !loadingCard && <>
        <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"><p className="text-[10px] font-medium uppercase tracking-wide text-[#999]">Overall average</p><p className="mt-3 font-poppins text-[28px] font-bold text-[#1a1a1a]">{summary.average_percent}%</p></div>
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"><p className="text-[10px] font-medium uppercase tracking-wide text-[#999]">Assessments</p><p className="mt-3 font-poppins text-[28px] font-bold text-[#1a1a1a]">{summary.assessments}</p></div>
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"><p className="text-[10px] font-medium uppercase tracking-wide text-[#999]">Attendance</p><p className="mt-3 font-poppins text-[28px] font-bold text-[#1a1a1a]">{summary.attendance_percent === null ? '—' : `${summary.attendance_percent}%`}</p></div>
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"><p className="text-[10px] font-medium uppercase tracking-wide text-[#999]">Class rank</p><p className="mt-3 font-poppins text-[28px] font-bold text-[#1a1a1a]">{summary.class_rank ? `${summary.class_rank} / ${summary.class_size}` : '—'}</p></div>
        </div>
      <Card className="max-w-4xl mx-auto">
        <div className="mb-5 flex items-center justify-between border-b border-gray-100 pb-5">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 font-poppins text-[21px] font-bold text-[#C4141B]">{student.name?.slice(0, 1)}</div>
            <div><h3 className="font-poppins text-[18px] font-bold text-[#1a1a1a]">{student.name}</h3><p className="text-[12px] text-[#888]">Admission No: {student.admission_no || student.id} • {student.class_name} — {student.section} • Roll {student.roll}</p></div>
          </div>
          <div className="text-right"><p className="orison-logo text-[20px]">orison</p><p className="text-[11px] text-[#888]">Academic Report Card</p><Badge color={summary.result === 'Pass' ? 'green' : 'amber'}>{summary.result}</Badge></div>
        </div>
        <Table columns={[{label:'Exam'},{label:'Subject'},{label:'Score'},{label:'Percentage'},{label:'Grade / Point'},{label:'Result'}]}>
          {marks.map((item, index) => (
            <tr key={`${item.assessment}-${item.subject}-${index}`} className="border-b border-gray-50 last:border-0">
              <td className="py-3 text-[13px] font-medium text-[#333]">{item.assessment}</td>
              <td className="py-3 text-[13px] text-[#666]">{item.subject}</td>
              <td className="py-3 text-[13px] font-bold text-[#1a1a1a]">{item.score} / {item.total_max}</td>
              <td className="py-3 text-[13px] font-semibold text-[#333]">{item.percent}%</td>
              <td className="py-3"><Badge color={item.result === 'Pass' ? 'green' : 'red'}>{item.grade} · {item.grade_point}</Badge></td>
              <td className="py-3"><Badge color={item.result === 'Pass' ? 'green' : 'red'}>{item.result}</Badge></td>
            </tr>
          ))}
          {marks.length === 0 && <tr><td colSpan={6} className="py-10 text-center text-[13px] text-[#999]">No exam marks have been submitted for this student yet.</td></tr>}
        </Table>
      </Card>
      </>}
      {!loading && !selectedStudent && <div className="mt-5 rounded-2xl border border-dashed border-gray-200 bg-white py-10 text-center text-[13px] text-[#999]">Select Class, Section and Student to generate the report card.</div>}
    </Layout>
  );
};
