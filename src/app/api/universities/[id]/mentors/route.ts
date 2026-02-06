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

        const whereClause: any = {
            users: {
                profiles: {
                    university_id: id
                }
            }
        };

        if (search) {
            whereClause.OR = [
                {
                    users: {
                        profiles: {
                            full_name: {
                                contains: search,
                                mode: 'insensitive'
                            }
                        }
                    }
                },
                {
                    users: {
                        email: {
                            contains: search,
                            mode: 'insensitive'
                        }
                    }
                }
            ];
        }

        const [mentors, total] = await Promise.all([
            prisma.mentors.findMany({
                where: whereClause,
                include: {
                    users: {
                        include: {
                            profiles: true
                        }
                    },
                    _count: {
                        select: {
                            mentor_participants: true,
                            logbooks: true
                        }
                    }
                },
                skip: offset,
                take: pageSize,
                orderBy: { users: { profiles: { full_name: 'asc' } } }
            }),
            prisma.mentors.count({
                where: whereClause
            })
        ]);

        const data = mentors.map(m => ({
            id: m.id,
            name: m.users?.profiles?.full_name || m.users?.email || "Unknown",
            email: m.users?.email,
            photo: m.users?.profiles?.avatar_url,
            nik: m.users?.profiles?.id_number,
            stats: {
                totalParticipants: m._count.mentor_participants,
                totalLogbooks: m._count.logbooks
            }
        }));

        return NextResponse.json({
            data,
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize)
        });
    } catch (error: any) {
        console.error("[university-mentors] Failed to fetch", error);
        return NextResponse.json(
            { error: "Failed to fetch university mentors", details: error.message || String(error) },
            { status: 500 }
        );
    }
}
