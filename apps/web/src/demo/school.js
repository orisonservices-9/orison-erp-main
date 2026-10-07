const avatar = (name) => `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" fill="#4F46E5"/><text x="40" y="48" text-anchor="middle" fill="white" font-size="28" font-family="sans-serif">${name.slice(0, 1)}</text></svg>`)}`;

const student = (id, name, admission_no, roll, class_name, section, parent_name, parent_phone, dob, gender) => ({
  id, name, admission_no, roll, class_name, section, parent_name, parent_phone, phone: parent_phone, dob, gender,
  status: 'Active', academic_year: '2026–27', avatar: avatar(name),
});

export const createCampus = () => {
  const students = [
    student('STU-2401', 'Aarav Reddy', 'ORI-2026-0012', '12', 'Class 8', 'A', 'Lakshmi Reddy', '9848012210', '2012-04-18', 'Male'),
    student('STU-2402', 'Saanvi Reddy', 'ORI-2026-0024', '08', 'Class 8', 'A', 'Lakshmi Reddy', '9848012210', '2013-01-22', 'Female'),
    student('STU-2403', 'Vihaan Rao', 'ORI-2026-0021', '18', 'Class 8', 'A', 'Ramesh Rao', '9848013344', '2012-11-02', 'Male'),
    student('STU-2404', 'Ananya Sharma', 'ORI-2026-0018', '04', 'Class 6', 'A', 'Priya Sharma', '9848030091', '2014-06-15', 'Female'),
    student('STU-2405', 'Mohammed Imran', 'ORI-2026-0041', '15', 'Class 8', 'A', 'Fatima Begum', '9848021188', '2012-08-09', 'Male'),
    student('STU-2406', 'Ishita Rao', 'ORI-2026-0033', '06', 'Class 10', 'A', 'Ramesh Rao', '9848013344', '2010-03-28', 'Female'),
    student('STU-2407', 'Arjun Varma', 'ORI-2026-0030', '09', 'Class 10', 'A', 'Neha Varma', '9848067782', '2010-12-11', 'Male'),
    student('STU-2408', 'Meher Fatima', 'ORI-2026-0044', '03', 'Class 10', 'A', 'Abdul Kareem', '9848056671', '2011-02-04', 'Female'),
  ];
  const teachers = [
    { id: 'TCH-101', name: 'Kavitha Menon', designation: 'Senior Teacher', department: 'Mathematics', subject: 'Mathematics', phone: '9848100101', status: 'Active' },
    { id: 'TCH-102', name: 'Rahul Deshmukh', designation: 'Teacher', department: 'Science', subject: 'Science', phone: '9848100102', status: 'Active' },
    { id: 'TCH-103', name: 'Nalini Iyer', designation: 'Teacher', department: 'English', subject: 'English', phone: '9848100103', status: 'Active' },
    { id: 'TCH-104', name: 'Farhan Qureshi', designation: 'Teacher', department: 'Social Science', subject: 'Social Science', phone: '9848100104', status: 'Active' },
  ];
  const staff = [
    { id: 'STF-11', name: 'Padma Joshi', full_name: 'Padma Joshi', designation: 'Accountant', department: 'Accounts', phone: '9848200201', status: 'Active' },
    { id: 'STF-12', name: 'Srinivas Goud', full_name: 'Srinivas Goud', designation: 'Transport supervisor', department: 'Transport', phone: '9848200202', status: 'Active' },
    { id: 'STF-13', name: 'Rekha Banerjee', full_name: 'Rekha Banerjee', designation: 'Front office', department: 'Administration', phone: '9848200203', status: 'Active' },
  ];
  const classes = [
    { id: 'c1', name: 'Class 6', sections: [{ name: 'A', subjects: ['Mathematics', 'Science', 'English'] }, { name: 'B', subjects: ['Mathematics', 'Science', 'English'] }] },
    { id: 'c2', name: 'Class 8', sections: [{ name: 'A', subjects: ['Mathematics', 'Science', 'English'] }] },
    { id: 'c3', name: 'Class 10', sections: [{ name: 'A', subjects: ['Mathematics', 'Science', 'English', 'Social Science'] }] },
  ];
  const fees = [
    { id: 'FEE-1', student_id: 'STU-2401', student_name: 'Aarav Reddy', admission_no: 'ORI-2026-0012', class_name: 'Class 8', section: 'A', fee_name: 'Term 2 tuition', amount: 18500, paid: 18500, due: 0, status: 'Paid', days_overdue: 0 },
    { id: 'FEE-2', student_id: 'STU-2402', student_name: 'Saanvi Reddy', admission_no: 'ORI-2026-0024', class_name: 'Class 8', section: 'A', fee_name: 'Term 2 tuition', amount: 18500, paid: 10000, due: 8500, status: 'Partial', days_overdue: 18 },
    { id: 'FEE-3', student_id: 'STU-2408', student_name: 'Meher Fatima', admission_no: 'ORI-2026-0044', class_name: 'Class 10', section: 'A', fee_name: 'Term 2 tuition', amount: 22000, paid: 0, due: 22000, status: 'Pending', days_overdue: 42 },
    { id: 'FEE-4', student_id: 'STU-2404', student_name: 'Ananya Sharma', admission_no: 'ORI-2026-0018', class_name: 'Class 6', section: 'A', fee_name: 'Transport', amount: 6000, paid: 6000, due: 0, status: 'Paid', days_overdue: 0 },
  ];
  const receipts = [
    { id: 'RCP-1', student_name: 'Aarav Reddy', admission_no: 'ORI-2026-0012', class_name: 'Class 8', section: 'A', amount: 18500, method: 'UPI', discount: 0, paid_at: '2026-09-12T10:20:00.000Z', fee_name: 'Term 2 tuition' },
    { id: 'RCP-2', student_name: 'Saanvi Reddy', admission_no: 'ORI-2026-0024', class_name: 'Class 8', section: 'A', amount: 10000, method: 'Cash', discount: 0, paid_at: '2026-09-20T11:05:00.000Z', fee_name: 'Term 2 tuition' },
    { id: 'RCP-3', student_name: 'Ananya Sharma', admission_no: 'ORI-2026-0018', class_name: 'Class 6', section: 'A', amount: 6000, method: 'UPI', discount: 0, paid_at: '2026-09-08T09:40:00.000Z', fee_name: 'Transport' },
  ];
  const exams = [
    { id: 'EXM-1', title: 'Term 1 Examination', class_name: 'Class 8', section: 'A', subject: 'Mathematics', subjects: ['Mathematics', 'Science', 'English'], status: 'Scheduled', date: '2026-10-18', start_time: '09:30', end_time: '12:30', room: 'Hall A', max_marks: 100, passing_marks: 35, assessment_component: 'Theory' },
    { id: 'EXM-2', title: 'Term 1 Examination', class_name: 'Class 10', section: 'A', subject: 'Science', subjects: ['Science', 'Mathematics', 'English', 'Social Science'], status: 'Completed', date: '2026-09-22', room: 'Hall B', max_marks: 80, passing_marks: 28, assessment_component: 'Theory' },
  ];
  const marks = [
    ['STU-2401', 'Aarav Reddy', '12', 'Mathematics', 86],
    ['STU-2401', 'Aarav Reddy', '12', 'Science', 78],
    ['STU-2401', 'Aarav Reddy', '12', 'English', 91],
    ['STU-2402', 'Saanvi Reddy', '08', 'Mathematics', 74],
    ['STU-2402', 'Saanvi Reddy', '08', 'Science', 81],
    ['STU-2402', 'Saanvi Reddy', '08', 'English', 88],
    ['STU-2403', 'Vihaan Rao', '18', 'Mathematics', 69],
    ['STU-2403', 'Vihaan Rao', '18', 'Science', 72],
    ['STU-2403', 'Vihaan Rao', '18', 'English', 64],
  ].map(([student_id, name, roll, subject, score], index) => ({
    id: `MK-${index + 1}`, student_id, name, roll, class_name: 'Class 8', section: 'A', exam_title: 'Term 1 Examination', subject, score, total_max: 100, assessment: 'SA1',
  }));
  const attendance = students.map((row, index) => ({
    id: `ATT-${index + 1}`,
    entity_id: row.id,
    entity_name: row.name,
    name: row.name,
    attendance_role: 'student',
    attendance_date: '2026-10-07',
    class_name: row.class_name,
    section: row.section,
    status: row.id === 'STU-2405' ? 'Absent' : row.id === 'STU-2408' ? 'Late' : 'Present',
  }));
  return {
    students, teachers, staff, classes, fees, receipts, exams, marks, attendance,
    routes: [
      { id: 'RTE-1', route_name: 'Madhapur – Campus', bus_number: 'TS09 UA 4412', driver_name: 'Raju Yadav', driver_mobile: '9848300301', status: 'Active', vehicle_capacity: 42, vehicle_type: 'School Bus', stops: [{ name: 'Madhapur', time: '07:10' }, { name: 'Jubilee Hills', time: '07:28' }] },
      { id: 'RTE-2', route_name: 'Kukatpally – Campus', bus_number: 'TS09 UA 2281', driver_name: 'Naveen Goud', driver_mobile: '9848300401', status: 'Active', vehicle_capacity: 40, vehicle_type: 'School Bus', stops: [{ name: 'Kukatpally', time: '07:00' }] },
    ],
    visitors: [
      { id: 'VIS-1', visitor_name: 'Lakshmi Reddy', phone: '9848012210', visitor_type: 'Parent / Guardian', purpose: 'Meeting class teacher', host_name: 'Kavitha Menon', pass_number: 'VP-1042', status: 'Inside', visit_date: '2026-10-07', check_in_at: '2026-10-07T09:15:00.000Z', host_notified: true },
    ],
    leads: [
      { id: 'ADM-1', name: 'Harshitha Reddy', phone: '9848099001', interested_class: 'Class 6', stage: 'Enquiry', counsellor: 'Rekha Banerjee' },
      { id: 'ADM-2', name: 'Vihaan Patel', phone: '9848099002', interested_class: 'Class 8', stage: 'Visit', counsellor: 'Rekha Banerjee' },
    ],
  };
};
