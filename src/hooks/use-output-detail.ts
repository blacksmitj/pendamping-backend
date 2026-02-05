import { useQuery } from "@tanstack/react-query";

export interface OutputPeserta {
    id: string;
    legacy_tkm_id: string | null;
    nama: string;
    nik: string;
    foto: string | null;
    no_whatsapp: string;
    nama_usaha: string;
    jenis_usaha: string;
    sektor_usaha: string;
    alamat_usaha: string;
    kelurahan_usaha: string;
    kecamatan_usaha: string;
    kota_usaha: string;
    provinsi_usaha: string;
    universitas: string;
}

export interface OutputPendamping {
    id: string;
    nama: string;
    nik: string;
    foto: string | null;
    no_whatsapp: string;
    email: string;
    universitas: string;
}

export interface OutputEmployee {
    id: string;
    name: string | null;
    nik: string | null;
    gender: string | null;
    role: string | null;
    employment_status: string | null;
    bpjs_status: string | null;
    bpjs_number: string | null;
    bpjs_type: string | null;
    disability: boolean | null;
    disability_type: string | null;
    is_active: boolean | null;
}

export interface OutputDocument {
    label: string;
    url: string;
}

export interface OutputDetail {
    id: string;
    report_month: number;
    report_year: number;
    verifikasi: string;
    catatan_verifikasi: string;
    note_confirmation: string;
    lpj_status: boolean;
    created_at: string;
    updated_at: string;

    omzet: number;
    kapasitas_produksi: number;
    satuan_produksi: string;
    volume_penjualan: number;
    satuan_penjualan: string;
    area_pemasaran: string;

    buku_kas: boolean;
    bukti_buku_kas: string;
    laba_rugi: boolean;
    bukti_laba_rugi: string;

    kondisi_usaha: string;
    kendala: string;

    tenaga_kerja_count: number;
    tenaga_kerja: OutputEmployee[];

    peserta: OutputPeserta;
    pendamping: OutputPendamping;
    dokumenLainnya: OutputDocument[];
}

async function fetchOutputDetail(id: string): Promise<OutputDetail> {
    const res = await fetch(`/api/outputs/${id}`);
    if (!res.ok) {
        throw new Error("Failed to fetch output detail");
    }
    return res.json();
}

export function useOutputDetail(id: string) {
    return useQuery({
        queryKey: ["output-detail", id],
        queryFn: () => fetchOutputDetail(id),
        enabled: !!id,
    });
}
