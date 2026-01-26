export type Participant = {
  id: string;
  no: number;
  id_tkm: string | number | null;
  nama: string | null;
  nama_usaha: string | null;
  status: string | null;
  kota_domisili: string | null;
  provinsi_domisili: string | null;
  sektor_usaha: string | null;
  tanggal_daftar: string | null;
  no_whatsapp: string | null;
  photo: string | null;
  omset_growth: number | null;
  new_employees: number | null;
};

export type Mentor = {
  id: string;
  name: string;
  email: string;
  phone: string;
  gender: string;
  photo: string | null;
  university: {
    id: string;
    name: string;
    city: string;
    province: string;
  } | null;
};

export type University = {
  id: string; // Changed from number to string to match UUID in DB
  name: string;
  alamat: string | null;
  city: string;
  province: string;
  status: string;
  photo: string | null;
};

export type ApiListResponse<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  error?: string;
};

export type ListQueryParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  filterCondition?: string;
  filterVerified?: string;
  filterDate?: string;
  status?: string;
  province?: string;
  city?: string;
};

export type MapDistribution = {
  name: string; // Province Name
  value: number; // Count
};

export type TopOmzetParticipant = {
  nama: string;
  nama_usaha: string;
  photo: string | null;
  growth: number;
  last_revenue: number;
};

export type UniversityStat = {
  university_name: string;
  total_mentors: number;
  total_participants: number;
  total_new_employees: number;
  avg_growth: number;
};

export type TopMentorVisit = {
  name: string;
  foto: string | null;
  visit_count: number;
};

export type DashboardSummary = {
  counts: {
    participants: number;
    mentors: number;
    universities: number;
    newEmployees: number;
    avgOmzetGrowth: number;
  };
  mapDistribution: MapDistribution[];
  topOmzetParticipants: TopOmzetParticipant[];
  universityStats: UniversityStat[];
  topMentorsVisits: TopMentorVisit[];
  updatedAt: string;
  error?: string;
};

export type LogbookEntry = {
  id: string;
  id_pendamping: string | null;
  id_tkm: string | number | null;
  tkmName: string | null;
  tkmPhoto: string | null;
  pendampingName: string | null;
  pendampingPhoto: string | null;
  pendampingUniversity: string | null;
  activitySummary: string | null;
  deliveryMethod: string | null;
  visitType: string | null;
  logbookDate: string | null;
  meetingType: string | null;
  mentoringMaterial: string | null;
  obstacle: string | null;
  solutions: string | null;
  startTime: string | null;
  endTime: string | null;
  totalExpense: number | string | null;
  verified: string | null;
  month_report: number | null;
  created_at: string | null;
  updated_at: string | null;
};

export type CapaianOutput = {
  id: string;
  id_pendamping: string | null;
  id_tkm: string | number | null;
  tkmName: string | null;
  tkmPhoto: string | null;
  pendampingName: string | null;
  pendampingPhoto: string | null;
  pendampingUniversity: string | null;
  month_report: number;
  bookkeeping_cashflow: string | null;
  bookkeeping_income_statement: string | null;
  cashflow_proof_url: string | null;
  income_proof_url: string | null;
  sales_volume: number | null;
  sales_volume_unit: string | null;
  production_capacity: number | null;
  production_capacity_unit: string | null;
  marketing_area: string | null;
  revenue: number | null;
  obstacle: string | null;
  business_condition: string | null;
  created_at: string | null;
  updated_at: string | null;
  isverified: string | null;
};
