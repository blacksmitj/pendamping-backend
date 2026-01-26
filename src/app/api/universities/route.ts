import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "name";
    const sortOrder = (searchParams.get("sortOrder") as "asc" | "desc") || "asc";

    const skip = (page - 1) * pageSize;

    const where = search ? {
        OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { city: { contains: search, mode: "insensitive" as const } },
            { province: { contains: search, mode: "insensitive" as const } },
        ],
    } : {};

    const [total, items] = await Promise.all([
      prisma.universities.count({ where }),
      prisma.universities.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),
    ]);

    // Map to match frontend expectations (alamat, photo)
    const formattedData = items.map((u: any) => ({
      id: u.id,
      name: u.name,
      alamat: u.address,
      city: u.city,
      province: u.province,
      status: u.status,
      photo: null, // No photo column in universities table yet
    }));

    return NextResponse.json({
      data: formattedData,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error("[universities-api] Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
