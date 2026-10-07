export interface SchoolSession {
  token: string;
  role: string;
  name: string;
  menu: string[] | null;
  schoolId: string;
}

export interface DashboardStats {
  students: number;
  classes: number;
  sections: number;
  collection_efficiency: number;
  collected: number;
  pending: number;
  total: number;
  invoices: number;
  pass_rate: number;
  avg: number;
  attendance: number | null;
}
