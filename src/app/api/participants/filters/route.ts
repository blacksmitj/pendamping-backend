import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const statuses = await prisma.participants.findMany({
            select: { status: true },
            distinct: ["status"],
            where: { status: { not: null } },
            orderBy: { status: "asc" },
        });

        // For provinces and cities, we want those that are actually used in addresses
        // Query addresses with distinct provinces
        const usedProvinces = await prisma.addresses.findMany({
            select: {
                provinces: {
                    select: { name: true }
                }
            },
            distinct: ["province_id"],
            where: { province_id: { not: null } },
        });

        // Query addresses with distinct regencies (cities)
        const usedCities = await prisma.addresses.findMany({
            select: {
                regencies: {
                    select: { name: true }
                }
            },
            distinct: ["regency_id"],
            where: { regency_id: { not: null } },
        });

        const provinceNames = usedProvinces
            .map(p => p.provinces?.name)
            .filter((n): n is string => !!n)
            .sort();
            
        const cityNames = usedCities
            .map(c => c.regencies?.name)
            .filter((n): n is string => !!n)
            .sort();

        return NextResponse.json({
            statuses: statuses.map((s) => s.status).filter(Boolean),
            provinces: provinceNames,
            cities: cityNames,
        });
    } catch (error) {
        console.error("Error fetching filters:", error);
        return NextResponse.json(
            { error: "Failed to fetch filters" },
            { status: 500 }
        );
    }
}
