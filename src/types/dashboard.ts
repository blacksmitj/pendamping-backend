export type Participant = {
  no: number;
  nama: string | null;
  nama_usaha: string | null;
  status: string | null;
  kota_domisili: string | null;
  provinsi_domisili: string | null;
  sektor_usaha: string | null;
  tanggal_daftar: string | null;
  no_whatsapp: string | null;
  photo: string | null;
};

export type Mentor = {
  id: number;
  name: string;
  email: string;
  phone: string;
  gender: string;
  photo: string | null;
  university: {
    id: number;
    name: string;
    city: string;
    province: string;
  } | null;
};

export type University = {
  id: number;
  name: string;
  alamat: string | null;
  city: string;
  province: string;
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
};

export type DashboardSummary = {
  participants: number;
  mentors: number;
  universities: number;
  updatedAt: string;
  error?: string;
};

export type LogbookEntry = {
  id: string;
  id_pendamping: number;
  id_tkm: number;
  tkmName: string | null;
  pendampingName: string | null;
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
  totalExpense: string | null;
  verified: string | null;
  month_report: number | null;
  created_at: string | null;
  updated_at: string | null;
};

export type CapaianOutput = {
  id: string;
  id_pendamping: number | null;
  id_tkm: number;
  tkmName: string | null;
  pendampingName: string | null;
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
