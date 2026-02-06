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

        // We filter monthly reports where the participant is handled by this mentor
        const whereCondition = {
            participants: {
                mentor_participants: {
                    some: {
                        mentor_id: id
                    }
                }
            }
        };

        const [reports, total] = await Promise.all([
            prisma.monthly_reports.findMany({
                where: whereCondition,
                include: {
                    participants: {
                        include: {
                            profiles: true
                        }
                    }
                },
                orderBy: [
                    { report_year: 'desc' },
                    { report_month: 'desc' }
                ],
                skip: offset,
                take: pageSize,
            }),
            prisma.monthly_reports.count({ where: whereCondition })
        ]);

        const data = reports.map(r => ({
            id: r.id,
            month: r.report_month,
            year: r.report_year,
            revenue: r.revenue,
            salesVolume: r.sales_volume,
            condition: r.business_condition,
            isVerified: r.is_verified,
            participantName: r.participants?.profiles?.full_name || "Unknown",
            participantId: r.participants?.legacy_tkm_id || r.participants?.id
        }));

        return NextResponse.json({
            data,
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize)
        });
    } catch (error: any) {
        console.error("[mentor-outputs] Failed to fetch", error);
        return NextResponse.json(
            { error: "Failed to fetch outputs", details: error.message || String(error) },
            { status: 500 }
        );
    }
}
