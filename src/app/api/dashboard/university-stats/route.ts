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

        const activeParticipants = await prisma.participants.findMany({
            where: activeParticipantFilter,
            select: {
                universities: { select: { id: true, name: true } },
                businesses: {
                    select: {
                        business_employees: { select: { id: true } }
                    }
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

        const mentors = await prisma.mentors.findMany({
            select: {
                id: true,
                users: {
                    select: {
                        profiles: { select: { university_id: true } }
                    }
                }
            }
        });

        const univStatsMap = new Map<string, { university_id: string; total_mentors: Set<string>; total_participants: number; total_new_employees: number; growth_sum: number }>();
        const univIdToName = new Map<string, string>();

        activeParticipants.forEach(p => {
            const univName = p.universities?.name;
            const univId = p.universities?.id;
            if (univName && univId) {
                univIdToName.set(univId, univName);
                const stats = univStatsMap.get(univId) || { university_id: univId, total_mentors: new Set(), total_participants: 0, total_new_employees: 0, growth_sum: 0 };
                stats.total_participants++;
                stats.total_new_employees += p.businesses.reduce((acc, b) => acc + b.business_employees.length, 0);

                const reports = p.monthly_reports || [];
                if (reports.length >= 2 && Number(reports[0].revenue) > 0) {
                    stats.growth_sum += ((Number(reports[reports.length - 1].revenue) - Number(reports[0].revenue)) / Number(reports[0].revenue)) * 100;
                }
                univStatsMap.set(univId, stats);
            }
        });

        mentors.forEach(m => {
            const univId = m.users?.profiles?.university_id;
            if (univId) {
                const stats = univStatsMap.get(univId);
                if (stats) {
                    stats.total_mentors.add(m.id);
                }
            }
        });

        const universityStats = Array.from(univStatsMap.entries()).map(([univId, s]) => ({
            university_id: univId,
            university_name: univIdToName.get(univId) || "Unknown",
            total_mentors: s.total_mentors.size,
            total_participants: s.total_participants,
            total_new_employees: s.total_new_employees,
            avg_growth: s.total_participants > 0 ? s.growth_sum / s.total_participants : 0
        })).sort((a, b) => b.total_participants - a.total_participants);

        return NextResponse.json(universityStats);
    } catch (error) {
        console.error("[dashboard-university-stats] Failed to fetch", error);
        return NextResponse.json({ error: "Failed to fetch university stats" }, { status: 500 });
    }
}
