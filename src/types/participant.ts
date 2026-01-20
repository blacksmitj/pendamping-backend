export interface ParticipantDetail {
    // Basic Info
    id_tkm: number;
    nama: string | null;
    nik: string | null;
    status: string | null;
    no_whatsapp: string | null;

    // Personal Data
    tempat_lahir: string | null;
    tgl_lahir: Date | null;
    umur: number | null;
    pendidikan_terakhir: string | null;
    jenis_kelamin: string | null;
    foto: string | null;
    penyandang_disabilitas: boolean | null;
    jenis_disabilitas: string | null;

    // Address Data - KTP
    alamat_ktp: string | null;
    provinsi_ktp: string | null;
    kota_ktp: string | null;
    kecamatan_ktp: string | null;
    kelurahan_ktp: string | null;
    kode_pos_ktp: string | null;

    // Address Data - Domisili
    alamat_domisili_dan_alamat_ktp_sama: boolean | null;
    alamat_domisili: string | null;
    provinsi_domisili: string | null;
    kota_domisili: string | null;
    kecamatan_domisili: string | null;
    kelurahan_domisili: string | null;
    kode_pos_domisili: string | null;

    // Business Data
    nama_usaha: string | null;
    sektor_usaha: string | null;
    jenis_usaha: string | null;
    deskripsi_usaha: string | null;
    produk_utama: string | null;
    aktivitas_saat_ini: string | null;
    omset_per_periode: number | null;
    laba_per_periode: number | null;
    jumlah_produk_per_periode: number | null;
    satuan_jumlah_produk_per_periode: string | null;
    saluran_pemasaran: string | null;
    wilayah_pemasaran: string | null;
    mitra_usaha: string | null;
    jumlah_mitra_usaha: number | null;

    // Business Location
    lokasi_usaha: string | null;
    kepemilikan_lokasi_usaha: string | null;
    alamat_usaha_dan_alamat_domisili_sama: boolean | null;
    alamat_usaha: string | null;
    provinsi_usaha: string | null;
    kota_usaha: string | null;
    kecamatan_usaha: string | null;
    kelurahan_usaha: string | null;
    kode_pos_usaha: string | null;

    // Legality
    nomor_nib: string | null;
    nomor_dokumen_nib: string | null;
    nama_usaha_dokumen_nib: string | null;
    nomor_dokumen_legalitas: string | null;
    nama_dokumen_legalitas: string | null;
    nomor_dokumen_sku: string | null;
    tanggal_dokumen_sku: Date | null;

    // Status & Batch
    batch_pembekalan: string | null;
    tanggal_daftar: Date | null;
    tanggal_submit_pendaftaran: Date | null;
    pleno: string | null;
    ptn_pts: string | null;

    // Contact
    jenis_medsos: string | null;
    nama_medsos: string | null;
    link_media_sosial: string | null;
    nama_kerabat_1: string | null;
    no_kerabat_1: string | null;
    status_kerabat_1: string | null;
    nama_kerabat_2: string | null;
    no_kerabat_2: string | null;
    status_kerabat_2: string | null;

    // Peserta Detail
    pesertaDetail: {
        communicationStatus: string;
        fundDisbursement: string;
        presenceStatus: string;
        willingToBeAssisted: string;
        reasonNotWilling: string | null;
        statusApplicant: string;
        reasonDrop: string | null;
        no_wa: string | null;
        link_map: string | null;
        bmcFile: string | null;
        actionPlanFile: string | null;
    } | null;

    // University
    university: {
        name: string;
        city: string | null;
        province: string | null;
    } | null;
}

export interface Logbook {
    id: string;
    logbookDate: Date | null;
    activitySummary: string | null;
    deliveryMethod: string | null;
    visitType: string | null;
    meetingType: string | null;
    mentoringMaterial: string | null;
    obstacle: string | null;
    solutions: string | null;
    jpl: number | null;
    startTime: Date | null;
    endTime: Date | null;
    totalExpense: number | null;
    reasonNoExpense: string | null;
    verified: string | null;
    note_verified: string | null;
    month_report: number | null;
    groupID: number | null;
    documentationFiles: string[];
    expenseProofFile: string | null;
    pendamping: {
        id: number;
        name: string;
        email: string | null;
    } | null;
    created_at: Date | null;
    updated_at: Date | null;
}

export interface NewEmployee {
    id: number;
    name: string | null;
    nik: string | null;
    role: string | null;
    employment_status: string | null;
    gender: string | null;
    disability: boolean;
    disabilityType: string | null;
    bpjs_status: string | null;
    bpjs_number: string | null;
    bpjs_type: string | null;
    bpjs_card_url: string | null;
    ktp_url: string | null;
    salary_slip_url: string | null;
}

export interface Output {
    id: string;
    month_report: number;

    // Financial Records
    bookkeeping_cashflow: string | null;
    bookkeeping_income_statement: string | null;
    cashflow_proof_url: string | null;
    income_proof_url: string | null;

    // Business Metrics
    sales_volume: number | null;
    sales_volume_unit: string | null;
    production_capacity: number | null;
    production_capacity_unit: string | null;
    revenue: number | null;
    marketing_area: string | null;

    // Conditions
    obstacle: string | null;
    business_condition: string | null;

    // Verification
    isverified: string | null;
    note_verified: string | null;
    note_confirmation: string | null;

    // LPJ
    lpj: string | null;

    // Timestamps
    created_at: Date | null;
    updated_at: Date | null;

    // Mentor
    pendamping: {
        id: number;
        name: string;
        email: string | null;
    } | null;

    // New Employees
    newEmployees: NewEmployee[];
}

export interface OutputSummary {
    totalMonthsReported: number;
    averageRevenue: number;
    totalNewEmployees: number;
}

export interface DocumentItem {
    url: string | null;
    uploaded: boolean;
}

export interface DocumentItemWithMetadata extends DocumentItem {
    number?: string | null;
    businessName?: string | null;
    name?: string | null;
    date?: Date | null;
    location?: string | null;
    signatory?: string | null;
}

export interface DocumentItemMultiple {
    urls: string[];
    uploaded: boolean;
}

export interface ParticipantDocuments {
    personal: {
        ktp: DocumentItem;
        kk: DocumentItem;
        pasFoto: DocumentItem;
    };
    business: {
        profilUsaha: DocumentItem;
        bmc: DocumentItem;
        rab: DocumentItem;
        rencanaPengembangan: DocumentItem;
        videoUsaha: DocumentItem;
        fotoUsaha: DocumentItemMultiple;
        pencatatanKeuangan: DocumentItem;
    };
    legality: {
        nib: DocumentItemWithMetadata;
        legalitas: DocumentItemWithMetadata;
        sku: DocumentItemWithMetadata;
    };
    financial: {
        lpj2024: DocumentItem;
        bast2024: DocumentItem;
        dokumentasiUsaha: DocumentItem;
    };
    application: {
        suratPermohonan: DocumentItem;
        suratPernyataan: DocumentItem;
    };
}

export interface DocumentStats {
    totalDocuments: number;
    uploadedDocuments: number;
    completionPercentage: number;
}

export interface Pagination {
    page: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
}
