import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const activeParticipantFilter: Prisma.participantsWhereInput = {
            status: { in: ['aktif', 'active'] },
            universities: {
                status: { in: ['aktif', 'active'] }
            }
        };

        const activeData = await prisma.participants.findMany({
            where: activeParticipantFilter,
            select: {
                id: true,
                businesses: { select: { id: true } },
                profiles: {
                    select: {
                        addresses: {
                            take: 1,
                            select: {
                                regency_name: true,
                                latitude: true,
                                longitude: true
                            }
                        }
                    }
                }
            }
        });

        const distributionMap = new Map<string, { value: number; lat: number; lng: number; count: number }>();

        activeData.forEach(p => {
            const address = p.profiles?.addresses?.[0];
            if (address?.regency_name) {
                const name = address.regency_name;
                const current = distributionMap.get(name) || { value: 0, lat: 0, lng: 0, count: 0 };

                if (p.businesses.length > 0) current.value++;

                if (address.latitude && address.longitude) {
                    current.lat += Number(address.latitude);
                    current.lng += Number(address.longitude);
                    current.count++;
                }
                distributionMap.set(name, current);
            }
        });

        const regencyDistribution = Array.from(distributionMap.entries()).map(([name, d]) => ({
            name,
            value: d.value,
            lat: d.count > 0 ? d.lat / d.count : 0,
            lng: d.count > 0 ? d.lng / d.count : 0
        })).sort((a, b) => b.value - a.value);

        return NextResponse.json(regencyDistribution);
    } catch (error) {
        console.error("[dashboard-map] Failed to fetch", error);
        return NextResponse.json({ error: "Failed to fetch map data" }, { status: 500 });
    }
}
