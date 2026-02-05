import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface LogbookAttendee {
    id?: string;
    participant_id?: string;
    participants?: {
        id: string;
        legacy_tkm_id: string | null;
        profiles?: {
            full_name: string | null;
            id_number: string | null;
            avatar_url: string | null;
            whatsapp_number: string | null;
            addresses?: Array<{
                address_line: string | null;
                village_name: string | null;
                district_name: string | null;
                regency_name: string | null;
                province_name: string | null;
            }>;
        } | null;
        businesses?: Array<{
            name: string | null;
            type: string | null;
            sector: string | null;
        }>;
        universities?: {
            name: string;
        } | null;
    } | null;
}

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const logbook = await prisma.logbooks.findUnique({
            where: { id },
            include: {
                logbook_attendees: {
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
                                businesses: { take: 1 },
                                universities: true
                            }
                        }
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
                logbook_documents: {
                    include: { documents: true }
                }
            }
        });

        if (!logbook) {
            return NextResponse.json(
                { error: "Logbook not found" },
                { status: 404 }
            );
        }

        // Transform data
        const mentor = logbook.mentors;
        const mentorUser = mentor?.users;
        const mentorProfile = mentorUser?.profiles;
        const mentorUniversity = mentorProfile?.universities;

        const attendees = (logbook.logbook_attendees as LogbookAttendee[]).map(a => {
            const p = a.participants;
            const profile = p?.profiles;
            const business = p?.businesses?.[0];
            const address = profile?.addresses?.[0];

            return {
                id: p?.id,
                legacy_tkm_id: p?.legacy_tkm_id,
                nama: profile?.full_name || "",
                nik: profile?.id_number || "",
                foto: profile?.avatar_url || null,
                nama_usaha: business?.name || "",
                jenis_usaha: business?.type || "",
                sektor_usaha: business?.sector || "",
                alamat_usaha: address?.address_line || "",
                kelurahan_usaha: address?.village_name || "",
                kecamatan_usaha: address?.district_name || "",
                kota_usaha: address?.regency_name || "",
                provinsi_usaha: address?.province_name || "",
                universitas: p?.universities?.name || "",
                no_whatsapp: profile?.whatsapp_number || "",
            };
        });

        const docs = logbook.logbook_documents || [];
        const dokumentasi: string[] = [];
        const buktiExpense: string[] = [];

        docs.forEach(d => {
            const label = (d.documents.label || "").toLowerCase();
            const url = d.documents.file_url;
            if (label.includes("biaya") || label.includes("kwitansi") || label.includes("expense") || label.includes("struk")) {
                buktiExpense.push(url);
            } else {
                dokumentasi.push(url);
            }
        });

        const isGroup = (logbook.meeting_type || "").toLowerCase().includes("kelompok") || attendees.length > 1;

        const data = {
            id: logbook.id,
            tanggal: logbook.activity_date,
            metode: logbook.delivery_method || "",
            jenis_kunjungan: logbook.visit_type || "",
            jenis_pertemuan: logbook.meeting_type || "",
            jam_mulai: logbook.start_time,
            jam_selesai: logbook.end_time,
            jpl: logbook.jpl || 0,
            materi: logbook.mentoring_material || "",
            ringkasan_kegiatan: logbook.activity_summary || "",
            kendala: logbook.obstacles || "",
            solusi: logbook.solutions || "",
            total_expense: Number(logbook.expense_amount || 0),
            alasan_tdk_expense: logbook.no_expense_reason || "",
            catatan_verifikasi: logbook.verification_note || "",
            verifikasi: logbook.is_verified || "pending",
            created_at: logbook.created_at,
            updated_at: logbook.updated_at,

            isGroup,
            attendeeCount: attendees.length,
            attendees,

            pendamping: {
                id: mentor?.id,
                nama: mentorProfile?.full_name || mentorUser?.email || "",
                nik: mentorProfile?.id_number || "",
                foto: mentorProfile?.avatar_url || null,
                no_whatsapp: mentorProfile?.whatsapp_number || "",
                jenis_kelamin: mentorProfile?.gender || "",
                email: mentorUser?.email || "",
                universitas: mentorUniversity?.name || "",
            },

            dokumentasi,
            buktiExpense,
        };

        return NextResponse.json(data);
    } catch (error) {
        console.error("[logbook detail] Failed to fetch", error);
        return NextResponse.json(
            { error: "Failed to fetch logbook" },
            { status: 500 }
        );
    }
}
