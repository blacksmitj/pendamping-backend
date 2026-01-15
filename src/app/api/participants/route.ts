import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [participants, total] = await Promise.all([
      prisma.peserta.findMany({
        take: 50,
        orderBy: { no: "desc" },
        select: {
          no: true,
          nama: true,
          nama_usaha: true,
          status: true,
          kota_domisili: true,
          provinsi_domisili: true,
          sektor_usaha: true,
          tanggal_daftar: true,
          no_whatsapp: true,
        },
      }),
      prisma.peserta.count(),
    ]);

    return NextResponse.json({ data: participants, total });
  } catch (error) {
    console.error("[participants] Failed to fetch", error);
    return NextResponse.json(
      { error: "Failed to fetch participants" },
      { status: 500 }
    );
  }
}
