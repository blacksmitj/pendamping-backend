import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface MonthlyReportDoc {
    document_id: string;
    documents?: {
        label: string;
        file_url: string;
    } | null;
}

interface BusinessEmployee {
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

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const output = await prisma.monthly_reports.findUnique({
            where: { id },
            include: {
                participants: {
                    include: {
                        profiles: {
                            include: {
                                addresses: {
                                    orderBy: { created_at: 'desc' },
                                    take: 1
                                }
                            }
                        },
                        businesses: {
                            take: 1,
                            include: {
                                business_employees: true
                            }
                        },
                        universities: true
                    }
                },
                mentors: {
                    include: {
                        users: {
                            include: {
                                profiles: {
                                    include: {
                                        universities: true
                                    }
                                }
                            }
                        }
                    }
                },
                monthly_report_documents: {
                    include: { documents: true }
                }
            }
        });

        if (!output) {
            return NextResponse.json(
                { error: "Output not found" },
                { status: 404 }
            );
        }

        // Transform data
        const participant = output.participants;
        const profile = participant?.profiles;
        const business = participant?.businesses?.[0];
        const address = profile?.addresses?.[0];
        const mentor = output.mentors;
        const mentorUser = mentor?.users;
        const mentorProfile = mentorUser?.profiles;
        const mentorUniversity = mentorProfile?.universities;

        // Extract document URLs
        const docs = output.monthly_report_documents || [];
        let buktiBukuKas = "";
        let buktiLabaRugi = "";
        const dokumenLainnya: { label: string; url: string }[] = [];

        (docs as MonthlyReportDoc[]).forEach(d => {
            const label = (d.documents?.label || "").toLowerCase();
            const originalLabel = d.documents?.label || "Dokumen";
            const url = d.documents?.file_url || "";
            if (label.includes("kas") || label.includes("cashflow") || label.includes("buku kas")) {
                buktiBukuKas = url;
            } else if (label.includes("laba") || label.includes("rugi") || label.includes("income")) {
                buktiLabaRugi = url;
            } else if (url) {
                dokumenLainnya.push({ label: originalLabel, url });
            }
        });

        // Transform employee data
        const employees: BusinessEmployee[] = (business?.business_employees || []).map((emp: any) => ({
            id: emp.id,
            name: emp.name,
            nik: emp.nik,
            gender: emp.gender,
            role: emp.role,
            employment_status: emp.employment_status,
            bpjs_status: emp.bpjs_status,
            bpjs_number: emp.bpjs_number,
            bpjs_type: emp.bpjs_type,
            disability: emp.disability,
            disability_type: emp.disability_type,
            is_active: emp.is_active,
        }));

        const data = {
            id: output.id,
            report_month: output.report_month,
            report_year: output.report_year,
            verifikasi: output.is_verified || "pending",
            catatan_verifikasi: output.verification_note || "",
            note_confirmation: output.note_confirmation || "",
            lpj_status: output.lpj_status || false,
            created_at: output.created_at,
            updated_at: output.updated_at,

            // Capaian
            omzet: Number(output.revenue || 0),
            kapasitas_produksi: Number(output.production_capacity || 0),
            satuan_produksi: output.production_unit || "",
            volume_penjualan: Number(output.sales_volume || 0),
            satuan_penjualan: output.sales_unit || "",
            area_pemasaran: output.marketing_area || "",

            // Pembukuan
            buku_kas: output.bookkeeping_cashflow === true,
            bukti_buku_kas: buktiBukuKas,
            laba_rugi: output.bookkeeping_income_statement === true,
            bukti_laba_rugi: buktiLabaRugi,

            // Kondisi
            kondisi_usaha: output.business_condition || "",
            kendala: output.obstacles || "",

            // Tenaga kerja - now includes full details
            tenaga_kerja_count: employees.length,
            tenaga_kerja: employees,

            // Peserta
            peserta: {
                id: participant?.id,
                legacy_tkm_id: participant?.legacy_tkm_id,
                nama: profile?.full_name || "",
                nik: profile?.id_number || "",
                foto: profile?.avatar_url || null,
                no_whatsapp: profile?.whatsapp_number || "",
                nama_usaha: business?.name || "",
                jenis_usaha: business?.type || "",
                sektor_usaha: business?.sector || "",
                alamat_usaha: address?.address_line || "",
                kelurahan_usaha: address?.village_name || "",
                kecamatan_usaha: address?.district_name || "",
                kota_usaha: address?.regency_name || "",
                provinsi_usaha: address?.province_name || "",
                universitas: participant?.universities?.name || "",
            },

            // Pendamping
            pendamping: {
                id: mentor?.id,
                nama: mentorProfile?.full_name || mentorUser?.email || "",
                nik: mentorProfile?.id_number || "",
                foto: mentorProfile?.avatar_url || null,
                no_whatsapp: mentorProfile?.whatsapp_number || "",
                email: mentorUser?.email || "",
                universitas: mentorUniversity?.name || "",
            },

            dokumenLainnya,
        };

        return NextResponse.json(data);
    } catch (error) {
        console.error("[output detail] Failed to fetch", error);
        return NextResponse.json(
            { error: "Failed to fetch output" },
            { status: 500 }
        );
    }
}
