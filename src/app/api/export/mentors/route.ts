
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import ExcelJS from "exceljs";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Daftar Pendamping");

        // Fetch Mentors with relations and active participant counts
        const mentors = await prisma.mentors.findMany({
            include: {
                users: {
                    include: {
                        profiles: {
                            include: {
                                universities: true,
                                addresses: {
                                    include: {
                                        provinces: true,
                                        regencies: true,
                                        districts: true,
                                        villages: true
                                    }
                                }
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        mentor_participants: {
                            where: {
                                assignment_status: "active"
                            }
                        }
                    }
                }
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        // Collect all unique labels for address headers
        const uniqueLabelsSet = new Set<string>();
        mentors.forEach(m => {
            m.users?.profiles?.addresses?.forEach(addr => {
                if (addr.label) {
                    uniqueLabelsSet.add(addr.label);
                }
            });
        });

        const sortedLabels = Array.from(uniqueLabelsSet).sort((a, b) => {
            const aLower = a.toLowerCase();
            const bLower = b.toLowerCase();
            // Prioritize KTP, then Domisili, then others
            if (aLower.includes("ktp")) return -1;
            if (bLower.includes("ktp")) return 1;
            if (aLower.includes("domisili")) return -1;
            if (bLower.includes("domisili")) return 1;
            return a.localeCompare(b);
        });

        // Helper to get address part with fallback to master tables
        const getAddressPart = (addr: any, type: 'province' | 'regency' | 'district' | 'village') => {
            if (!addr) return "";
            
            // Try specific name field first
            const nameField = `${type}_name`;
            if (addr[nameField]) return addr[nameField];
            
            // Fallback to relation name
            const relationName = type === 'province' ? 'provinces' : 
                                 type === 'regency' ? 'regencies' : 
                                 type === 'district' ? 'districts' : 'villages';
            
            return addr[relationName]?.name || "";
        };

        // Helper to calculate age from birth date
        const calculateAge = (dob: Date | string | null | undefined) => {
            if (!dob) return "";
            const birthDate = new Date(dob);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            return age;
        };

        // Define Columns Dynamically
        const columns: any[] = [
            { header: "Nama Pendamping (KTP)", key: "nama_ktp", width: 25 },
            { header: "NIK", key: "nik", width: 20 },
            { header: "Tanggal Lahir", key: "tgl_lahir_siapkerja", width: 15 },
            { header: "Gender", key: "gender", width: 15 },
        ];

        // Add Dynamic Address Columns
        for (const label of sortedLabels) {
            columns.push(
                { header: `Alamat Lengkap ${label}`, key: `alamat_${label}`, width: 30 },
                { header: `Kelurahan ${label}`, key: `kelurahan_${label}`, width: 20 },
                { header: `Kecamatan ${label}`, key: `kecamatan_${label}`, width: 20 },
                { header: `Kab/Kota ${label}`, key: `kab_kota_${label}`, width: 20 },
                { header: `Provinsi ${label}`, key: `provinsi_${label}`, width: 20 },
                { header: `Kode Pos ${label}`, key: `kode_pos_${label}`, width: 15 }
            );
        }

        // Add Base Columns After
        columns.push(
            { header: "No Telp/WA", key: "no_telp_wa", width: 20 },
            { header: "Email", key: "email", width: 25 },
            { header: "Universitas", key: "universitas", width: 25 },
            { header: "Umur", key: "umur", width: 10 },
            { header: "Jumlah Peserta Didampingi", key: "total_peserta", width: 25 },
            { header: "Tanggal Terdaftar", key: "created_at", width: 20 },
        );

        worksheet.columns = columns;

        for (const mentor of mentors) {
            const user = mentor.users;
            const profile = user?.profiles;
            const university = profile?.universities;
            const addresses = profile?.addresses || [];

            const row: any = {
                nama_ktp: profile?.full_name || "",
                nik: profile?.id_number || "",
                tgl_lahir_siapkerja: profile?.dob ? new Date(profile.dob).toISOString().split('T')[0] : "",
                gender: profile?.gender || "",
                no_telp_wa: profile?.whatsapp_number || "",
                email: user?.email || "",
                universitas: university?.name || "",
                umur: calculateAge(profile?.dob),
                total_peserta: mentor._count?.mentor_participants || 0,
                created_at: mentor.created_at ? new Date(mentor.created_at).toISOString().split('T')[0] : "",
            };

            // Map addresses for this mentor to labels
            for (const label of sortedLabels) {
                const addr = addresses.find(a => a.label === label);
                if (addr) {
                    row[`alamat_${label}`] = addr.address_line || "";
                    row[`kelurahan_${label}`] = getAddressPart(addr, 'village');
                    row[`kecamatan_${label}`] = getAddressPart(addr, 'district');
                    row[`kab_kota_${label}`] = getAddressPart(addr, 'regency');
                    row[`provinsi_${label}`] = getAddressPart(addr, 'province');
                    row[`kode_pos_${label}`] = addr.postal_code || "";
                } else {
                    row[`alamat_${label}`] = "";
                    row[`kelurahan_${label}`] = "";
                    row[`kecamatan_${label}`] = "";
                    row[`kab_kota_${label}`] = "";
                    row[`provinsi_${label}`] = "";
                    row[`kode_pos_${label}`] = "";
                }
            }

            worksheet.addRow(row);
        }

        const fileName = `DaftarPendampingDetail_${new Date().getTime()}.xlsx`;
        const buffer = await workbook.xlsx.writeBuffer();

        return new Response(buffer, {
            status: 200,
            headers: {
                'Content-Disposition': `attachment; filename="${fileName}"`,
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            },
        });
    } catch (error) {
        console.error("Mentor Export Error:", error);
        return NextResponse.json({ error: "Failed to generate mentor export" }, { status: 500 });
    }
}
