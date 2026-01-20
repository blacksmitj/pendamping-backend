import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const participants = await prisma.peserta.count();
    const mentors = await prisma.profile.count();
    const universities = await prisma.university.count();

    return NextResponse.json({
      participants,
      mentors,
      universities,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[dashboard-summary] Failed to fetch", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard summary" },
      { status: 500 }
    );
  }
}
