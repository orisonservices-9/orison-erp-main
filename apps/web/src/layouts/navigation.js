import {
  Activity, ArrowRightLeft, Banknote, Bell, BookOpen, Boxes, Briefcase,
  Building2, Bus, CalendarCheck, CalendarDays, ClipboardCheck, ClipboardList, CreditCard,
  FileBarChart, FileText, FolderKanban, Gauge, GraduationCap,
  Landmark, NotebookPen, Receipt, Route, School, ScrollText,
  Send, ShieldCheck, TicketCheck, UserCheck, UserCog, UserPlus, Users, Wallet,
} from 'lucide-react';
import { NAV_ITEMS } from '../lib/mock';

const CHILD_ICON = {
  '/students/add': UserPlus,
  '/students/view': Users,
  '/students/promote': GraduationCap,
  '/students/transfer': ArrowRightLeft,
  '/admissions': FolderKanban,
  '/academics': School,
  '/academics/action-center': Gauge,
  '/academics/syllabus': BookOpen,
  '/academics/student-health': Activity,
  '/academics/interventions': ClipboardCheck,
  '/attendance/add': CalendarCheck,
  '/attendance/view': ClipboardList,
  '/attendance/reports': FileBarChart,
  '/teachers/add': UserPlus,
  '/teachers/view': Users,
  '/teachers/assign': UserCog,
  '/teachers/allocations': ScrollText,
  '/staff/add': UserPlus,
  '/staff/view': Briefcase,
  '/fee/create': Wallet,
  '/fee/collect': Banknote,
  '/fee/collections': Receipt,
  '/fee/receipts': ScrollText,
  '/fee/payment-verification': ShieldCheck,
  '/exams/create': FileText,
  '/exams/view': ClipboardList,
  '/marks/add': NotebookPen,
  '/marks/results': FileBarChart,
  '/marks/report-card': ScrollText,
  '/homework/add': BookOpen,
  '/homework/reports': FileBarChart,
  '/hall-tickets/create': TicketCheck,
  '/hall-tickets/view': ScrollText,
  '/leave/apply': CalendarDays,
  '/leave/requests': ClipboardCheck,
  '/leave/reports': FileBarChart,
  '/timetable/create': CalendarDays,
  '/timetable/view': ClipboardList,
  '/timetable/reports': FileBarChart,
  '/inventory': Boxes,
  '/inventory/purchase': Receipt,
  '/inventory/parent-issue': Send,
  '/inventory/movement': Route,
  '/inventory/register': ScrollText,
  '/inventory/reports': FileBarChart,
  '/expenses': Receipt,
  '/expenses/record': Banknote,
  '/expenses/register': ScrollText,
  '/expenses/reports': FileBarChart,
  '/notifications': Bell,
  '/notifications/send': Send,
  '/transport': Bus,
  '/transport/routes': Route,
  '/visitor': UserCheck,
  '/visitor/register': UserPlus,
  '/visitor/log': ScrollText,
  '/multi-branch/overview': Building2,
  '/multi-branch/directory': School,
  '/multi-branch/reports': FileBarChart,
};

const KEYWORDS = {
  '/students/add': 'add student enrol enrollment admission',
  '/students/view': 'students directory records',
  '/students/promote': 'promotion class change',
  '/students/transfer': 'transfer certificate',
  '/admissions': 'admissions crm enquiry',
  '/attendance/add': 'take attendance mark present absent',
  '/attendance/view': 'attendance register today',
  '/attendance/reports': 'attendance reports',
  '/fee/collect': 'record payment collect fee receipt',
  '/fee/create': 'fee structure dues',
  '/fee/collections': 'collections invoices',
  '/exams/create': 'create exam schedule assessment',
  '/marks/add': 'enter marks scores',
  '/marks/results': 'results grades',
  '/teachers/add': 'add teacher faculty',
  '/teachers/view': 'teachers directory',
  '/notifications': 'alerts messages',
  '/hr-payroll': 'payroll salary hr',
};

export const PLATFORM_NAV = [
  { key: 'platform_schools', label: 'Schools', icon: School, path: '/platform/schools' },
  { key: 'platform_plans', label: 'Plans', icon: Landmark, path: '/platform/plans' },
  { key: 'platform_subscriptions', label: 'Subscriptions', icon: CreditCard, path: '/platform/subscriptions' },
  { key: 'platform_billing', label: 'Billing', icon: Receipt, path: '/platform/billing' },
  { key: 'platform_users', label: 'Platform users', icon: Users, path: '/platform/users' },
];

export const matchesPath = (target, current) => Boolean(target) && (current === target || current.startsWith(`${target}/`));

export const activeChild = (item, current) => {
  const hits = (item.children || []).filter((child) => matchesPath(child.path, current));
  hits.sort((a, b) => b.path.length - a.path.length);
  return hits[0] || null;
};

const decorate = (item) => ({
  ...item,
  children: item.children?.map((child) => ({
    ...child,
    icon: CHILD_ICON[child.path] || item.icon,
  })),
});

export function navigationFor(auth) {
  if (auth?.role === 'platform_admin') return PLATFORM_NAV;
  const menu = auth?.menu;
  const source = menu ? NAV_ITEMS.filter((item) => menu.includes(item.key)) : NAV_ITEMS;
  return source.map(decorate);
}

export function routeSection(items, pathname) {
  return items.find((item) => (item.path && matchesPath(item.path, pathname)) || activeChild(item, pathname)) || null;
}

const shortSection = (label) => label.replace(/ Management$/, '');

export function breadcrumbsFor(pathname, platform) {
  if (platform) {
    const item = PLATFORM_NAV.find((entry) => matchesPath(entry.path, pathname));
    return [{ label: 'Platform', to: '/platform/schools' }, { label: item?.label || 'Workspace' }];
  }
  for (const item of NAV_ITEMS) {
    const child = activeChild(item, pathname);
    if (child) return [{ label: shortSection(item.label), to: item.children[0].path }, { label: child.label }];
    if (item.path && matchesPath(item.path, pathname)) return [{ label: shortSection(item.label) }];
  }
  return [{ label: 'Workspace' }];
}

export function commandItems(auth) {
  if (auth?.role === 'platform_admin') {
    return PLATFORM_NAV.map((item) => ({
      id: item.path,
      title: item.label,
      group: 'Platform',
      path: item.path,
      icon: item.icon,
      keywords: item.label,
    }));
  }
  return navigationFor(auth).flatMap((item) => {
    if (!item.children) {
      return [{
        id: item.path,
        title: item.label,
        group: 'Modules',
        path: item.path,
        icon: item.icon,
        keywords: `${item.label} ${KEYWORDS[item.path] || ''}`,
      }];
    }
    const section = shortSection(item.label);
    return [
      {
        id: `module-${item.key}`,
        title: section,
        group: 'Modules',
        detail: item.label,
        path: item.children[0].path,
        icon: item.icon,
        keywords: item.label,
      },
      ...item.children.map((child) => ({
        id: child.path,
        title: child.label,
        group: item.label,
        path: child.path,
        icon: child.icon || item.icon,
        keywords: `${child.label} ${section} ${KEYWORDS[child.path] || ''}`,
      })),
    ];
  });
}
