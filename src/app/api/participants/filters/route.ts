import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const [statuses, provinces, cities] = await Promise.all([
            prisma.peserta.findMany({
                select: { status: true },
                distinct: ["status"],
                where: { status: { not: null } },
                orderBy: { status: "asc" },
            }),
            prisma.peserta.findMany({
                select: { provinsi_domisili: true },
                distinct: ["provinsi_domisili"],
                where: { provinsi_domisili: { not: null } },
                orderBy: { provinsi_domisili: "asc" },
            }),
            prisma.peserta.findMany({
                select: { kota_domisili: true },
                distinct: ["kota_domisili"],
                where: { kota_domisili: { not: null } },
                orderBy: { kota_domisili: "asc" },
            }),
        ]);

        return NextResponse.json({
            statuses: statuses.map((s) => s.status).filter(Boolean),
            provinces: provinces.map((p) => p.provinsi_domisili).filter(Boolean),
            cities: cities.map((c) => c.kota_domisili).filter(Boolean),
        });
    } catch (error) {
        console.error("Error fetching filters:", error);
        return NextResponse.json(
            { error: "Failed to fetch filters" },
            { status: 500 }
        );
    }
}
