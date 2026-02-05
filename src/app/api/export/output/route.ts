
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import ExcelJS from "exceljs";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        // Filters
        const status = searchParams.get("status"); // active, drop, pending (comma separated)
        // verified here could mean LPJ status or is_verified in monthly reports
        const verified = searchParams.get("verified"); // approved, rejected, pending (comma separated)
        const universityStatus = searchParams.get("university_status"); // active, inactive
        const columnsParam = searchParams.get("columns"); // comma separated keys

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Output");

        // Define All Possible Columns
        const staticColumns = [
            { header: "ID TKM", key: "id_tkm", width: 15 },
            { header: "Nama", key: "nama", width: 25 },
            { header: "NIK", key: "nik", width: 20 },
            { header: "Tanggal Lahir", key: "tgl_lahir", width: 15 },
            { header: "Umur", key: "umur", width: 10 },
            { header: "Nama Usaha", key: "nama_usaha", width: 25 },
            { header: "Jenis Usaha", key: "jenis_usaha", width: 20 },
            { header: "Sektor Usaha", key: "sektor_usaha", width: 20 },
            { header: "Alamat Usaha", key: "alamat_usaha", width: 30 },
            { header: "Kelurahan Usaha", key: "kelurahan_usaha", width: 20 },
            { header: "Kecamatan Usaha", key: "kecamatan_usaha", width: 20 },
            { header: "Kota Usaha", key: "kota_usaha", width: 20 },
            { header: "Provinsi Usaha", key: "provinsi_usaha", width: 20 },

            { header: "Pendamping", key: "pendamping", width: 25 },
            { header: "Universitas", key: "universitas", width: 25 },
            { header: "NIK Pendamping", key: "nik_pendamping", width: 20 },
            { header: "NO WA Pendamping", key: "no_wa_pendamping", width: 20 },
            { header: "Bersedia Didampingi", key: "bersedia_didampingi", width: 25 },
            { header: "Dapat Ditemukan", key: "kehadiran", width: 20 },
            { header: "State", key: "state_peserta", width: 15 },
            { header: "Status", key: "status_peserta", width: 15 },
            { header: "Alasan Drop", key: "alasan_drop", width: 30 },
        ];

        const monthColumns = [0, 1, 2, 3].map(m => ([
            { header: `Omzet Bulan ${m}`, key: `omzet_m${m}`, width: 20 },
            { header: `Kapasitas Produksi Bulan ${m}`, key: `prod_m${m}`, width: 30 },
            { header: `Volume Penjualan Bulan ${m}`, key: `sales_m${m}`, width: 30 },
            { header: `Area Pemasaran Bulan ${m}`, key: `area_m${m}`, width: 25 },
            { header: `Penerapan Buku Kas Bulan ${m}`, key: `buku_m${m}`, width: 20 },
            { header: `Bukti Buku Kas Bulan ${m}`, key: `bukti_buku_m${m}`, width: 25 },
            { header: `Penerapan Laba Rugi Bulan ${m}`, key: `lr_m${m}`, width: 20 },
            { header: `Bukti Laba Rugi Bulan ${m}`, key: `bukti_lr_m${m}`, width: 25 },
            { header: `Verifikasi ${m}`, key: `ver_m${m}`, width: 15 },
            { header: `Tenaga Kerja Baru (Bulan ${m})`, key: `tk_m${m}`, width: 20 },
        ])).flat();

        const allColumns = [...staticColumns, ...monthColumns];

        // Apply column selection
        if (columnsParam) {
            const requestedKeys = columnsParam.split(",");
            worksheet.columns = allColumns.filter(col => requestedKeys.includes(col.key || ""));
        } else {
            worksheet.columns = allColumns;
        }

        // Build Where Clause
        const where: any = {};
        if (status) {
            where.status = { in: status.split(",") };
        }

        // University status filter
        if (universityStatus && universityStatus !== "all") {
            where.universities = {
                status: universityStatus
            };
        }

        // Fetch participants
        const participants = await prisma.participants.findMany({
            where,
            include: {
                profiles: {
                    include: {
                        users: true,
                        addresses: {
                            orderBy: { created_at: 'desc' },
                            take: 1
                        }
                    }
                },
                businesses: {
                    include: {
                        business_employees: true
                    }
                },
                monthly_reports: {
                    where: verified ? { is_verified: { in: verified.split(",") } } : undefined,
                    include: {
                        monthly_report_documents: {
                            include: { documents: true }
                        }
                    },
                    orderBy: [
                        { report_year: 'asc' },
                        { report_month: 'asc' }
                    ]
                },
                mentor_participants: {
                    where: { assignment_status: 'active' },
                    include: {
                        mentors: {
                            include: {
                                users: {
                                    include: { profiles: true }
                                }
                            }
                        }
                    },
                    take: 1
                },
                universities: true
            }
        });

        for (const p of participants) {
            const profile = p.profiles;
            const user = profile?.users;
            const business = p.businesses?.[0];
            const address = profile?.addresses?.[0];
            const mentorAssignment = p.mentor_participants?.[0];
            const mentor = mentorAssignment?.mentors;
            const mentorUser = mentor?.users;
            const mentorProfile = mentorUser?.profiles;

            const pReports = p.monthly_reports || [];

            const row: any = {
                id_tkm: p.legacy_tkm_id,
                nama: profile?.full_name || user?.email || "Unknown",
                nik: profile?.id_number || "",
                tgl_lahir: profile?.dob ? new Date(profile.dob).toISOString().split('T')[0] : "",
                umur: profile?.dob ? (new Date().getFullYear() - new Date(profile.dob).getFullYear()) : "",
                nama_usaha: business?.name || "",
                jenis_usaha: business?.type || "",
                sektor_usaha: business?.sector || "",
                alamat_usaha: address?.address_line || "",
                kelurahan_usaha: address?.village_name || "",
                kecamatan_usaha: address?.district_name || "",
                kota_usaha: address?.regency_name || "",
                provinsi_usaha: address?.province_name || "",
                pendamping: mentorProfile?.full_name || mentorUser?.email || "",
                universitas: p.universities?.name || "",
                nik_pendamping: mentorProfile?.id_number || "",
                no_wa_pendamping: mentorProfile?.whatsapp_number || "",
                bersedia_didampingi: p.willing_to_be_assisted || "",
                kehadiran: p.presence_status || "",
                status_peserta: p.status || "",
                state_peserta: p.state || "",
                alasan_drop: p.reason_drop || "",
            };

            // Map up to 4 reports (m0 to m3)
            for (let i = 0; i < 4; i++) {
                const report = pReports[i];
                const key = `_m${i}`;
                if (report) {
                    // Extract document URLs for buku kas and laba rugi
                    const docs = (report as any).monthly_report_documents || [];
                    let buktiBukuKas = "";
                    let buktiLabaRugi = "";

                    for (const doc of docs) {
                        const label = (doc.documents?.label || "").toLowerCase();
                        const url = doc.documents?.file_url || "";
                        if (label.includes("kas") || label.includes("cashflow") || label.includes("buku kas")) {
                            buktiBukuKas = url;
                        } else if (label.includes("laba") || label.includes("rugi") || label.includes("income")) {
                            buktiLabaRugi = url;
                        }
                    }

                    row[`omzet${key}`] = Number(report.revenue || 0);
                    row[`prod${key}`] = `${report.production_capacity || 0} ${report.production_unit || ''}`.trim();
                    row[`sales${key}`] = `${report.sales_volume || 0} ${report.sales_unit || ''}`.trim();
                    row[`area${key}`] = report.marketing_area || "";
                    row[`buku${key}`] = report.bookkeeping_cashflow ? "Ya" : "Tidak";
                    row[`bukti_buku${key}`] = buktiBukuKas;
                    row[`lr${key}`] = report.bookkeeping_income_statement ? "Ya" : "Tidak";
                    row[`bukti_lr${key}`] = buktiLabaRugi;
                    row[`ver${key}`] = report.is_verified || "pending";
                    row[`tk${key}`] = business?.business_employees?.length || 0;
                } else {
                    row[`omzet${key}`] = "";
                    row[`prod${key}`] = "";
                    row[`sales${key}`] = "";
                    row[`area${key}`] = "";
                    row[`buku${key}`] = "";
                    row[`bukti_buku${key}`] = "";
                    row[`lr${key}`] = "";
                    row[`bukti_lr${key}`] = "";
                    row[`ver${key}`] = "";
                    row[`tk${key}`] = "";
                }
            }
            worksheet.addRow(row);
        }

        const fileName = `OutputDetail_${new Date().getTime()}.xlsx`;
        const buffer = await workbook.xlsx.writeBuffer();

        // Log the export
        await prisma.export_logs.create({
            data: {
                filename: fileName,
                type: "output",
                filters: { status, verified, columns: columnsParam },
                status: "completed"
            }
        });

        return new Response(buffer, {
            status: 200,
            headers: {
                'Content-Disposition': `attachment; filename="${fileName}"`,
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            },
        });
    } catch (error) {
        console.error("Export Error:", error);
        return NextResponse.json({ error: "Failed to generate export" }, { status: 500 });
    }
}
