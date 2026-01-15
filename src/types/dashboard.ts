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
};

export type Mentor = {
  id: number;
  name: string;
  email: string;
  phone: string;
  gender: string;
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
};

export type ApiListResponse<T> = {
  data: T[];
  total: number;
  error?: string;
};
