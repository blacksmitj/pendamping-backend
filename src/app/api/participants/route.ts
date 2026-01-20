import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const pageSize = Math.min(
      100,
      Math.max(1, Number(searchParams.get("pageSize")) || 10)
    );
    const search = (searchParams.get("search") ?? "").trim();
    const sortBy = searchParams.get("sortBy") ?? "no";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";
    const skip = (page - 1) * pageSize;

    const orderBy =
      sortBy === "name"
        ? { nama: sortOrder }
        : sortBy === "status"
        ? { status: sortOrder }
        : sortBy === "city"
        ? { kota_domisili: sortOrder }
        : sortBy === "registered"
        ? { tanggal_daftar: sortOrder }
        : { no: sortOrder };

    const where = search
      ? {
          OR: [
            { nama: { contains: search } },
            { nama_usaha: { contains: search } },
            { kota_domisili: { contains: search } },
          ],
        }
      : undefined;

    const participants = await prisma.peserta.findMany({
      take: pageSize,
      skip,
      orderBy,
      where,
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
        link_pas_foto: true,
      },
    });

    const total = await prisma.peserta.count({ where });

    const data = participants.map(
      ({ link_pas_foto, ...participant }) => ({
        ...participant,
        photo: link_pas_foto ?? null,
      })
    );

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    return NextResponse.json({
      data,
      total,
      page,
      pageSize,
      totalPages,
    });
  } catch (error) {
    console.error("[participants] Failed to fetch", error);
    return NextResponse.json(
      { error: "Failed to fetch participants" },
      { status: 500 }
    );
  }
}
