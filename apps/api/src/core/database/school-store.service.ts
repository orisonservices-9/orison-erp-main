import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { apiConfig } from '@orison/config';
import { seedSchool } from './demo-school';

type Row = Record<string, any>;

const MULTI = [
  'fees/structures',
  'fees/receipts',
  'payments/razorpay',
  'parent-center/hall-tickets',
  'parent-center/homework-completions',
  'parent-center/payment-proofs',
  'parent-center/help-requests',
  'parent-center/notices',
  'parent-center/transport/routes',
  'parent-center/transport/trips',
  'notifications/rules',
  'hr/salary-structures',
  'curriculum-units',
  'classroom-observations',
  'teacher-allocations',
  'timetable-periods',
].sort((a, b) => b.length - a.length);

@Injectable()
export class SchoolStore {
  private readonly lists = new Map<string, Row[]>();
  private readonly objects = new Map<string, Row | null>();

  constructor() {
    seedSchool(this.lists, this.objects);
  }

  handle(method: string, originalUrl: string, body: any, query: Record<string, any>) {
    const relative = originalUrl.split('?')[0].replace(/\/$/, '').replace(/^\/api\/?/, '');
    const verb = method.toUpperCase();

    if (relative === 'analytics/dashboard') return this.dashboard();
    if (relative === 'search') return this.search(String(query.q || ''));
    if (relative === 'teachers/bulk' && verb === 'POST') return { inserted: 0, errors: [] };
    if (relative === 'academic-intelligence/run' && verb === 'POST') return { created: 0, existing: 0 };
    if (relative === 'hr/payroll/run' && verb === 'POST') return { processed: this.list('staff').length };
    if (relative === 'fees/summary') return this.feeSummary();
    if (relative === 'branches/network') return this.objects.get(relative) || { summary: {}, branches: [] };
    if (relative === 'branches' && verb === 'POST') return this.createBranch(body);
    if (relative === 'attendance/roster') return this.roster(query);
    if (relative === 'attendance/records') return this.attendanceRecords(query);
    if (relative === 'attendance/mark' && verb === 'POST') return this.markAttendance(body);
    if (relative === 'academic-year-change-request' && verb === 'GET') return this.objects.get(relative) ?? null;
    if (relative.startsWith('academic-year-change-request')) return this.yearChange(verb, relative, body);
    if (relative === 'results') return this.results(query);
    if (relative.startsWith('report-card/')) return this.reportCard(relative.split('/')[1]);
    if (this.isObject(relative)) return this.objectPath(verb, relative, body);

    return this.collectionPath(verb, relative, body, query);
  }

  private dashboard() {
    const structure = (this.objects.get('academic-structure') || {}) as Row;
    const classes = Array.isArray(structure.classes) ? structure.classes : [];
    const sections = classes.reduce((total: number, item: Row) => total + (item.sections?.length || 0), 0);
    const receipts = this.list('fees/receipts');
    const invoices = this.list('fees');
    const collected = receipts.reduce((total, item) => total + Number(item.amount || 0), 0);
    const pending = invoices.reduce((total, item) => total + Number(item.due || 0), 0);
    const billed = collected + pending;
    const attendanceRows = this.list('attendance-records').filter((row) => row.attendance_role === 'student');
    const present = attendanceRows.filter((row) => row.status === 'Present' || row.status === 'Late').length;
    const absent = attendanceRows.filter((row) => row.status === 'Absent').length;
    const marked = attendanceRows.length;
    const students = this.list('students');
    const attendance = marked ? Math.round((present / marked) * 100) : null;
    return {
      academic_year: structure.academic_year || apiConfig.academicYear,
      stats: {
        students: students.length,
        teachers: this.list('teachers').length,
        staff: this.list('staff').length,
        classes: classes.length,
        sections,
        collection_efficiency: billed ? Math.round((collected / billed) * 100) : 0,
        collected,
        fees_collected: collected,
        fees_outstanding: pending,
        pending,
        total: billed,
        invoices: invoices.length,
        pass_rate: 0,
        avg: 0,
        attendance,
        attendance_marked: marked > 0,
        present_today: present,
        absent_today: absent,
        attendance_unmarked: Math.max(0, students.length - marked),
      },
      priorities: invoices.filter((item) => Number(item.due) > 0).slice(0, 4).map((item) => ({
        title: `${item.student_name} fee follow-up`,
        detail: `${item.fee_name} · ₹${Number(item.due).toLocaleString('en-IN')} due`,
        value: Number(item.due),
        level: Number(item.days_overdue) > 30 ? 'high' : 'medium',
        path: '/collections',
      })),
      attendance_trend: [
        { day: 'Mon', rate: 94 }, { day: 'Tue', rate: 96 }, { day: 'Wed', rate: 91 },
        { day: 'Thu', rate: 95 }, { day: 'Fri', rate: attendance },
      ],
      academic_pulse: { upcoming_exams: this.list('exams').filter((item) => item.status === 'Scheduled').length, syllabus_behind: 1, open_interventions: 0, teacher_allocation_coverage: 75 },
      recent_activity: receipts.slice(0, 4).map((item) => ({ id: item.id, title: `Fee received · ${item.student_name}`, body: `${item.method} · ₹${Number(item.amount).toLocaleString('en-IN')}`, type: 'success' })),
      monthly: [{ month: 'Aug', amount: 42000 }, { month: 'Sep', amount: collected }, { month: 'Oct', amount: 0 }],
      method_split: [{ name: 'UPI', value: 24500 }, { name: 'Cash', value: 10000 }],
      top_dues: invoices.filter((item) => Number(item.due) > 0).map((item) => ({ name: item.student_name, due: Number(item.due) })),
      subject_scores: [{ subject: 'Mathematics', average: 78 }, { subject: 'Science', average: 74 }, { subject: 'English', average: 81 }],
      results_top: [],
    };
  }

  private isObject(relative: string) {
    return [
      'academic-structure',
      'teaching/setup',
      'notifications/center',
      'hr/payroll-center',
      'academic-intelligence',
      'student-health-dashboard',
      'admissions-intelligence',
      'collections-intelligence',
      'parent-center/summary',
      'settings',
    ].includes(relative);
  }

  private objectDefault(relative: string): Row {
    if (relative === 'academic-structure') return { academic_year: apiConfig.academicYear, classes: [] };
    if (relative === 'settings') {
      return {
        settings: { schoolName: 'Orison Main Campus', campus: 'Hyderabad', academicYear: apiConfig.academicYear, board: 'CBSE' },
        toggles: { parentApp: true, teacherApp: true, email: true, sms: true },
      };
    }
    if (relative === 'teaching/setup') return { teachers: this.list('teachers'), allocations: this.list('teacher-allocations') };
    if (relative === 'hr/payroll-center') {
      const employees: Row[] = this.list('hr/salary-structures').map((item): Row => ({
        ...item,
        attendance: item.attendance || { present: 20, absent: 0 },
        salary: item.salary || (item.gross ? { gross: item.gross, basic: item.gross, hra: 0, allowances: 0, deductions: item.deductions, net: item.net } : null),
        payroll: item.payroll || (item.status === 'Processed' ? { gross: item.gross, deductions: item.deductions, net: item.net, status: 'Processed' } : null),
      }));
      return {
        employees,
        summary: {
          employees: employees.length,
          salary_configured: employees.filter((item) => Number(item.gross) > 0).length,
          processed: employees.filter((item) => item.status === 'Processed').length,
          gross: employees.reduce((total, item) => total + Number(item.gross || 0), 0),
          deductions: employees.reduce((total, item) => total + Number(item.deductions || 0), 0),
          net: employees.reduce((total, item) => total + Number(item.net || 0), 0),
        },
      };
    }
    if (relative === 'notifications/center') {
      const items = this.list('notifications');
      return {
        items,
        broadcasts: [],
        history: items,
        approvals: [],
        summary: { total_sent: items.length, parent_sends: 0, teacher_sends: 0, pending_approvals: 0 },
      };
    }
    if (relative === 'academic-intelligence') {
      const cases = this.list('interventions');
      return {
        cases,
        summary: {},
        actions: [],
        academic_health: { score: null, status: 'Awaiting data', coverage: 0, indicators: [] },
        at_risk_students: 0,
        syllabus_behind: 0,
        interventions_open: cases.filter((item) => item.status !== 'Completed').length,
      };
    }
    if (relative === 'student-health-dashboard') return { students: [], subject_scores: [] };
    if (relative === 'admissions-intelligence') {
      const leads = this.list('admission-leads');
      const stageNames = ['Enquiry', 'Contacted', 'Visit', 'Application', 'Selected', 'Admitted', 'Lost'];
      const funnel = stageNames.map((stage) => ({
        stage,
        count: leads.filter((lead) => (lead.stage || 'Enquiry') === stage).length,
      }));
      const admitted = funnel.find((item) => item.stage === 'Admitted')?.count || 0;
      return {
        stages: stageNames,
        funnel,
        stale: [],
        lost_reasons: [],
        conversion: leads.length ? Math.round((admitted / leads.length) * 100) : 0,
      };
    }
    if (relative === 'collections-intelligence') {
      const invoices = this.list('fees');
      const outstanding = invoices.reduce((total, item) => total + Number(item.due || 0), 0);
      return {
        buckets: [
          { label: 'Current', amount: invoices.filter((item) => Number(item.days_overdue) < 30).reduce((total, item) => total + Number(item.due || 0), 0) },
          { label: '30-60', amount: invoices.filter((item) => Number(item.days_overdue) >= 30).reduce((total, item) => total + Number(item.due || 0), 0) },
        ],
        fee_breakdown: [{ name: 'Tuition', amount: outstanding }],
        cases: invoices.filter((item) => Number(item.due) > 0),
        today: { collected: 0 },
        reconciliation: {},
        outstanding,
      };
    }
    if (relative === 'parent-center/summary') {
      return {
        parents: this.list('students').length,
        pending_payments: this.list('fees').filter((item) => Number(item.due) > 0).length,
        open_tickets: this.list('parent-center/help-requests').length,
        queued_notifications: 0,
        published_notices: this.list('parent-center/notices').length,
        active_trips: this.list('parent-center/transport/trips').length,
        published_hall_tickets: this.list('parent-center/hall-tickets').filter((item) => item.status === 'Published').length,
      };
    }
    return {};
  }

  private objectPath(verb: string, relative: string, body: any) {
    if (verb === 'PUT' || verb === 'POST') {
      const next = { ...this.objectDefault(relative), ...(this.objects.get(relative) || {}), ...(body || {}) };
      this.objects.set(relative, next);
      return next;
    }
    const stored = this.objects.get(relative) || this.objectDefault(relative);
    if (relative !== 'academic-structure' || !stored || typeof stored !== 'object') return stored;
    const structure = stored as Row;
    return {
      ...structure,
      classes: (structure.classes || []).map((item: Row) => ({
        ...item,
        sections: (item.sections || []).map((section: Row) => ({ ...section, subjects: section.subjects || [] })),
      })),
    };
  }

  private yearChange(verb: string, relative: string, body: any) {
    if (verb === 'POST' && relative === 'academic-year-change-request') {
      const request = { id: randomUUID(), status: 'Pending', ...(body || {}) };
      this.objects.set(relative, request);
      return request;
    }
    const current = this.objects.get('academic-year-change-request');
    if (verb === 'POST' && relative.endsWith('/confirm') && current) {
      this.objects.set('academic-structure', {
        ...(this.objects.get('academic-structure') || {}),
        academic_year: current.academic_year,
      });
      this.objects.set('academic-year-change-request', null);
      return { ok: true };
    }
    return current;
  }

  private collectionPath(verb: string, relative: string, body: any, query: Record<string, any>) {
    const multi = MULTI.find((prefix) => relative === prefix || relative.startsWith(`${prefix}/`));
    if (multi) {
      const rest = relative.slice(multi.length).replace(/^\//, '');
      return this.mutate(multi, rest, verb, body, query);
    }
    const [name, id, extra] = relative.split('/');
    if (!name) return [];
    if (extra === 'detail') return name === 'students' ? this.studentDetail(id) : (this.find(name, id) || { id });
    if (extra === 'pay') return this.payFee(id, body);
    if (extra === 'checkout') return this.update(name, id, { status: 'Checked out', checked_out_at: new Date().toISOString() });
    if (extra === 'status') return this.update(name, id, { status: body?.status || query.status });
    if (extra === 'complete') return this.update(name, id, { status: 'Completed' });
    if (extra === 'confirm') return this.update(name, id, { status: 'Confirmed', ...(body || {}) });
    if (extra === 'attachment' && verb === 'POST') return { id: randomUUID(), name: 'attachment', url: '' };
    if (!id) {
      if (verb === 'POST') return this.insert(name, body);
      if (verb === 'PUT') return this.objectPath('PUT', name, body);
      return this.list(name);
    }
    if (verb === 'PUT') return this.update(name, id, body || {});
    if (verb === 'DELETE') {
      this.remove(name, id);
      return { ok: true };
    }
    if (verb === 'POST') return this.insert(name, { ...(body || {}), parent_id: id });
    return this.find(name, id) || {};
  }

  private mutate(key: string, rest: string, verb: string, body: any, query: Record<string, any>) {
    const [id, extra] = rest.split('/');
    if (!id) {
      if (verb === 'POST') return this.insert(key, body);
      return this.list(key);
    }
    if (extra === 'status') return this.update(key, id, { status: body?.status || query.status });
    if (extra === 'complete') return this.update(key, id, { status: 'Completed' });
    if (verb === 'PUT') return this.update(key, id, body || {});
    if (verb === 'DELETE') {
      this.remove(key, id);
      return { ok: true };
    }
    return this.find(key, id) || {};
  }

  private list(key: string): Row[] {
    const rows = this.lists.get(key) || [];
    if (key !== 'fees/receipts') return rows;
    return rows.map((row) => this.withLearner(row));
  }

  private withLearner(row: Row): Row {
    if (row.class_name && row.section) return row;
    const student = (this.lists.get('students') || []).find((item) => item.admission_no === row.admission_no || item.id === row.student_id || item.name === row.student_name);
    if (!student) return row;
    return { ...row, class_name: row.class_name || student.class_name, section: row.section || student.section, admission_no: row.admission_no || student.admission_no };
  }

  private insert(key: string, body: any) {
    const row = {
      id: body?.id || randomUUID(),
      status: 'Active',
      ...(body && typeof body === 'object' ? body : {}),
      created_at: new Date().toISOString(),
    };
    const rows = [...this.list(key), row];
    this.lists.set(key, rows);
    return row;
  }

  private find(key: string, id: string) {
    return this.list(key).find((row) => row.id === id || row.key === id);
  }

  private update(key: string, id: string, patch: Row) {
    const rows = this.list(key).map((row) => (row.id === id || row.key === id ? { ...row, ...patch } : row));
    if (!rows.some((row) => row.id === id || row.key === id)) rows.push({ id, ...patch });
    this.lists.set(key, rows);
    return rows.find((row) => row.id === id || row.key === id);
  }

  private remove(key: string, id: string) {
    this.lists.set(key, this.list(key).filter((row) => row.id !== id));
  }

  private roster(query: Record<string, any>) {
    const role = String(query.attendance_role || 'student');
    const source = role === 'teacher' ? 'teachers' : role === 'staff' ? 'staff' : 'students';
    return this.list(source)
      .filter((row) => !query.class_name || row.class_name === query.class_name)
      .filter((row) => !query.section || row.section === query.section)
      .map((row) => ({ id: row.id, name: row.name || row.full_name || 'Unnamed', admission_no: row.admission_no || '', roll: row.roll || '', class_name: row.class_name || '', section: row.section || '', status: 'Present' }));
  }

  private attendanceRecords(query: Record<string, any>) {
    const people = [...this.list('students'), ...this.list('teachers'), ...this.list('staff')];
    return this.list('attendance-records').filter((row) => {
      if (query.attendance_role && row.attendance_role !== query.attendance_role) return false;
      if (query.class_name && row.class_name !== query.class_name) return false;
      if (query.section && row.section !== query.section) return false;
      return true;
    }).map((row) => {
      const person = people.find((item) => item.id === row.entity_id);
      return { ...row, entity_name: row.entity_name || row.name || person?.name || 'Unnamed', name: row.name || row.entity_name || person?.name || 'Unnamed' };
    });
  }

  private markAttendance(body: any) {
    const saved = (body?.entries || []).map((entry: Row) => this.insert('attendance-records', {
      ...entry,
      attendance_role: body.attendance_role,
      attendance_date: body.attendance_date,
      class_name: body.class_name,
      section: body.section,
    }));
    return { saved: saved.length, records: saved };
  }

  private payFee(id: string, body: any) {
    const fee = this.find('fees', id) || { id, fee_name: 'Fee' };
    return this.insert('fees/receipts', {
      fee_id: id,
      fee_name: fee.fee_name || fee.name,
      student_name: body?.student_name || fee.student_name || '',
      admission_no: body?.admission_no || fee.admission_no || '',
      class_name: body?.class_name || fee.class_name || '',
      section: body?.section || fee.section || '',
      amount: Number(body?.amount || fee.amount || 0),
      discount: Number(body?.discount || 0),
      method: body?.method || 'Cash',
      paid_at: new Date().toISOString(),
    });
  }

  private createBranch(body: Row) {
    const network = (this.objects.get('branches/network') || { summary: {}, branches: [] }) as Row;
    const branch = {
      id: `BR-${randomUUID().slice(0, 6).toUpperCase()}`,
      status: 'Setup',
      students: 0,
      people: 0,
      attendance_rate: null,
      collection_efficiency: null,
      setup_progress: 10,
      outstanding: 0,
      pending_approvals: 0,
      setup_checks: [],
      risks: [],
      app_connections: [],
      ...(body || {}),
    };
    const branches = [...(network.branches || []), branch];
    this.objects.set('branches/network', {
      ...network,
      branches,
      summary: { ...(network.summary || {}), branches: branches.length },
    });
    return branch;
  }

  private grade(percent: number) {
    if (percent >= 90) return 'A+';
    if (percent >= 75) return 'A';
    if (percent >= 60) return 'B';
    if (percent >= 40) return 'C';
    return 'D';
  }

  private results(query: Record<string, any>) {
    const marks = this.list('marks');
    const groups = [...new Map(marks.map((mark) => [`${mark.class_name}|${mark.section}|${mark.exam_title}`, { class_name: mark.class_name, section: mark.section, exam_title: mark.exam_title }])).values()];
    const selectedMarks = marks.filter((mark) => (!query.class_name || mark.class_name === query.class_name) && (!query.section || mark.section === query.section) && (!query.exam_title || mark.exam_title === query.exam_title));
    if (!query.class_name || !query.section) return { available_groups: groups, selected: false, rows: [], subjects: [] };
    const subjects = [...new Set(selectedMarks.map((mark) => mark.subject))];
    const byStudent = new Map<string, Row[]>();
    selectedMarks.forEach((mark) => byStudent.set(mark.student_id, [...(byStudent.get(mark.student_id) || []), mark]));
    const rows = [...byStudent.entries()].map(([studentId, items]) => {
      const total = items.reduce((sum, item) => sum + Number(item.score || 0), 0);
      const totalMax = items.reduce((sum, item) => sum + Number(item.total_max || 0), 0);
      const percent = totalMax ? Math.round((total / totalMax) * 1000) / 10 : 0;
      return {
        student_id: studentId,
        name: items[0].name,
        roll: items[0].roll,
        total,
        total_max: totalMax,
        percent,
        grade: this.grade(percent),
        result: percent >= 40 ? 'Pass' : 'Needs support',
        subjects: items.map((item) => ({ subject: item.subject, score: item.score, percent: Math.round((Number(item.score) / Number(item.total_max || 1)) * 100) })),
      };
    }).sort((a, b) => b.percent - a.percent).map((row, index) => ({ ...row, rank: index + 1 }));
    const average = rows.length ? Math.round(rows.reduce((sum, row) => sum + row.percent, 0) / rows.length) : 0;
    return {
      available_groups: groups,
      selected: true,
      exam_title: query.exam_title || selectedMarks[0]?.exam_title || 'Term 1 Examination',
      class: query.class_name,
      class_name: query.class_name,
      section: query.section,
      subjects,
      rows,
      class_average: average,
      pass_rate: rows.length ? Math.round((rows.filter((row) => row.result === 'Pass').length / rows.length) * 100) : 0,
      top_scorer: rows[0] || null,
    };
  }

  private reportCard(studentId: string) {
    const student = this.find('students', studentId) || { id: studentId };
    const marks = this.list('marks').filter((mark) => mark.student_id === studentId).map((mark) => {
      const percent = Math.round((Number(mark.score) / Number(mark.total_max || 1)) * 100);
      return { ...mark, percent, grade: this.grade(percent), result: percent >= 40 ? 'Pass' : 'Needs support' };
    });
    const average = marks.length ? Math.round(marks.reduce((sum, mark) => sum + mark.percent, 0) / marks.length) : 0;
    return {
      student,
      marks,
      exams: this.list('exams'),
      summary: { average_percent: average, attendance_percent: 88, result: average >= 40 ? 'Pass' : 'Needs support', class_rank: 1, class_size: this.list('students').filter((item) => item.class_name === student.class_name && item.section === student.section).length, assessment_coverage: marks.length },
    };
  }

  private studentDetail(id: string) {
    const student = this.find('students', id) || { id, name: 'Student' };
    const dues = this.list('fees').filter((fee) => fee.student_id === id && Number(fee.due) > 0);
    const due = dues.reduce((sum, fee) => sum + Number(fee.due || 0), 0);
    return {
      student: { ...student, className: `${student.class_name || ''} ${student.section || ''}`.trim(), balance: `₹${due.toLocaleString('en-IN')}` },
      fees: {
        due,
        fee_id: dues[0]?.id || null,
        pending: dues.map((fee) => ({ desc: fee.fee_name, sub: fee.class_name, due: '10 Oct 2026', amount: `₹${Number(fee.due).toLocaleString('en-IN')}`, status: Number(fee.days_overdue) > 30 ? 'OVERDUE' : 'PENDING', checked: false })),
      },
      attendance: {
        month: 'October 2026',
        stats: { rate: '88%', totalWorking: 18, totalPresent: 16, lateArrivals: 1, absentDays: 1 },
        days: [
          { day: null }, { day: null }, { day: null }, { day: null }, { day: 1, status: 'present' }, { day: 2, status: 'present' }, { day: 3, status: 'weekend' },
          { day: 4, status: 'weekend' }, { day: 5, status: 'present' }, { day: 6, status: 'late' }, { day: 7, status: 'present' }, { day: 8, status: 'present' }, { day: 9, status: 'absent' }, { day: 10, status: 'weekend' },
        ],
        logs: [
          { date: '07 Oct 2026', status: 'Present', in: '08:12', out: '15:40' },
          { date: '06 Oct 2026', status: 'Late', in: '08:46', out: '15:40' },
        ],
      },
    };
  }

  private feeSummary() {
    const collected = this.list('fees/receipts').reduce((total, item) => total + Number(item.amount || 0), 0);
    const pending = this.list('fees').reduce((total, item) => total + Number(item.due || 0), 0);
    return { collected, pending, total: collected + pending, invoices: this.list('fees').length };
  }

  private search(q: string) {
    const needle = q.toLowerCase();
    const match = (row: Row) => JSON.stringify(row).toLowerCase().includes(needle);
    const structure = (this.objects.get('academic-structure') || {}) as Row;
    return {
      students: this.list('students').filter(match),
      teachers: this.list('teachers').filter(match),
      classes: (structure.classes || []).filter(match),
    };
  }
}
