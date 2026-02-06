import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const university = await prisma.universities.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        profiles: true, // Mentors are here (profiles with university_id)
                        participants: true
                    }
                }
            }
        });

        if (!university) {
            return NextResponse.json(
                { error: "University not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            id: university.id,
            name: university.name,
            address: university.address,
            city: university.city,
            province: university.province,
            status: university.status,
            stats: {
                totalMentors: university._count.profiles,
                totalParticipants: university._count.participants
            }
        });
    } catch (error: any) {
        console.error("[university-detail] Failed to fetch", error);
        return NextResponse.json(
            { error: "Failed to fetch university details", details: error.message || String(error) },
            { status: 500 }
        );
    }
}
