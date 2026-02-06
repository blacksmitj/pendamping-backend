import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const activeUnivFilter: Prisma.universitiesWhereInput = {
            status: { in: ['aktif', 'active'] }
        };
        const activeParticipantFilter: Prisma.participantsWhereInput = {
            status: { in: ['aktif', 'active'] },
            universities: activeUnivFilter
        };

        // 1. Top 10 TKML Omzet Rate (Revenue Growth)
        const participantsData = await prisma.participants.findMany({
            where: activeParticipantFilter,
            select: {
                id: true,
                legacy_tkm_id: true,
                profiles: {
                    select: {
                        full_name: true,
                        avatar_url: true,
                        users: { select: { email: true } }
                    }
                },
                businesses: {
                    take: 1,
                    select: { name: true }
                },
                monthly_reports: {
                    orderBy: [
                        { report_year: 'asc' },
                        { report_month: 'asc' }
                    ],
                    select: { revenue: true }
                }
            }
        });

        const topParticipants = participantsData.map(p => {
            const reports = p.monthly_reports || [];
            const first = reports[0];
            const last = reports[reports.length - 1];
            let growth = 0;
            if (first && last && Number(first.revenue) > 0) {
                growth = ((Number(last.revenue) - Number(first.revenue)) / Number(first.revenue)) * 100;
            }
            return {
                id: p.legacy_tkm_id || p.id,
                nama: p.profiles?.full_name || p.profiles?.users?.email || "Unknown",
                nama_usaha: p.businesses?.[0]?.name || "Unknown Business",
                photo: p.profiles?.avatar_url,
                growth,
                last_revenue: last ? Number(last.revenue) : 0
            };
        }).sort((a, b) => b.growth - a.growth).slice(0, 10);

        // 2. Top Mentors by Visits
        const logbooks = await prisma.logbooks.findMany({
            where: {
                meeting_type: 'perorangan',
                visit_type: { in: ['lokal', 'luar_kota', 'Luring'] },
                mentors: {
                    users: {
                        profiles: {
                            universities: activeUnivFilter
                        }
                    }
                }
            },
            select: {
                mentor_id: true,
                mentors: {
                    select: {
                        id: true,
                        users: {
                            select: {
                                email: true,
                                profiles: { select: { avatar_url: true } }
                            }
                        }
                    }
                }
            }
        });

        const mentorVisitMap = new Map<string, { name: string; foto: string | null; count: number }>();
        logbooks.forEach(l => {
            if (l.mentors) {
                const m = l.mentors;
                const current = mentorVisitMap.get(m.id) || {
                    name: m.users?.email || "Unknown",
                    foto: m.users?.profiles?.avatar_url || null,
                    count: 0
                };
                current.count++;
                mentorVisitMap.set(m.id, current);
            }
        });

        const topMentors = Array.from(mentorVisitMap.entries())
            .map(([id, m]) => ({ id, name: m.name, foto: m.foto, visit_count: m.count }))
            .sort((a, b) => b.visit_count - a.visit_count)
            .slice(0, 10);

        return NextResponse.json({
            topParticipants,
            topMentors
        });
    } catch (error) {
        console.error("[dashboard-top-performers] Failed to fetch", error);
        return NextResponse.json({ error: "Failed to fetch top performers" }, { status: 500 });
    }
}
