export const SCHOOL_ROLES = ['admin', 'principal', 'director', 'academic_coordinator', 'fee_manager', 'platform_admin'] as const;

export type SchoolRole = (typeof SCHOOL_ROLES)[number];

const principalMenu = [
  'dashboard', 'management', 'student', 'academics', 'attendance', 'teachers', 'staff',
  'exams', 'marks', 'homework', 'leave', 'timetable', 'notifications', 'transport',
  'communications', 'visitor', 'question', 'collections', 'hall_tickets', 'settings',
];

export const ROLE_SESSIONS: Record<string, { name: string; menu: string[] | null }> = {
  admin: { name: 'Administrator', menu: null },
  principal: { name: 'Principal', menu: principalMenu },
  director: { name: 'Director', menu: [...principalMenu.filter((item) => item !== 'settings'), 'multibranch', 'settings'] },
  academic_coordinator: { name: 'Academic Coordinator', menu: ['dashboard', 'academics', 'teachers', 'notifications', 'hall_tickets'] },
  fee_manager: { name: 'Fee Manager', menu: ['dashboard', 'student', 'fee', 'expenses', 'notifications', 'communications', 'settings'] },
  platform_admin: { name: 'Platform Administrator', menu: ['platform_schools', 'platform_plans', 'platform_subscriptions', 'platform_billing', 'platform_users'] },
};

export const schoolSession = (role: string) => ROLE_SESSIONS[role] || ROLE_SESSIONS.admin;
