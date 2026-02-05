import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

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
    const sortBy = searchParams.get("sortBy") ?? "id";
    const sortOrder = (searchParams.get("sortOrder") === "asc" ? "asc" : "desc") as Prisma.SortOrder;
    const offset = (page - 1) * pageSize;

    // Define Sort Logic
    const sortMapping: Record<string, Prisma.mentorsOrderByWithRelationInput> = {
      id: { id: sortOrder },
      name: { users: { email: sortOrder } },
      email: { users: { email: sortOrder } },
    };

    const orderBy = sortMapping[sortBy] || { id: "asc" };

    // Build WHERE conditions
    const where: Prisma.mentorsWhereInput = {};

    if (search) {
      where.OR = [
        { users: { email: { contains: search, mode: 'insensitive' } } },
        { users: { email: { contains: search, mode: 'insensitive' } } },
        { users: { profiles: { whatsapp_number: { contains: search, mode: 'insensitive' } } } }
      ];
    }

    // Count query
    const total = await prisma.mentors.count({ where });

    // Data query
    const mentors = await prisma.mentors.findMany({
      skip: offset,
      take: pageSize,
      where,
      orderBy,
      include: {
        users: {
          include: {
            profiles: true
          }
        }
      }
    });

    const data = mentors.map((m) => {
      const user = m.users;
      const profile = user?.profiles;
      return {
        id: m.id,
        name: user?.email || "Unknown",
        email: user?.email ?? "",
        phone: profile?.whatsapp_number ?? "",
        gender: profile?.gender ?? "",
        photo: profile?.avatar_url ?? null,
        university: null // University connection not directly in mentors table in new schema
      };
    });

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    return NextResponse.json({
      data,
      total,
      page,
      pageSize,
      totalPages,
    });
  } catch (error: any) {
    console.error("[mentors] Failed to fetch", error);
    return NextResponse.json(
      { error: "Failed to fetch mentors", details: error.message || String(error) },
      { status: 500 }
    );
  }
}
