type Row = Record<string, any>;

const year = '2026–27';

const classes = [
  { id: 'c1', name: 'Class 6', sections: [{ name: 'A', subjects: ['Mathematics', 'Science', 'English'] }, { name: 'B', subjects: ['Mathematics', 'Science', 'English'] }] },
  { id: 'c2', name: 'Class 8', sections: [{ name: 'A', subjects: ['Mathematics', 'Science', 'English'] }] },
  { id: 'c3', name: 'Class 10', sections: [{ name: 'A', subjects: ['Mathematics', 'Science', 'English', 'Social Science'] }] },
];

const students: Row[] = [
  ['STU-2401', 'Aarav Reddy', 'ORI-2026-0012', '12', 'Class 8', 'A', 'Lakshmi Reddy', '9848012210', '2012-04-18'],
  ['STU-2402', 'Saanvi Reddy', 'ORI-2026-0024', '08', 'Class 8', 'A', 'Lakshmi Reddy', '9848012210', '2013-01-22'],
  ['STU-2403', 'Vihaan Rao', 'ORI-2026-0021', '18', 'Class 8', 'A', 'Ramesh Rao', '9848013344', '2012-11-02'],
  ['STU-2404', 'Ananya Sharma', 'ORI-2026-0018', '04', 'Class 6', 'A', 'Priya Sharma', '9848030091', '2014-06-15'],
  ['STU-2405', 'Mohammed Imran', 'ORI-2026-0041', '15', 'Class 8', 'A', 'Fatima Begum', '9848021188', '2012-08-09'],
  ['STU-2406', 'Ishita Rao', 'ORI-2026-0033', '06', 'Class 10', 'A', 'Ramesh Rao', '9848013344', '2010-03-28'],
  ['STU-2407', 'Arjun Varma', 'ORI-2026-0030', '09', 'Class 10', 'A', 'Neha Varma', '9848067782', '2010-12-11'],
  ['STU-2408', 'Meher Fatima', 'ORI-2026-0044', '03', 'Class 10', 'A', 'Abdul Kareem', '9848056671', '2011-02-04'],
].map(([id, name, admission_no, roll, class_name, section, parent_name, parent_phone, dob]) => ({
  id, name, admission_no, roll, class_name, section, parent_name, parent_phone, phone: parent_phone, dob,
  status: 'Active',
  gender: ['Aarav', 'Vihaan', 'Mohammed', 'Arjun'].some((part) => String(name).startsWith(part)) ? 'Male' : 'Female',
  avatar: `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" fill="#4F46E5"/><text x="40" y="48" text-anchor="middle" fill="white" font-size="28" font-family="sans-serif">${String(name).slice(0, 1)}</text></svg>`)}`,
}));

const teachers: Row[] = [
  { id: 'TCH-101', name: 'Kavitha Menon', designation: 'Senior Teacher', department: 'Mathematics', subject: 'Mathematics', phone: '9848100101', status: 'Active' },
  { id: 'TCH-102', name: 'Rahul Deshmukh', designation: 'Teacher', department: 'Science', subject: 'Science', phone: '9848100102', status: 'Active' },
  { id: 'TCH-103', name: 'Nalini Iyer', designation: 'Teacher', department: 'English', subject: 'English', phone: '9848100103', status: 'Active' },
  { id: 'TCH-104', name: 'Farhan Qureshi', designation: 'Teacher', department: 'Social Science', subject: 'Social Science', phone: '9848100104', status: 'Active' },
];

const staff: Row[] = [
  { id: 'STF-11', name: 'Padma Joshi', full_name: 'Padma Joshi', designation: 'Accountant', department: 'Accounts', phone: '9848200201', status: 'Active' },
  { id: 'STF-12', name: 'Srinivas Goud', full_name: 'Srinivas Goud', designation: 'Transport supervisor', department: 'Transport', phone: '9848200202', status: 'Active' },
  { id: 'STF-13', name: 'Rekha Banerjee', full_name: 'Rekha Banerjee', designation: 'Front office', department: 'Administration', phone: '9848200203', status: 'Active' },
];

const fees: Row[] = [
  { id: 'FEE-1', student_id: 'STU-2401', student_name: 'Aarav Reddy', admission_no: 'ORI-2026-0012', class_name: 'Class 8', section: 'A', parent_name: 'Lakshmi Reddy', parent_phone: '9848012210', fee_name: 'Term 2 tuition', amount: 18500, paid: 18500, due: 0, status: 'Paid', days_overdue: 0 },
  { id: 'FEE-2', student_id: 'STU-2402', student_name: 'Saanvi Reddy', admission_no: 'ORI-2026-0024', class_name: 'Class 8', section: 'A', parent_name: 'Lakshmi Reddy', parent_phone: '9848012210', fee_name: 'Term 2 tuition', amount: 18500, paid: 10000, due: 8500, status: 'Partial', days_overdue: 18 },
  { id: 'FEE-3', student_id: 'STU-2408', student_name: 'Meher Fatima', admission_no: 'ORI-2026-0044', class_name: 'Class 10', section: 'A', parent_name: 'Abdul Kareem', parent_phone: '9848056671', fee_name: 'Term 2 tuition', amount: 22000, paid: 0, due: 22000, status: 'Pending', days_overdue: 42, bucket: '30-60' },
  { id: 'FEE-4', student_id: 'STU-2404', student_name: 'Ananya Sharma', admission_no: 'ORI-2026-0018', class_name: 'Class 6', section: 'A', parent_name: 'Priya Sharma', parent_phone: '9848030091', fee_name: 'Transport', amount: 6000, paid: 6000, due: 0, status: 'Paid', days_overdue: 0 },
];

const receipts: Row[] = [
  { id: 'RCP-1', student_name: 'Aarav Reddy', admission_no: 'ORI-2026-0012', class_name: 'Class 8', section: 'A', amount: 18500, method: 'UPI', paid_at: '2026-09-12T10:20:00.000Z', fee_name: 'Term 2 tuition' },
  { id: 'RCP-2', student_name: 'Saanvi Reddy', admission_no: 'ORI-2026-0024', class_name: 'Class 8', section: 'A', amount: 10000, method: 'Cash', paid_at: '2026-09-20T11:05:00.000Z', fee_name: 'Term 2 tuition' },
  { id: 'RCP-3', student_name: 'Ananya Sharma', admission_no: 'ORI-2026-0018', class_name: 'Class 6', section: 'A', amount: 6000, method: 'UPI', paid_at: '2026-09-08T09:40:00.000Z', fee_name: 'Transport' },
];

const exams: Row[] = [
  { id: 'EXM-1', title: 'Term 1 Examination', class_name: 'Class 8', section: 'A', subject: 'Mathematics', subjects: ['Mathematics', 'Science', 'English'], status: 'Scheduled', date: '2026-10-18', start_time: '09:30', end_time: '12:30', room: 'Hall A', max_marks: 100, passing_marks: 35, assessment_component: 'Theory', grade_scheme: [] },
  { id: 'EXM-2', title: 'Term 1 Examination', class_name: 'Class 10', section: 'A', subject: 'Science', subjects: ['Science', 'Mathematics', 'English', 'Social Science'], status: 'Completed', date: '2026-09-22', room: 'Hall B', max_marks: 80, passing_marks: 28, assessment_component: 'Theory' },
];

const today = '2026-10-07';
const attendance = students.map((student, index) => ({
  id: `ATT-${index + 1}`,
  entity_id: student.id,
  entity_name: student.name,
  name: student.name,
  attendance_role: 'student',
  attendance_date: today,
  class_name: student.class_name,
  section: student.section,
  status: index === 2 ? 'Absent' : index === 5 ? 'Late' : 'Present',
}));

export function seedSchool(lists: Map<string, Row[]>, objects: Map<string, Row | null>) {
  lists.set('students', students);
  lists.set('teachers', teachers);
  lists.set('staff', staff);
  lists.set('fees', fees);
  lists.set('fees/receipts', receipts);
  lists.set('fees/structures', [
    { id: 'FS-1', name: 'Term 2 tuition', category: 'Tuition', amount: 18500, description: 'Term 2 school tuition', start_date: '2026-08-01', due_date: '2026-10-10', targets: [{ class_name: 'Class 8', section: 'A' }, { class_name: 'Class 10', section: 'A' }] },
    { id: 'FS-2', name: 'Transport', category: 'Transport', amount: 6000, description: 'Campus bus fee', start_date: '2026-06-01', due_date: '2026-10-10', targets: [{ class_name: 'Class 6', section: 'A' }, { class_name: 'Class 6', section: 'B' }] },
  ]);
  lists.set('exams', exams);
  lists.set('marks', [
    { id: 'MK-1', student_id: 'STU-2401', name: 'Aarav Reddy', roll: '12', class_name: 'Class 8', section: 'A', exam_title: 'Term 1 Examination', subject: 'Mathematics', score: 86, total_max: 100, assessment: 'SA1' },
    { id: 'MK-2', student_id: 'STU-2401', name: 'Aarav Reddy', roll: '12', class_name: 'Class 8', section: 'A', exam_title: 'Term 1 Examination', subject: 'Science', score: 78, total_max: 100, assessment: 'SA1' },
    { id: 'MK-3', student_id: 'STU-2401', name: 'Aarav Reddy', roll: '12', class_name: 'Class 8', section: 'A', exam_title: 'Term 1 Examination', subject: 'English', score: 91, total_max: 100, assessment: 'SA1' },
    { id: 'MK-4', student_id: 'STU-2402', name: 'Saanvi Reddy', roll: '08', class_name: 'Class 8', section: 'A', exam_title: 'Term 1 Examination', subject: 'Mathematics', score: 74, total_max: 100, assessment: 'SA1' },
    { id: 'MK-5', student_id: 'STU-2402', name: 'Saanvi Reddy', roll: '08', class_name: 'Class 8', section: 'A', exam_title: 'Term 1 Examination', subject: 'Science', score: 81, total_max: 100, assessment: 'SA1' },
    { id: 'MK-6', student_id: 'STU-2402', name: 'Saanvi Reddy', roll: '08', class_name: 'Class 8', section: 'A', exam_title: 'Term 1 Examination', subject: 'English', score: 88, total_max: 100, assessment: 'SA1' },
    { id: 'MK-7', student_id: 'STU-2403', name: 'Vihaan Rao', roll: '18', class_name: 'Class 8', section: 'A', exam_title: 'Term 1 Examination', subject: 'Mathematics', score: 69, total_max: 100, assessment: 'SA1' },
    { id: 'MK-8', student_id: 'STU-2403', name: 'Vihaan Rao', roll: '18', class_name: 'Class 8', section: 'A', exam_title: 'Term 1 Examination', subject: 'Science', score: 72, total_max: 100, assessment: 'SA1' },
    { id: 'MK-9', student_id: 'STU-2403', name: 'Vihaan Rao', roll: '18', class_name: 'Class 8', section: 'A', exam_title: 'Term 1 Examination', subject: 'English', score: 64, total_max: 100, assessment: 'SA1' },
  ]);
  lists.set('attendance-records', attendance);
  lists.set('admission-leads', [
    { id: 'ADM-1', name: 'Harshitha Reddy', phone: '9848099001', interested_class: 'Class 6', stage: 'Enquiry', counsellor: 'Rekha Banerjee' },
    { id: 'ADM-2', name: 'Vihaan Patel', phone: '9848099002', interested_class: 'Class 8', stage: 'Visit', counsellor: 'Rekha Banerjee' },
  ]);
  lists.set('parent-center/transport/routes', [
    { id: 'RTE-1', route_name: 'Madhapur – Campus', bus_number: 'TS09 UA 4412', driver_name: 'Raju Yadav', driver_mobile: '9848300301', attendant_mobile: '9848300302', status: 'Active', vehicle_capacity: 42, stops: [{ name: 'Madhapur', time: '07:10' }, { name: 'Jubilee Hills', time: '07:28' }] },
    { id: 'RTE-2', route_name: 'Kukatpally – Campus', bus_number: 'TS09 UA 2281', driver_name: 'Naveen Goud', driver_mobile: '9848300401', attendant_mobile: '9848300402', status: 'Active', vehicle_capacity: 40, stops: [{ name: 'Kukatpally', time: '07:00' }] },
  ]);
  lists.set('visitors', [
    { id: 'VIS-1', visitor_name: 'Lakshmi Reddy', phone: '9848012210', visitor_type: 'Parent / Guardian', purpose: 'Meeting class teacher', host_name: 'Kavitha Menon', pass_number: 'VP-1042', status: 'Inside', visit_date: today, check_in_at: `${today}T09:15:00.000Z`, host_notified: true },
  ]);
  lists.set('teacher-allocations', teachers.map((teacher, index) => ({
    id: `ALC-${index + 1}`,
    teacher_id: teacher.id,
    teacher_name: teacher.name,
    subject: teacher.subject,
    class_name: index < 2 ? 'Class 8' : 'Class 10',
    section: 'A',
  })));
  lists.set('timetable-periods', [
    { id: 'TT-1', day: 'Monday', period: '1', start: '09:00', end: '09:40', class_name: 'Class 8', section: 'A', subject: 'Mathematics', teacher_name: 'Kavitha Menon' },
    { id: 'TT-2', day: 'Monday', period: '2', start: '09:40', end: '10:20', class_name: 'Class 8', section: 'A', subject: 'Science', teacher_name: 'Rahul Deshmukh' },
    { id: 'TT-3', day: 'Monday', period: '3', start: '10:35', end: '11:15', class_name: 'Class 10', section: 'A', subject: 'English', teacher_name: 'Nalini Iyer' },
  ]);
  lists.set('hr/salary-structures', [
    { id: 'PAY-1', name: 'Kavitha Menon', designation: 'Senior Teacher', department: 'Mathematics', gross: 62000, deductions: 4800, net: 57200, status: 'Processed' },
    { id: 'PAY-2', name: 'Rahul Deshmukh', designation: 'Teacher', department: 'Science', gross: 48000, deductions: 3600, net: 44400, status: 'Processed' },
    { id: 'PAY-3', name: 'Padma Joshi', designation: 'Accountant', department: 'Accounts', gross: 42000, deductions: 2100, net: 39900, status: 'Ready' },
  ]);
  lists.set('leaves', [
    { id: 'LV-1', name: 'Nalini Iyer', role: 'Teacher', type: 'Casual', from: '2026-10-09', to: '2026-10-09', days: 1, status: 'Pending', reason: 'Family function' },
  ]);
  lists.set('notifications', [
    { id: 'NT-1', title: 'Term 1 hall tickets', message: 'Hall tickets for Class 10 are ready at the front office.', audience: 'Parents', status: 'Sent', recipients_count: 3, class_name: 'Class 10', section: 'A', channels: ['Parent App'], created: '2026-10-06T08:30:00.000Z' },
    { id: 'NT-2', title: 'Fee reminder', message: 'Term 2 tuition is still open for a few families.', audience: 'Parents', status: 'Sent', recipients_count: 2, channels: ['SMS'], created: '2026-10-05T09:00:00.000Z' },
  ]);
  lists.set('notifications/rules', [
    { id: 'NR-1', key: 'fee-reminder', event: 'Fee due in 3 days', description: 'Reminds guardians before the due date.', audience: 'Parents', channels: ['SMS', 'Parent App'], enabled: true },
    { id: 'NR-2', key: 'absence', event: 'Student marked absent', description: 'Sends the same morning when attendance is saved.', audience: 'Parents', channels: ['Parent App'], enabled: true },
  ]);
  lists.set('parent-center/notices', [
    { id: 'PN-1', title: 'Dasara holiday', body: 'The campus is closed on 20 October 2026.', audience: 'All', status: 'Published' },
  ]);
  lists.set('parent-center/transport/trips', [
    { id: 'TRP-1', route_name: 'Madhapur – Campus', status: 'Completed', trip_date: today, boarded: 28 },
  ]);
  lists.set('inventory/items', [
    { id: 'INV-1', item_name: 'A4 ream', category: 'Stationery', sku: 'STN-A4', quantity: 42, unit: 'ream', reorder_level: 12, unit_price: 280, stock_value: 11760, location: 'Central Store', supplier: 'Campus Stationery', stock_status: 'In Stock' },
    { id: 'INV-2', item_name: 'Lab apron', category: 'Science', sku: 'SCI-APR', quantity: 8, unit: 'piece', reorder_level: 10, unit_price: 450, stock_value: 3600, location: 'Science Lab', supplier: 'Lab Supplies Co.', stock_status: 'Low Stock' },
  ]);
  lists.set('expenses', [
    { id: 'EXP-1', paid_to: 'City Fuel Station', description: 'Bus diesel', category: 'Transport', amount: 8600, expense_date: '2026-10-03', status: 'Paid', payment_method: 'UPI', reference: 'INV-4412' },
  ]);
  lists.set('homework', [
    { id: 'HW-1', title: 'Linear equations', subject: 'Mathematics', class_name: 'Class 8', section: 'A', due_date: '2026-10-10', teacher_name: 'Kavitha Menon', status: 'Assigned' },
  ]);
  objects.set('academic-structure', { academic_year: year, classes });
  objects.set('settings', {
    settings: {
      schoolName: 'Orison Main Campus', legalName: 'Orison Services Pvt. Ltd.', schoolCode: 'ORI-HYD-001', board: 'CBSE',
      email: 'office@orisonschool.edu', phone: '+91 98765 00000', address: 'Knowledge Park, Hyderabad, Telangana 500081',
      academicYear: year, timezone: 'Asia/Kolkata', currency: 'INR (₹)',
    },
    toggles: { parentApp: true, teacherApp: true, email: true, sms: true, push: true, twofa: true, approval: true, autoReceipt: true, lateFee: true, audit: true, backup: true, maintenance: false },
  });
  objects.set('branches/network', {
    summary: { branches: 1, students: students.length },
    branches: [{
      id: 'BR-HYD',
      name: 'Orison Main Campus',
      code: 'ORI-HYD',
      city: 'Hyderabad',
      academic_year: year,
      status: 'Active',
      students: students.length,
      people: teachers.length + staff.length,
      attendance_rate: 88,
      collection_efficiency: 53,
      setup_progress: 80,
      outstanding: 30500,
      pending_approvals: 1,
      setup_checks: [
        { key: 'classes', label: 'Classes and sections', complete: true },
        { key: 'fees', label: 'Fee structure', complete: true },
        { key: 'payroll', label: 'Payroll month', complete: false },
      ],
      risks: [{ label: 'Class 10 fee follow-up', level: 'High' }],
      app_connections: [
        { name: 'Parent app', purpose: 'Fees, attendance and notices' },
        { name: 'Teacher app', purpose: 'Attendance and homework' },
        { name: 'Director', purpose: 'Campus summary' },
      ],
    }],
  });
}
