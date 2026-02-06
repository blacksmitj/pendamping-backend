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

        const [participantsCount, mentorsCount, universitiesCount, newEmployeesCount] = await Promise.all([
            prisma.participants.count({ where: activeParticipantFilter }),
            prisma.mentors.count({
                where: {
                    users: {
                        profiles: {
                            universities: activeUnivFilter
                        }
                    }
                },
            }),
            prisma.universities.count({ where: activeUnivFilter }),
            prisma.business_employees.count({
                where: {
                    businesses: {
                        participants: {
                            universities: activeUnivFilter
                        }
                    }
                }
            })
        ]);

        // Calculate Average Omzet Growth
        // This still requires some data fetching, but we can optimize it
        const participantsWithReports = await prisma.participants.findMany({
            where: activeParticipantFilter,
            select: {
                monthly_reports: {
                    orderBy: [
                        { report_year: 'asc' },
                        { report_month: 'asc' }
                    ],
                    select: { revenue: true }
                }
            }
        });

        const allGrowth = participantsWithReports.map(p => {
            const reports = p.monthly_reports || [];
            const first = reports[0];
            const last = reports[reports.length - 1];
            if (first && last && Number(first.revenue) > 0) {
                return ((Number(last.revenue) - Number(first.revenue)) / Number(first.revenue)) * 100;
            }
            return null;
        }).filter((g): g is number => g !== null);

        const totalGrowth = allGrowth.reduce((acc, g) => acc + g, 0);
        const summaryOmzetGrowth = allGrowth.length > 0 ? totalGrowth / allGrowth.length : 0;

        return NextResponse.json({
            participants: participantsCount,
            mentors: mentorsCount,
            universities: universitiesCount,
            newEmployees: newEmployeesCount,
            avgOmzetGrowth: summaryOmzetGrowth
        });
    } catch (error) {
        console.error("[dashboard-counts] Failed to fetch", error);
        return NextResponse.json({ error: "Failed to fetch counts" }, { status: 500 });
    }
}
