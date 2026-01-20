
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import ExcelJS from "exceljs";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Output");

        // Define Columns
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

            // Month 0 (Data Awal)
            { header: "Omzet Bulan Data Awal", key: "omzet_m0", width: 20 },
            { header: "Kapasitas Produksi Bulan Data Awal", key: "prod_m0", width: 30 },
            { header: "Volume Penjualan Bulan Data Awal", key: "sales_m0", width: 30 },
            { header: "Area Pemasaran Bulan Data Awal", key: "area_m0", width: 25 },
            { header: "Penerapan Buku Kas Bulan Data Awal", key: "buku_m0", width: 20 },
            { header: "Bukti Buku Kas Bulan Data Awal", key: "bukti_buku_m0", width: 25 },
            { header: "Penerapan Laba Rugi Bulan Data Awal", key: "lr_m0", width: 20 },
            { header: "Bukti Laba Rugi Bulan Data Awal", key: "bukti_lr_m0", width: 25 },
            { header: "Verifikasi Awal", key: "ver_m0", width: 15 },
            { header: "Tenaga Kerja Baru (Data Awal)", key: "tk_m0", width: 20 },

            // Month 1
            { header: "Omzet Bulan 1", key: "omzet_m1", width: 20 },
            { header: "Kapasitas Produksi Bulan 1", key: "prod_m1", width: 30 },
            { header: "Volume Penjualan Bulan 1", key: "sales_m1", width: 30 },
            { header: "Area Pemasaran Bulan 1", key: "area_m1", width: 25 },
            { header: "Penerapan Buku Kas Bulan 1", key: "buku_m1", width: 20 },
            { header: "Bukti Buku Kas Bulan 1", key: "bukti_buku_m1", width: 25 },
            { header: "Penerapan Laba Rugi Bulan 1", key: "lr_m1", width: 20 },
            { header: "Bukti Laba Rugi Bulan 1", key: "bukti_lr_m1", width: 25 },
            { header: "Verifikasi 1", key: "ver_m1", width: 15 },
            { header: "Tenaga Kerja Baru (Bulan 1)", key: "tk_m1", width: 20 },

            // Month 2
            { header: "Omzet Bulan 2", key: "omzet_m2", width: 20 },
            { header: "Kapasitas Produksi Bulan 2", key: "prod_m2", width: 30 },
            { header: "Volume Penjualan Bulan 2", key: "sales_m2", width: 30 },
            { header: "Area Pemasaran Bulan 2", key: "area_m2", width: 25 },
            { header: "Penerapan Buku Kas Bulan 2", key: "buku_m2", width: 20 },
            { header: "Bukti Buku Kas Bulan 2", key: "bukti_buku_m2", width: 25 },
            { header: "Penerapan Laba Rugi Bulan 2", key: "lr_m2", width: 20 },
            { header: "Bukti Laba Rugi Bulan 2", key: "bukti_lr_m2", width: 25 },
            { header: "Verifikasi 2", key: "ver_m2", width: 15 },
            { header: "Tenaga Kerja Baru (Bulan 2)", key: "tk_m2", width: 20 },

            // Month 3
            { header: "Omzet Bulan 3", key: "omzet_m3", width: 20 },
            { header: "Kapasitas Produksi Bulan 3", key: "prod_m3", width: 30 },
            { header: "Volume Penjualan Bulan 3", key: "sales_m3", width: 30 },
            { header: "Area Pemasaran Bulan 3", key: "area_m3", width: 25 },
            { header: "Penerapan Buku Kas Bulan 3", key: "buku_m3", width: 20 },
            { header: "Bukti Buku Kas Bulan 3", key: "bukti_buku_m3", width: 25 },
            { header: "Penerapan Laba Rugi Bulan 3", key: "lr_m3", width: 20 },
            { header: "Bukti Laba Rugi Bulan 3", key: "bukti_lr_m3", width: 25 },
            { header: "Verifikasi 3", key: "ver_m3", width: 15 },
            { header: "Tenaga Kerja Baru (Bulan 3)", key: "tk_m3", width: 20 },
        ];

        // Helper for formatting date
        const fmtDate = (d: any) => {
            if (!d) return "";
            const date = new Date(d);
            return date.toISOString().split('T')[0];
        };

        // Calculate Age helper
        const calcAge = (dob: any) => {
            if (!dob) return "";
            const diffMs = Date.now() - new Date(dob).getTime();
            const ageDt = new Date(diffMs);
            return Math.abs(ageDt.getUTCFullYear() - 1970);
        };

        // Fetch base participant data using raw SQL
        const participants: any[] = await prisma.$queryRaw`
      SELECT 
        p.id_tkm,
        p.nama,
        p.nik,
        p.tgl_lahir,
        p.nama_usaha,
        p.jenis_usaha,
        p.sektor_usaha,
        p.alamat_usaha,
        p.kelurahan_usaha,
        p.kecamatan_usaha,
        p.kota_usaha,
        p.provinsi_usaha,
        u.name as pendamping_name,
        prof.nik as pendamping_nik,
        prof.no_wa as pendamping_wa,
        univ.name as universitas
      FROM peserta p
      LEFT JOIN user_peserta up ON up.id_tkm = p.id_tkm 
        AND up.status_peserta = 'active'
      LEFT JOIN users u ON u.id = up.admin_id
      LEFT JOIN profiles prof ON prof.user_id = u.id
      LEFT JOIN universities univ ON univ.id = prof.univ_id
      WHERE p.status != 'Cadangan' OR p.status IS NULL
      ORDER BY p.id_tkm
    `;

        // Fetch all capaian outputs for these participants
        const outputs: any[] = await prisma.$queryRaw`
      SELECT 
        co.id_tkm,
        co.month_report,
        co.revenue,
        co.production_capacity,
        co.production_capacity_unit,
        co.sales_volume,
        co.sales_volume_unit,
        co.marketing_area,
        co.bookkeeping_cashflow,
        co.cashflow_proof_url,
        co.bookkeeping_income_statement,
        co.income_proof_url,
        co.isverified,
        (SELECT COUNT(DISTINCT ne.id) 
         FROM tkm_new_employee ne 
         WHERE ne.capaian_output_id = co.id) as new_employees_count
      FROM capaian_output co
      WHERE co.month_report IN (0, 1, 2, 3)
      ORDER BY co.id_tkm, co.month_report
    `;

        // Group outputs by participant and month
        const outputsByParticipant = new Map<number, Map<number, any>>();
        for (const output of outputs) {
            const idTkm = Number(output.id_tkm);
            if (!outputsByParticipant.has(idTkm)) {
                outputsByParticipant.set(idTkm, new Map());
            }
            outputsByParticipant.get(idTkm)!.set(output.month_report, output);
        }

        // Build rows
        for (const p of participants) {
            const idTkm = Number(p.id_tkm);
            const monthlyOutputs = outputsByParticipant.get(idTkm) || new Map();

            const row: any = {
                id_tkm: idTkm,
                nama: p.nama,
                nik: p.nik,
                tgl_lahir: fmtDate(p.tgl_lahir),
                umur: calcAge(p.tgl_lahir),
                nama_usaha: p.nama_usaha,
                jenis_usaha: p.jenis_usaha,
                sektor_usaha: p.sektor_usaha,
                alamat_usaha: p.alamat_usaha,
                kelurahan_usaha: p.kelurahan_usaha,
                kecamatan_usaha: p.kecamatan_usaha,
                kota_usaha: p.kota_usaha,
                provinsi_usaha: p.provinsi_usaha,

                pendamping: p.pendamping_name || "",
                universitas: p.universitas || "",
                nik_pendamping: p.pendamping_nik || "",
                no_wa_pendamping: p.pendamping_wa || "",
            };

            // Map monthly data
            [0, 1, 2, 3].forEach(m => {
                const data = monthlyOutputs.get(m);
                const suffix = m === 0 ? "_m0" : `_m${m}`;

                if (data) {
                    row[`omzet${suffix}`] = data.revenue || "";
                    row[`prod${suffix}`] = data.production_capacity
                        ? `${data.production_capacity} ${data.production_capacity_unit || ''}`.trim()
                        : "";
                    row[`sales${suffix}`] = data.sales_volume
                        ? `${data.sales_volume} ${data.sales_volume_unit || ''}`.trim()
                        : "";
                    row[`area${suffix}`] = data.marketing_area || "";
                    row[`buku${suffix}`] = data.bookkeeping_cashflow || "";
                    row[`bukti_buku${suffix}`] = data.cashflow_proof_url || "";
                    row[`lr${suffix}`] = data.bookkeeping_income_statement || "";
                    row[`bukti_lr${suffix}`] = data.income_proof_url || "";
                    row[`ver${suffix}`] = data.isverified || "";
                    row[`tk${suffix}`] = Number(data.new_employees_count) || 0;
                } else {
                    // Fill empty if no report
                    row[`omzet${suffix}`] = "";
                    row[`prod${suffix}`] = "";
                    row[`sales${suffix}`] = "";
                    row[`area${suffix}`] = "";
                    row[`buku${suffix}`] = "";
                    row[`bukti_buku${suffix}`] = "";
                    row[`lr${suffix}`] = "";
                    row[`bukti_lr${suffix}`] = "";
                    row[`ver${suffix}`] = "";
                    row[`tk${suffix}`] = 0;
                }
            });

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
