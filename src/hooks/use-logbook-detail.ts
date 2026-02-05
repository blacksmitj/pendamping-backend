import { useQuery } from "@tanstack/react-query";

export interface LogbookAttendee {
    id: string;
    legacy_tkm_id: string | null;
    nama: string;
    nik: string;
    foto: string | null;
    nama_usaha: string;
    jenis_usaha: string;
    sektor_usaha: string;
    alamat_usaha: string;
    kelurahan_usaha: string;
    kecamatan_usaha: string;
    kota_usaha: string;
    provinsi_usaha: string;
    universitas: string;
    no_whatsapp: string;
}

export interface LogbookPendamping {
    id: string;
    nama: string;
    nik: string;
    foto: string | null;
    no_whatsapp: string;
    jenis_kelamin: string;
    email: string;
    universitas: string;
}

export interface LogbookDetail {
    id: string;
    tanggal: string;
    metode: string;
    jenis_kunjungan: string;
    jenis_pertemuan: string;
    jam_mulai: string;
    jam_selesai: string;
    jpl: number;
    materi: string;
    ringkasan_kegiatan: string;
    kendala: string;
    solusi: string;
    total_expense: number;
    alasan_tdk_expense: string;
    catatan_verifikasi: string;
    verifikasi: string;
    created_at: string;
    updated_at: string;
    isGroup: boolean;
    attendeeCount: number;
    attendees: LogbookAttendee[];
    pendamping: LogbookPendamping;
    dokumentasi: string[];
    buktiExpense: string[];
}

async function fetchLogbookDetail(id: string): Promise<LogbookDetail> {
    const res = await fetch(`/api/logbooks/${id}`);
    if (!res.ok) {
        throw new Error("Failed to fetch logbook detail");
    }
    return res.json();
}

export function useLogbookDetail(id: string) {
    return useQuery({
        queryKey: ["logbook-detail", id],
        queryFn: () => fetchLogbookDetail(id),
        enabled: !!id,
    });
}
