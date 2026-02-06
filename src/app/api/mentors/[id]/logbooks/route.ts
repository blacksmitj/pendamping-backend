import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { searchParams } = new URL(request.url);
        const page = Math.max(1, Number(searchParams.get("page")) || 1);
        const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize")) || 10));
        const offset = (page - 1) * pageSize;

        const [logbooks, total] = await Promise.all([
            prisma.logbooks.findMany({
                where: { mentor_id: id },
                include: {
                    logbook_attendees: {
                        include: {
                            participants: {
                                include: {
                                    profiles: true
                                }
                            }
                        }
                    }
                },
                orderBy: { activity_date: 'desc' },
                skip: offset,
                take: pageSize,
            }),
            prisma.logbooks.count({ where: { mentor_id: id } })
        ]);

        const data = logbooks.map(l => ({
            id: l.id,
            date: l.activity_date,
            startTime: l.start_time,
            endTime: l.end_time,
            activitySummary: l.activity_summary,
            deliveryMethod: l.delivery_method,
            jpl: l.jpl,
            isVerified: l.is_verified,
            attendees: l.logbook_attendees.map(a => ({
                id: a.id,
                participantId: a.participants?.legacy_tkm_id || a.participants?.id,
                name: a.participants?.profiles?.full_name || "Unknown"
            }))
        }));

        return NextResponse.json({
            data,
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize)
        });
    } catch (error: any) {
        console.error("[mentor-logbooks] Failed to fetch", error);
        return NextResponse.json(
            { error: "Failed to fetch logbooks", details: error.message || String(error) },
            { status: 500 }
        );
    }
}
