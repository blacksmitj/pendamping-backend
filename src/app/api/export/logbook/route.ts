
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import ExcelJS from "exceljs";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        // Filters
        const status = searchParams.get("status"); // active, drop, pending (comma separated)
        const verified = searchParams.get("verified"); // approved, rejected, pending (comma separated)
        const dateStart = searchParams.get("date_start"); // YYYY-MM-DD
        const dateEnd = searchParams.get("date_end"); // YYYY-MM-DD
        const universityStatus = searchParams.get("university_status"); // active, inactive
        const columnsParam = searchParams.get("columns"); // comma separated keys

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Logbook Detail");

        // Define All Possible Columns
        const allColumns = [
            { header: "Tanggal", key: "tanggal", width: 15 },
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
            { header: "Link Map Usaha Baru", key: "link_map_usaha_baru", width: 30 },
            { header: "No WhatsApp", key: "no_whatsapp", width: 20 },
            { header: "No WhatsApp Baru", key: "no_whatsapp_baru", width: 20 },
            { header: "Penyandang Disabilitas", key: "penyandang_disabilitas", width: 20 },
            { header: "Jenis Disabilitas", key: "jenis_disabilitas", width: 20 },

            // Pendamping Info
            { header: "Nama Pendamping", key: "nama_pendamping", width: 25 },
            { header: "NIK Pendamping", key: "nik_pendamping", width: 20 },
            { header: "WA Pendamping", key: "wa_pendamping", width: 20 },
            { header: "Jenis Kelamin Pendamping", key: "jenis_kelamin_pendamping", width: 20 },
            { header: "Univ", key: "univ", width: 25 },
            { header: "Email Pendamping", key: "email_pendamping", width: 25 },

            // Status Info
            { header: "Status Komunikasi", key: "status_komunikasi", width: 20 },
            { header: "Pencairan Dana Bantuan", key: "pencairan_dana_bantuan", width: 20 },
            { header: "Bersedia Didampingi", key: "bersedia_didampingi", width: 20 },
            { header: "Alasan Tidak Didampingi", key: "alasan_tdk_didampingi", width: 30 },
            { header: "Keberadaan TKM", key: "keberadaan_tkml", width: 20 },
            { header: "Status Kepesertaan TKML", key: "status_kepesertaan_tkml", width: 20 },

            // Logbook Info
            { header: "Metode", key: "metode", width: 15 },
            { header: "Jam Mulai", key: "jam_mulai", width: 10 },
            { header: "Jam Selesai", key: "jam_selesai", width: 10 },
            { header: "JPL", key: "jpl", width: 10 },
            { header: "Materi", key: "materi", width: 30 },
            { header: "Dokumentasi", key: "dokumentasi", width: 30 },
            { header: "Ringkasan Kegiatan", key: "ringakasan_kegiatan", width: 40 },
            { header: "Kendala", key: "kendala", width: 30 },
            { header: "Solusi Kendala", key: "solusikendala", width: 30 },
            { header: "Rincian Biaya", key: "rincian_biaya", width: 30 },
            { header: "Alasan Tidak Expense", key: "alasan_tdk_expense", width: 30 },
            { header: "Total Expense", key: "total_expense", width: 15 },
            { header: "Jenis Kunjungan", key: "jenis_kunjungan", width: 20 },
            { header: "Jenis Pertemuan", key: "jenis_pertemuan", width: 20 },

            // Other
            { header: "Temu Bisnis", key: "temu_bisnis", width: 15 },
            { header: "Alasan Direkomendasikan", key: "alasan_direkomendasikan", width: 30 },
            { header: "Catatan Verifikasi", key: "catatan_verifikasi", width: 30 },
            { header: "Verifikasi", key: "verifikasi", width: 15 },
        ];

        // Apply column selection
        if (columnsParam) {
            const requestedKeys = columnsParam.split(",");
            worksheet.columns = allColumns.filter(col => requestedKeys.includes(col.key || ""));
        } else {
            worksheet.columns = allColumns;
        }

        // Build Where Clause for Logbooks
        const where: any = {};

        if (verified) {
            where.is_verified = { in: verified.split(",") };
        }

        if (dateStart || dateEnd) {
            where.activity_date = {};
            if (dateStart) where.activity_date.gte = new Date(dateStart);
            if (dateEnd) where.activity_date.lte = new Date(dateEnd);
        }

        // Participant status filter needs to be applied in the relation
        const participantWhere: any = {};
        if (status) {
            participantWhere.status = { in: status.split(",") };
        }

        // University status filter
        if (universityStatus && universityStatus !== "all") {
            participantWhere.universities = {
                status: universityStatus
            };
        }

        // Fetch logbooks with attendees - optimized query with select
        const logbooks = await prisma.logbooks.findMany({
            where,
            select: {
                id: true,
                activity_date: true,
                delivery_method: true,
                start_time: true,
                end_time: true,
                jpl: true,
                mentoring_material: true,
                activity_summary: true,
                obstacles: true,
                solutions: true,
                no_expense_reason: true,
                expense_amount: true,
                visit_type: true,
                meeting_type: true,
                verification_note: true,
                is_verified: true,
                logbook_attendees: {
                    where: {
                        participants: participantWhere
                    },
                    select: {
                        participants: {
                            select: {
                                id: true,
                                legacy_tkm_id: true,
                                whatsapp_number_new: true,
                                disability_status: true,
                                disability_type: true,
                                communication_status: true,
                                fund_disbursement: true,
                                willing_to_be_assisted: true,
                                reason_not_willing: true,
                                presence_status: true,
                                status_kepesertaan: true,
                                status: true,
                                profiles: {
                                    select: {
                                        full_name: true,
                                        id_number: true,
                                        dob: true,
                                        age: true,
                                        whatsapp_number: true,
                                        addresses: {
                                            orderBy: { created_at: 'desc' },
                                            take: 1,
                                            select: {
                                                address_line: true,
                                                village_name: true,
                                                district_name: true,
                                                regency_name: true,
                                                province_name: true,
                                                google_maps_link: true
                                            }
                                        }
                                    }
                                },
                                businesses: {
                                    take: 1,
                                    select: {
                                        name: true,
                                        type: true,
                                        sector: true
                                    }
                                },
                                universities: {
                                    select: { name: true }
                                },
                                mentor_participants: {
                                    where: { assignment_status: 'active' },
                                    take: 1,
                                    select: {
                                        is_temu_bisnis: true,
                                        reason_recommend: true
                                    }
                                }
                            }
                        }
                    }
                },
                mentors: {
                    select: {
                        users: {
                            select: {
                                email: true,
                                profiles: {
                                    select: {
                                        full_name: true,
                                        id_number: true,
                                        whatsapp_number: true,
                                        gender: true
                                    }
                                }
                            }
                        }
                    }
                },
                logbook_documents: {
                    select: {
                        documents: {
                            select: {
                                label: true,
                                file_url: true
                            }
                        }
                    }
                }
            },
            orderBy: { activity_date: 'desc' }
        });

        for (const logbook of logbooks) {
            const mentor = logbook.mentors;
            const mentorUser = mentor?.users;
            const mentorProfile = (mentorUser as any)?.profiles;

            const docs = logbook.logbook_documents || [];
            const documentationUrls: string[] = [];
            const expenseProofUrls: string[] = [];

            docs.forEach(d => {
                const label = (d.documents.label || "").toLowerCase();
                const url = d.documents.file_url;
                if (label.includes("biaya") || label.includes("kwitansi") || label.includes("invoice") || label.includes("struk") || label.includes("expense")) {
                    expenseProofUrls.push(url);
                } else {
                    documentationUrls.push(url);
                }
            });

            // Each attendee is a row
            for (const attendee of logbook.logbook_attendees) {
                const p = attendee.participants;
                if (!p) continue;

                const profile = p.profiles;
                const business = p.businesses?.[0];
                const address = profile?.addresses?.[0];
                const mentorAsg = p.mentor_participants?.[0];

                const row: any = {
                    tanggal: logbook.activity_date ? new Date(logbook.activity_date).toISOString().split('T')[0] : "",
                    id_tkm: p.legacy_tkm_id,
                    nama: profile?.full_name || "",
                    nik: profile?.id_number || "",
                    tgl_lahir: profile?.dob ? new Date(profile.dob).toISOString().split('T')[0] : "",
                    umur: profile?.age || "",
                    nama_usaha: business?.name || "",
                    jenis_usaha: business?.type || "",
                    sektor_usaha: business?.sector || "",
                    alamat_usaha: address?.address_line || "",
                    kelurahan_usaha: address?.village_name || "",
                    kecamatan_usaha: address?.district_name || "",
                    kota_usaha: address?.regency_name || "",
                    provinsi_usaha: address?.province_name || "",
                    link_map_usaha_baru: address?.google_maps_link || "",
                    no_whatsapp: profile?.whatsapp_number || "",
                    no_whatsapp_baru: p.whatsapp_number_new || "",
                    penyandang_disabilitas: p.disability_status ? "Ya" : "Tidak",
                    jenis_disabilitas: p.disability_type || "",

                    nama_pendamping: mentorProfile?.full_name || mentorUser?.email || "",
                    nik_pendamping: mentorProfile?.id_number || "",
                    wa_pendamping: mentorProfile?.whatsapp_number || "",
                    jenis_kelamin_pendamping: mentorProfile?.gender || "",
                    univ: p.universities?.name || "",
                    email_pendamping: mentorUser?.email || "",

                    status_komunikasi: p.communication_status || "",
                    pencairan_dana_bantuan: p.fund_disbursement || "",
                    bersedia_didampingi: p.willing_to_be_assisted || "",
                    alasan_tdk_didampingi: p.reason_not_willing || "",
                    keberadaan_tkml: p.presence_status || "",
                    status_kepesertaan_tkml: p.status_kepesertaan || p.status || "",

                    metode: logbook.delivery_method || "",
                    jam_mulai: logbook.start_time ? new Date(logbook.start_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : "",
                    jam_selesai: logbook.end_time ? new Date(logbook.end_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : "",
                    jpl: logbook.jpl || 0,
                    materi: logbook.mentoring_material || "",
                    dokumentasi: documentationUrls.join(", "),
                    ringakasan_kegiatan: logbook.activity_summary || "",
                    kendala: logbook.obstacles || "",
                    solusikendala: logbook.solutions || "",
                    rincian_biaya: expenseProofUrls.join(", "),
                    alasan_tdk_expense: logbook.no_expense_reason || "",
                    total_expense: Number(logbook.expense_amount || 0),
                    jenis_kunjungan: logbook.visit_type || "",
                    jenis_pertemuan: logbook.meeting_type || "",

                    temu_bisnis: mentorAsg?.is_temu_bisnis ? "Ya" : "Tidak",
                    alasan_direkomendasikan: mentorAsg?.reason_recommend || "",
                    catatan_verifikasi: logbook.verification_note || "",
                    verifikasi: logbook.is_verified || "pending",
                };

                worksheet.addRow(row);
            }
        }

        const fileName = `LogbookDetail_${new Date().getTime()}.xlsx`;
        const buffer = await workbook.xlsx.writeBuffer();

        // Log the export
        await prisma.export_logs.create({
            data: {
                filename: fileName,
                type: "logbook",
                filters: { status, verified, dateStart, dateEnd, columns: columnsParam },
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
        return NextResponse.json({ error: "Failed to generate logbook export" }, { status: 500 });
    }
}
