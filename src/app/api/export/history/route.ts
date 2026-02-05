
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const history = await prisma.export_logs.findMany({
            orderBy: { created_at: 'desc' },
            take: 50
        });

        return NextResponse.json(history);
    } catch (error) {
        console.error("Fetch history error:", error);
        return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
    }
}
