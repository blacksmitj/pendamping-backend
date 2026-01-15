import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [universities, total] = await Promise.all([
      prisma.university.findMany({
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          alamat: true,
          city: true,
          province: true,
        },
      }),
      prisma.university.count(),
    ]);

    return NextResponse.json({ data: universities, total });
  } catch (error) {
    console.error("[universities] Failed to fetch", error);
    return NextResponse.json(
      { error: "Failed to fetch universities" },
      { status: 500 }
    );
  }
}
