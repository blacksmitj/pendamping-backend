
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import ExcelJS from "exceljs";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Output");

        // Define Columns (Same as before for consistency)
        worksheet.columns = [
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

            // Month 0 (Placeholder or actual month if mapped)
            ...[0, 1, 2, 3].map(m => ([
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
            ])).flat()
        ];

        // Fetch participants with their businesses and reports
        const dataRaw: any[] = await prisma.$queryRaw`
            SELECT 
                p.id,
                p.legacy_tkm_id as id_tkm,
                u.username as nama,
                prof.id_number as nik,
                prof.dob as tgl_lahir,
                b.name as nama_usaha,
                b.type as jenis_usaha,
                b.sector as sektor_usaha,
                addr.address_line as alamat_usaha,
                v.name as kelurahan_usaha,
                d.name as kecamatan_usaha,
                r.name as kota_usaha,
                prov.name as provinsi_usaha,
                
                -- Mentor Info
                mentor_u.username as pendamping_name,
                mentor_prof.id_number as pendamping_nik,
                mentor_prof.whatsapp_number as pendamping_wa
                
            FROM participants p
            LEFT JOIN profiles prof ON p.profile_id = prof.id
            LEFT JOIN users u ON prof.user_id = u.id
            LEFT JOIN businesses b ON p.id = b.participant_id
            LEFT JOIN (
                SELECT DISTINCT ON (profile_id) * FROM addresses ORDER BY profile_id, created_at DESC
            ) addr ON prof.id = addr.profile_id
            LEFT JOIN villages v ON addr.village_id = v.id
            LEFT JOIN districts d ON addr.district_id = d.id
            LEFT JOIN regencies r ON addr.regency_id = r.id
            LEFT JOIN provinces prov ON addr.province_id = prov.id
            
            -- Assuming one active mentor per participant for export
            LEFT JOIN mentor_participants mp ON p.id = mp.participant_id AND mp.assignment_status = 'active'
            LEFT JOIN mentors m ON mp.mentor_id = m.id
            LEFT JOIN users mentor_u ON m.user_id = mentor_u.id
            LEFT JOIN profiles mentor_prof ON mentor_u.id = mentor_prof.user_id
            
            WHERE p.status != 'Cadangan' OR p.status IS NULL
        `;

        // Fetch monthly reports for all these participants
        const reportsRaw: any[] = await prisma.$queryRaw`
            SELECT 
                mr.participant_id,
                mr.report_month,
                mr.report_year,
                mr.revenue,
                mr.production_capacity,
                mr.production_unit,
                mr.sales_volume,
                mr.sales_unit,
                mr.marketing_area,
                mr.bookkeeping_cashflow,
                mr.bookkeeping_income_statement,
                mr.is_verified,
                CAST((SELECT COUNT(*) FROM business_employees be WHERE be.business_id = b.id) AS INTEGER) as employee_count
            FROM monthly_reports mr
            LEFT JOIN businesses b ON mr.participant_id = b.participant_id
        `;

        // Helper to group reports. In legacy it was month 0,1,2,3. 
        // We'll map the reports sequentially or by some logic if available.
        // For now, let's group by participant and take first 4 reports.
        const reportsByParticipant = new Map<string, any[]>();
        for (const report of reportsRaw) {
            const pid = String(report.participant_id);
            if (!reportsByParticipant.has(pid)) reportsByParticipant.set(pid, []);
            reportsByParticipant.get(pid)!.push(report);
        }

        for (const p of dataRaw) {
            const pid = String(p.id);
            const pReports = (reportsByParticipant.get(pid) || [])
                .sort((a, b) => (a.report_year * 12 + a.report_month) - (b.report_year * 12 + b.report_month));

            const row: any = {
                id_tkm: p.id_tkm,
                nama: p.nama || "Unknown",
                nik: p.nik || "",
                tgl_lahir: p.tgl_lahir ? new Date(p.tgl_lahir).toISOString().split('T')[0] : "",
                umur: p.tgl_lahir ? (new Date().getFullYear() - new Date(p.tgl_lahir).getFullYear()) : "",
                nama_usaha: p.nama_usaha || "",
                jenis_usaha: p.jenis_usaha || "",
                sektor_usaha: p.sektor_usaha || "",
                alamat_usaha: p.alamat_usaha || "",
                kelurahan_usaha: p.kelurahan_usaha || "",
                kecamatan_usaha: p.kecamatan_usaha || "",
                kota_usaha: p.kota_usaha || "",
                provinsi_usaha: p.provinsi_usaha || "",
                pendamping: p.pendamping_name || "",
                universitas: "", 
                nik_pendamping: p.pendamping_nik || "",
                no_wa_pendamping: p.pendamping_wa || "",
            };

            // Map up to 4 reports (m0 to m3)
            for (let i = 0; i < 4; i++) {
                const report = pReports[i];
                const key = `_m${i}`;
                if (report) {
                    row[`omzet${key}`] = Number(report.revenue || 0);
                    row[`prod${key}`] = `${report.production_capacity || 0} ${report.production_unit || ''}`.trim();
                    row[`sales${key}`] = `${report.sales_volume || 0} ${report.sales_unit || ''}`.trim();
                    row[`area${key}`] = report.marketing_area || "";
                    row[`buku${key}`] = report.bookkeeping_cashflow ? "Ya" : "Tidak";
                    row[`bukti_buku${key}`] = ""; // Files complex to join here
                    row[`lr${key}`] = report.bookkeeping_income_statement ? "Ya" : "Tidak";
                    row[`bukti_lr${key}`] = "";
                    row[`ver${key}`] = report.is_verified || "pending";
                    row[`tk${key}`] = report.employee_count || 0;
                } else {
                    row[`omzet${key}`] = "";
                    row[`prod${key}`] = "";
                    row[`sales${key}`] = "";
                    row[`area${key}`] = "";
                    row[`buku${key}`] = "";
                    row[`lr${key}`] = "";
                    row[`ver${key}`] = "";
                    row[`tk${key}`] = "";
                }
            }
            worksheet.addRow(row);
        }

        const buffer = await workbook.xlsx.writeBuffer();
        return new Response(buffer, {
            status: 200,
            headers: {
                'Content-Disposition': 'attachment; filename="Output.xlsx"',
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            },
        });
    } catch (error) {
        console.error("Export Error:", error);
        return NextResponse.json({ error: "Failed to generate export" }, { status: 500 });
    }
}
