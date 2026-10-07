import { createCampus } from './school';

const campus = createCampus();
const lists = new Map([
  ['students', campus.students],
  ['teachers', campus.teachers],
  ['staff', campus.staff],
  ['fees', campus.fees],
  ['fees/receipts', campus.receipts],
  ['fees/structures', [
    { id: 'FS-1', name: 'Term 2 tuition', category: 'Tuition', amount: 18500, description: 'Term 2 school tuition', start_date: '2026-08-01', due_date: '2026-10-10', targets: [{ class_name: 'Class 8', section: 'A' }, { class_name: 'Class 10', section: 'A' }] },
    { id: 'FS-2', name: 'Transport', category: 'Transport', amount: 6000, description: 'Campus bus fee', start_date: '2026-06-01', due_date: '2026-10-10', targets: [{ class_name: 'Class 6', section: 'A' }] },
  ]],
  ['exams', campus.exams],
  ['marks', campus.marks],
  ['attendance-records', campus.attendance],
  ['admission-leads', campus.leads],
  ['parent-center/transport/routes', campus.routes],
  ['parent-center/transport/trips', [{ id: 'TRP-1', route_id: 'RTE-1', route_name: 'Madhapur – Campus', status: 'Completed', trip_date: '2026-10-07', boarded: 28 }]],
  ['visitors', campus.visitors],
  ['teacher-allocations', campus.teachers.map((teacher, index) => ({ id: `ALC-${index + 1}`, teacher_id: teacher.id, teacher_name: teacher.name, subject: teacher.subject, class_name: index < 2 ? 'Class 8' : 'Class 10', section: 'A' }))],
  ['timetable-periods', [
    { id: 'TT-1', day: 'Monday', period: '1', start: '09:00', end: '09:40', class_name: 'Class 8', section: 'A', subject: 'Mathematics', teacher_name: 'Kavitha Menon' },
    { id: 'TT-2', day: 'Monday', period: '2', start: '09:40', end: '10:20', class_name: 'Class 8', section: 'A', subject: 'Science', teacher_name: 'Rahul Deshmukh' },
  ]],
  ['hr/salary-structures', [
    { id: 'PAY-1', name: 'Kavitha Menon', employee_name: 'Kavitha Menon', designation: 'Senior Teacher', department: 'Mathematics', gross: 62000, deductions: 4800, net: 57200, status: 'Processed' },
    { id: 'PAY-2', name: 'Rahul Deshmukh', employee_name: 'Rahul Deshmukh', designation: 'Teacher', department: 'Science', gross: 48000, deductions: 3600, net: 44400, status: 'Processed' },
    { id: 'PAY-3', name: 'Padma Joshi', employee_name: 'Padma Joshi', designation: 'Accountant', department: 'Accounts', gross: 42000, deductions: 2100, net: 39900, status: 'Ready' },
  ]],
  ['leaves', [{ id: 'LV-1', name: 'Nalini Iyer', role: 'Teacher', type: 'Casual', from: '2026-10-09', to: '2026-10-09', days: 1, status: 'Pending', reason: 'Family function' }]],
  ['notifications', [
    { id: 'NT-1', title: 'Term 1 hall tickets', message: 'Hall tickets for Class 10 are ready at the front office.', audience: 'Parents', status: 'Sent', recipients_count: 3, class_name: 'Class 10', section: 'A', channels: ['Parent App'], created: '2026-10-06T08:30:00.000Z' },
  ]],
  ['notifications/rules', [
    { id: 'NR-1', key: 'fee-reminder', event: 'Fee due in 3 days', description: 'Reminds guardians before the due date.', audience: 'Parents', channels: ['SMS', 'Parent App'], enabled: true },
  ]],
  ['inventory/items', [{ id: 'INV-1', item_name: 'A4 ream', category: 'Stationery', sku: 'STN-A4', quantity: 42, unit: 'ream', reorder_level: 12, unit_price: 280, stock_value: 11760, location: 'Central Store', supplier: 'Campus Stationery', stock_status: 'In Stock' }, { id: 'INV-2', item_name: 'Lab apron', category: 'Science', sku: 'SCI-APR', quantity: 8, unit: 'piece', reorder_level: 10, unit_price: 450, stock_value: 3600, location: 'Science Lab', supplier: 'Lab Supplies Co.', stock_status: 'Low Stock' }]],
  ['inventory/transactions', []],
  ['expenses', [{ id: 'EXP-1', paid_to: 'City Fuel Station', description: 'Bus diesel', category: 'Transport', amount: 8600, expense_date: '2026-10-03', status: 'Paid', payment_method: 'UPI', reference: 'INV-4412' }]],
  ['homework', [{ id: 'HW-1', title: 'Linear equations', subject: 'Mathematics', class_name: 'Class 8', section: 'A', due_date: '2026-10-10', teacher_name: 'Kavitha Menon', status: 'Assigned', instructions: 'Solve the textbook exercise.' }]],
  ['parent-center/hall-tickets', [{ id: 'HT-1', title: 'Term 1 Examination', class_name: 'Class 8', section: 'A', status: 'Published', venue: 'Hall A', papers: [{ subject: 'Mathematics' }, { subject: 'Science' }, { subject: 'English' }] }]],
  ['payments/razorpay', [
    { id: 'RZP-1', payment_id: 'pay_demo_1001', order_id: 'order_demo_1001', student_name: 'Aarav Reddy', fee_name: 'Term 2 tuition', amount: 18500, status: 'Verified', method: 'UPI' },
    { id: 'RZP-2', payment_id: 'pay_demo_1002', order_id: 'order_demo_1002', student_name: 'Saanvi Reddy', fee_name: 'Term 2 tuition', amount: 10000, status: 'Created', method: 'UPI' },
  ]],
  ['platform/schools', [{ id: 'SCH-1', name: 'Orison Main Campus', status: 'Active', plan: 'Campus' }]],
  ['platform/plans', [{ id: 'PLN-1', name: 'Campus', status: 'Active', price: 'Contact' }]],
  ['platform/subscriptions', [{ id: 'SUB-1', school: 'Orison Main Campus', plan: 'Campus', status: 'Active' }]],
  ['platform/billing', [{ id: 'BIL-1', school: 'Orison Main Campus', amount: 0, status: 'Current' }]],
  ['platform/users', [{ id: 'PU-1', name: 'Platform Administrator', role: 'platform_admin', status: 'Active' }]],
]);

const list = (key) => lists.get(key) || [];
const grade = (percent) => (percent >= 90 ? 'A+' : percent >= 75 ? 'A' : percent >= 60 ? 'B' : percent >= 40 ? 'C' : 'D');

const sessions = {
  admin: { name: 'Administrator', menu: null },
  principal: { name: 'Principal', menu: ['dashboard', 'management', 'student', 'academics', 'attendance', 'teachers', 'staff', 'exams', 'marks', 'homework', 'leave', 'timetable', 'notifications', 'transport', 'communications', 'visitor', 'question', 'collections', 'hall_tickets', 'settings'] },
  director: { name: 'Director', menu: ['dashboard', 'management', 'student', 'academics', 'attendance', 'teachers', 'staff', 'exams', 'marks', 'homework', 'leave', 'timetable', 'notifications', 'transport', 'communications', 'visitor', 'question', 'collections', 'hall_tickets', 'multibranch', 'settings'] },
  academic_coordinator: { name: 'Academic Coordinator', menu: ['dashboard', 'academics', 'teachers', 'notifications', 'hall_tickets'] },
  fee_manager: { name: 'Fee Manager', menu: ['dashboard', 'student', 'fee', 'expenses', 'notifications', 'communications', 'settings'] },
  platform_admin: { name: 'Platform Administrator', menu: ['platform_schools', 'platform_plans', 'platform_subscriptions', 'platform_billing', 'platform_users'] },
};

const dashboard = () => {
  const collected = list('fees/receipts').reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const pending = list('fees').reduce((sum, item) => sum + Number(item.due || 0), 0);
  const billed = collected + pending;
  const attendance = list('attendance-records');
  const present = attendance.filter((row) => row.status === 'Present' || row.status === 'Late').length;
  const absent = attendance.filter((row) => row.status === 'Absent').length;
  return {
    academic_year: '2026–27',
    stats: {
      students: list('students').length,
      teachers: list('teachers').length,
      staff: list('staff').length,
      classes: campus.classes.length,
      sections: campus.classes.reduce((sum, item) => sum + item.sections.length, 0),
      collection_efficiency: billed ? Math.round((collected / billed) * 100) : 0,
      collected,
      fees_collected: collected,
      fees_outstanding: pending,
      pending,
      total: billed,
      invoices: list('fees').length,
      attendance: attendance.length ? Math.round((present / attendance.length) * 100) : null,
      attendance_marked: attendance.length > 0,
      present_today: present,
      absent_today: absent,
      attendance_unmarked: Math.max(0, list('students').length - attendance.length),
    },
    priorities: list('fees').filter((item) => Number(item.due) > 0).map((item) => ({
      title: `${item.student_name} fee follow-up`,
      detail: `${item.fee_name} · ₹${Number(item.due).toLocaleString('en-IN')} due`,
      value: Number(item.due),
      level: Number(item.days_overdue) > 30 ? 'high' : 'medium',
      path: '/collections',
    })),
    attendance_trend: [{ day: 'Mon', rate: 94 }, { day: 'Tue', rate: 96 }, { day: 'Wed', rate: 91 }, { day: 'Thu', rate: 95 }, { day: 'Fri', rate: 88 }],
    academic_pulse: { upcoming_exams: list('exams').filter((item) => item.status === 'Scheduled').length, syllabus_behind: 1, open_interventions: 0, teacher_allocation_coverage: 75 },
    recent_activity: list('fees/receipts').map((item) => ({ id: item.id, title: `Fee received · ${item.student_name}`, body: `${item.method} · ₹${Number(item.amount).toLocaleString('en-IN')}`, type: 'success' })),
    monthly: [{ month: 'Aug', amount: 42000 }, { month: 'Sep', amount: collected }, { month: 'Oct', amount: 0 }],
    method_split: [{ name: 'UPI', value: 24500 }, { name: 'Cash', value: 10000 }],
    top_dues: list('fees').filter((item) => Number(item.due) > 0).map((item) => ({ name: item.student_name, due: Number(item.due) })),
    subject_scores: [{ subject: 'Mathematics', average: 76 }, { subject: 'Science', average: 77 }, { subject: 'English', average: 81 }],
    results_top: [],
  };
};

const results = (params = {}) => {
  const marks = list('marks');
  const groups = [...new Map(marks.map((mark) => [`${mark.class_name}|${mark.section}|${mark.exam_title}`, { class_name: mark.class_name, section: mark.section, exam_title: mark.exam_title }])).values()];
  if (!params.class_name || !params.section) return { available_groups: groups, selected: false, rows: [], subjects: [] };
  const selected = marks.filter((mark) => mark.class_name === params.class_name && mark.section === params.section && (!params.exam_title || mark.exam_title === params.exam_title));
  const subjects = [...new Set(selected.map((mark) => mark.subject))];
  const byStudent = new Map();
  selected.forEach((mark) => byStudent.set(mark.student_id, [...(byStudent.get(mark.student_id) || []), mark]));
  const rows = [...byStudent.entries()].map(([studentId, items]) => {
    const total = items.reduce((sum, item) => sum + Number(item.score || 0), 0);
    const totalMax = items.reduce((sum, item) => sum + Number(item.total_max || 0), 0);
    const percent = totalMax ? Math.round((total / totalMax) * 1000) / 10 : 0;
    return { student_id: studentId, name: items[0].name, roll: items[0].roll, total, total_max: totalMax, percent, grade: grade(percent), result: percent >= 40 ? 'Pass' : 'Needs support', subjects: items.map((item) => ({ subject: item.subject, score: item.score, percent: Math.round((Number(item.score) / Number(item.total_max || 1)) * 100) })) };
  }).sort((a, b) => b.percent - a.percent).map((row, index) => ({ ...row, rank: index + 1 }));
  return { available_groups: groups, selected: true, exam_title: params.exam_title || 'Term 1 Examination', class: params.class_name, subjects, rows, class_average: rows.length ? Math.round(rows.reduce((sum, row) => sum + row.percent, 0) / rows.length) : 0, pass_rate: rows.length ? 100 : 0, top_scorer: rows[0] || null };
};

const reportCard = (studentId) => {
  const person = list('students').find((item) => item.id === studentId) || { id: studentId };
  const marks = list('marks').filter((mark) => mark.student_id === studentId).map((mark) => {
    const percent = Math.round((Number(mark.score) / Number(mark.total_max || 1)) * 100);
    return { ...mark, percent, grade: grade(percent), result: percent >= 40 ? 'Pass' : 'Needs support' };
  });
  const average = marks.length ? Math.round(marks.reduce((sum, mark) => sum + mark.percent, 0) / marks.length) : 0;
  return { student: person, marks, exams: list('exams'), summary: { average_percent: average, attendance_percent: 88, result: 'Pass', class_rank: 1, class_size: 4 } };
};

const studentDetail = (id) => {
  const person = list('students').find((item) => item.id === id) || { id, name: 'Student' };
  const dues = list('fees').filter((fee) => fee.student_id === id && Number(fee.due) > 0);
  const due = dues.reduce((sum, fee) => sum + Number(fee.due || 0), 0);
  return {
    student: { ...person, className: `${person.class_name || ''} ${person.section || ''}`.trim(), balance: `₹${due.toLocaleString('en-IN')}` },
    fees: { due, fee_id: dues[0]?.id || null, pending: dues.map((fee) => ({ desc: fee.fee_name, sub: fee.class_name, due: '10 Oct 2026', amount: `₹${Number(fee.due).toLocaleString('en-IN')}`, status: 'PENDING', checked: false })) },
    attendance: { month: 'October 2026', stats: { rate: '88%', totalWorking: 18, totalPresent: 16, lateArrivals: 1, absentDays: 1 }, days: [{ day: null }, { day: null }, { day: null }, { day: null }, { day: 1, status: 'present' }, { day: 2, status: 'present' }, { day: 3, status: 'weekend' }, { day: 4, status: 'weekend' }, { day: 5, status: 'present' }, { day: 6, status: 'late' }, { day: 7, status: 'present' }], logs: [{ date: '07 Oct 2026', status: 'Present', in: '08:12', out: '15:40' }] },
  };
};

const objects = {
  '/academic-structure': () => ({ academic_year: '2026–27', classes: campus.classes }),
  '/analytics/dashboard': dashboard,
  '/analytics/fee': () => { const data = dashboard(); return { stats: data.stats, monthly: data.monthly, method_split: data.method_split, top_dues: data.top_dues }; },
  '/notifications/center': () => { const items = list('notifications'); return { items, history: items, approvals: [], summary: { total_sent: items.length, parent_sends: items.filter((item) => item.audience === 'Parents').length, teacher_sends: 0, pending_approvals: 0 } }; },
  '/hr/payroll-center': () => {
    const employees = list('hr/salary-structures').map((item) => ({
      ...item,
      attendance: item.attendance || { present: 20, absent: 0 },
      salary: item.salary || { gross: item.gross, basic: item.gross, deductions: item.deductions, net: item.net },
      payroll: item.status === 'Processed' ? { gross: item.gross, deductions: item.deductions, net: item.net, status: 'Processed' } : item.payroll || null,
    }));
    return { employees, summary: { employees: employees.length, salary_configured: employees.length, processed: employees.filter((item) => item.status === 'Processed').length, gross: 152000, deductions: 10500, net: 141500 } };
  },
  '/collections-intelligence': () => ({ buckets: [{ label: 'Current', amount: 8500 }, { label: '30-60', amount: 22000 }], fee_breakdown: [{ name: 'Tuition', amount: 30500 }], cases: list('fees').filter((item) => Number(item.due) > 0), today: { collected: 0 }, reconciliation: {}, outstanding: 30500 }),
  '/admissions-intelligence': () => ({ stages: ['Enquiry', 'Visit'], funnel: [{ stage: 'Enquiry', count: 1 }, { stage: 'Visit', count: 1 }], stale: [], lost_reasons: [], conversion: 0 }),
  '/academic-intelligence': () => ({ cases: [], summary: {}, actions: [], academic_health: { score: null, status: 'Stable', coverage: 0, indicators: [] }, at_risk_students: 0, syllabus_behind: 1, interventions_open: 0 }),
  '/branches/network': () => ({ summary: { branches: 1, students: list('students').length }, branches: [{ id: 'BR-HYD', name: 'Orison Main Campus', code: 'ORI-HYD', city: 'Hyderabad', academic_year: '2026–27', status: 'Active', students: list('students').length, people: 7, attendance_rate: 88, collection_efficiency: 79, setup_progress: 80, outstanding: 30500, pending_approvals: 1, setup_checks: [{ key: 'classes', label: 'Classes and sections', complete: true }], risks: [{ label: 'Class 10 fee follow-up', level: 'High' }], app_connections: [{ name: 'Parent app', purpose: 'Fees, attendance and notices' }] }] }),
  '/teaching/setup': () => ({ teachers: list('teachers'), allocations: list('teacher-allocations') }),
  '/parent-center/summary': () => ({ parents: list('students').length, pending_payments: 2, open_tickets: 0, queued_notifications: 0, published_notices: 1, active_trips: 1, published_hall_tickets: 0 }),
  '/settings': () => ({ settings: { schoolName: 'Orison Main Campus' }, toggles: {} }),
};

const pathOf = (url = '') => {
  const raw = String(url).split('?')[0];
  const withoutHost = raw.includes('://') ? raw.replace(/^https?:\/\/[^/]+/i, '') : raw;
  const clean = `/${withoutHost}`.replace(/\/+/g, '/').replace(/\/$/, '') || '/';
  return clean.startsWith('/api/') ? clean.slice(4) : clean;
};

const expectsObject = (path) => path === '/results'
  || path === '/search'
  || path === '/auth/login'
  || path === '/fees/summary'
  || path.startsWith('/report-card/')
  || path.endsWith('/detail')
  || Boolean(objects[path]);

export const demoCanAnswer = (url) => {
  const path = pathOf(url);
  if (!path || path.includes('template')) return false;
  return true;
};

export const isThinResponse = (url, data) => {
  if (data == null || typeof data !== 'object') return true;
  const path = pathOf(url);
  if (path === '/results') return Array.isArray(data) || !data.available_groups;
  if (path === '/analytics/dashboard' || path === '/analytics/fee') return !data?.stats?.students;
  if (path === '/academic-structure') return !data?.classes?.length;
  if (path === '/notifications/center') return !data?.history?.length && !data?.items?.length;
  if (path === '/hr/payroll-center') return !data?.employees?.length;
  if (path === '/branches/network') return !data?.branches?.length;
  if (path.startsWith('/report-card/')) return !data?.student?.name;
  if (path.endsWith('/detail')) return !data?.student && !data?.fees;
  if (Array.isArray(data)) return data.length === 0;
  return !expectsObject(path);
};

export const demoAnswer = (config = {}) => {
  const method = String(config.method || 'get').toUpperCase();
  const path = pathOf(config.url);
  const params = config.params || {};
  const body = config.data && typeof config.data === 'string' ? JSON.parse(config.data) : (config.data || {});

  if (path === '/auth/login') {
    const role = body.role || 'admin';
    const session = sessions[role] || sessions.admin;
    return { token: `ts-jwt.${role}.${Date.now()}`, role, name: session.name, menu: session.menu, schoolId: role === 'platform_admin' ? 'Orison Platform' : 'Orison Main Campus' };
  }
  if (path === '/search') {
    const needle = String(params.q || '').toLowerCase();
    const match = (row) => JSON.stringify(row).toLowerCase().includes(needle);
    return { students: list('students').filter(match), teachers: list('teachers').filter(match), classes: campus.classes.filter(match) };
  }
  if (objects[path] && method === 'GET') return objects[path]();
  if (path === '/results' && method === 'GET') return results(params);
  if (path.startsWith('/report-card/') && method === 'GET') return reportCard(path.split('/')[2]);
  if (path === '/attendance/roster' && method === 'GET') {
    const source = params.attendance_role === 'teacher' ? 'teachers' : params.attendance_role === 'staff' ? 'staff' : 'students';
    return list(source).filter((row) => !params.class_name || row.class_name === params.class_name).filter((row) => !params.section || row.section === params.section).map((row) => ({ id: row.id, name: row.name, admission_no: row.admission_no || '', status: 'Present' }));
  }
  if (path === '/attendance/records' && method === 'GET') return list('attendance-records');
  if (path === '/fees/summary' && method === 'GET') {
    const collected = list('fees/receipts').reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const pending = list('fees').reduce((sum, item) => sum + Number(item.due || 0), 0);
    return { collected, pending, total: collected + pending, invoices: list('fees').length };
  }

  const detail = path.match(/^\/([^/]+)\/([^/]+)\/detail$/);
  if (detail && method === 'GET') return detail[1] === 'students' ? studentDetail(detail[2]) : (list(detail[1]).find((row) => row.id === detail[2]) || { id: detail[2] });

  const parts = path.split('/').filter(Boolean);
  const key = lists.has(parts.slice(0, 2).join('/')) ? parts.slice(0, 2).join('/') : parts[0];
  const rest = path.slice(key.length + 1);
  const id = rest.split('/')[0];
  if (!id && method === 'GET') return list(key);
  if (!id && method === 'POST') {
    const row = { id: body.id || `NEW-${Date.now()}`, status: 'Active', ...body };
    lists.set(key, [...list(key), row]);
    return row;
  }
  if (id && method === 'PUT') {
    const rows = list(key).map((row) => (row.id === id || row.key === id ? { ...row, ...body } : row));
    lists.set(key, rows);
    return rows.find((row) => row.id === id || row.key === id) || { id, ...body };
  }
  if (id && method === 'DELETE') {
    lists.set(key, list(key).filter((row) => row.id !== id));
    return { ok: true };
  }
  if (id && method === 'GET') return list(key).find((row) => row.id === id) || {};
  if (method === 'POST') return { id: `NEW-${Date.now()}`, ...body, recipients_count: list('students').length };
  return method === 'GET' ? [] : { ok: true };
};
