import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const mentor = await prisma.mentors.findUnique({
            where: { id },
            include: {
                users: {
                    include: {
                        profiles: {
                            include: {
                                universities: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        mentor_participants: true,
                        logbooks: true,
                    },
                },
            },
        });

        if (!mentor) {
            return NextResponse.json({ error: "Mentor not found" }, { status: 404 });
        }

        const user = mentor.users;
        const profile = user?.profiles;
        const university = profile?.universities;

        // Fetch total monthly reports for participants managed by this mentor
        // This is a bit more complex since we need to join through mentor_participants
        const monthlyReportsCount = await prisma.monthly_reports.count({
            where: {
                participants: {
                    mentor_participants: {
                        some: {
                            mentor_id: id,
                        },
                    },
                },
            },
        });

        const data = {
            id: mentor.id,
            name: profile?.full_name || user?.email || "Unknown",
            email: user?.email ?? "",
            phone: profile?.whatsapp_number ?? "",
            nik: profile?.id_number ?? "",
            gender: profile?.gender ?? "",
            photo: profile?.avatar_url ?? null,
            specialization: mentor.specialization,
            university: university ? {
                id: university.id,
                name: university.name,
                city: university.city,
                province: university.province,
            } : null,
            stats: {
                totalParticipants: mentor._count.mentor_participants,
                totalLogbooks: mentor._count.logbooks,
                totalMonthlyReports: monthlyReportsCount,
            },
        };

        return NextResponse.json(data);
    } catch (error: any) {
        console.error("[mentor-detail] Failed to fetch", error);
        return NextResponse.json(
            { error: "Failed to fetch mentor detail", details: error.message || String(error) },
            { status: 500 }
        );
    }
}
