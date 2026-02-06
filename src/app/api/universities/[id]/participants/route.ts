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
        const search = searchParams.get("search") || "";
        const offset = (page - 1) * pageSize;

        const whereClause: any = { university_id: id };

        if (search) {
            whereClause.OR = [
                {
                    profiles: {
                        full_name: {
                            contains: search,
                            mode: 'insensitive'
                        }
                    }
                },
                {
                    businesses: {
                        some: {
                            name: {
                                contains: search,
                                mode: 'insensitive'
                            }
                        }
                    }
                }
            ];
        }

        const [participants, total] = await Promise.all([
            prisma.participants.findMany({
                where: whereClause,
                include: {
                    profiles: true,
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
                },
                skip: offset,
                take: pageSize,
                orderBy: { profiles: { full_name: 'asc' } }
            }),
            prisma.participants.count({
                where: whereClause
            })
        ]);

        const data = participants.map(p => {
            const profile = p.profiles;
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
                photo: profile?.avatar_url,
                businessName: business?.name || "N/A",
                sector: business?.sector || "N/A",
                status: p.status,
                state: p.state,
                nik: p.legacy_tkm_id || null,
                omsetGrowth: growth,
                newJobs: business?.business_employees?.length || 0
            };
        });

        return NextResponse.json({
            data,
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize)
        });
    } catch (error: any) {
        console.error("[university-participants] Failed to fetch", error);
        return NextResponse.json(
            { error: "Failed to fetch university participants", details: error.message || String(error) },
            { status: 500 }
        );
    }
}
