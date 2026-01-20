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
    const sortBy = searchParams.get("sortBy") ?? "name";
    const sortOrder = searchParams.get("sortOrder") === "desc" ? "desc" : "asc";
    const skip = (page - 1) * pageSize;

    const orderBy =
      sortBy === "city"
        ? { city: { city_name: sortOrder } }
        : sortBy === "province"
        ? { province: { prov_name: sortOrder } }
        : { name: sortOrder };

    const where = search
      ? {
          OR: [
            { name: { contains: search } },
            { city: { city_name: { contains: search } } },
            { province: { prov_name: { contains: search } } },
          ],
        }
      : undefined;

    const [universities, total] = await Promise.all([
      prisma.university.findMany({
        take: pageSize,
        skip,
        orderBy,
        where,
        select: {
          id: true,
          name: true,
          alamat: true,
          city: { select: { city_name: true } },
          province: { select: { prov_name: true } },
        },
      }),
      prisma.university.count({ where }),
    ]);

    const data = universities.map((university) => ({
      id: university.id,
      name: university.name,
      alamat: university.alamat,
      city: university.city?.city_name ?? "",
      province: university.province?.prov_name ?? "",
      photo: null as string | null,
    }));

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    return NextResponse.json({
      data,
      total,
      page,
      pageSize,
      totalPages,
    });
  } catch (error) {
    console.error("[universities] Failed to fetch", error);
    return NextResponse.json(
      { error: "Failed to fetch universities" },
      { status: 500 }
    );
  }
}
