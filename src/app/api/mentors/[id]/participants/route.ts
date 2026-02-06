import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const mentorParticipants = await prisma.mentor_participants.findMany({
            where: { mentor_id: id },
            include: {
                participants: {
                    include: {
                        profiles: true,
                        universities: true,
                        businesses: {
                            include: {
                                business_employees: true
                            }
                        },
                        monthly_reports: {
                            orderBy: [
                                { report_year: 'asc' },
                                { report_month: 'asc' }
                            ]
                        }
                    }
                }
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        const data = mentorParticipants.map(mp => {
            const p = mp.participants;
            if (!p) return null;
            const profile = p.profiles;
            const university = p.universities;
            const business = p.businesses?.[0];

            const reports = p.monthly_reports || [];
            const firstReport = reports[0];
            const lastReport = reports[reports.length - 1];

            let growth = 0;
            if (firstReport && lastReport && Number(firstReport.revenue) > 0) {
                growth = ((Number(lastReport.revenue) - Number(firstReport.revenue)) / Number(firstReport.revenue)) * 100;
            }

            return {
                id: p.legacy_tkm_id || p.id,
                uuid: p.id,
                name: profile?.full_name || "Unknown",
                photo: profile?.avatar_url || null,
                nik: p.legacy_tkm_id || null,
                phone: profile?.whatsapp_number || "",
                university: university?.name || "N/A",
                businessName: business?.name || "N/A",
                sector: business?.sector || "N/A",
                status: p.status || "N/A",
                state: p.state || "N/A",
                assignmentDate: mp.created_at,
                omsetGrowth: growth,
                newJobs: business?.business_employees?.length || 0
            };
        }).filter(Boolean);

        return NextResponse.json(data);
    } catch (error: any) {
        console.error("[mentor-participants] Failed to fetch", error);
        return NextResponse.json(
            { error: "Failed to fetch participants", details: error.message || String(error) },
            { status: 500 }
        );
    }
}
