import { NextResponse } from "next/server";
import { prisma, Prisma } from "@/lib/prisma";

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
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";
    const offset = (page - 1) * pageSize;

    // Define valid sort columns to prevent SQL injection
    const validSortColumns = {
      id: "u.id",
      name: "u.username", // users.name -> users.username
      email: "u.email",
    };

    // Default to u.id if invalid sort column
    const orderByClause = validSortColumns[sortBy as keyof typeof validSortColumns]
      ? Prisma.sql([`${validSortColumns[sortBy as keyof typeof validSortColumns]} ${sortOrder.toUpperCase()}`])
      : Prisma.sql([`u.id ${sortOrder.toUpperCase()}`]);

    // Base query parts
    // Mentors are primarily identified as entries in the 'mentors' table.
    // Joining mentors table ensures we get everyone assigned as a mentor.
    
    const conditions: Prisma.Sql[] = [Prisma.sql`1=1`];
    
    if (search) {
      const searchPattern = `%${search}%`;
      conditions.push(Prisma.sql`(
          u.username ILIKE ${searchPattern} OR 
          u.email ILIKE ${searchPattern} OR 
          p.whatsapp_number ILIKE ${searchPattern}
        )`);
    }

    const whereClause = conditions.length > 0
      ? Prisma.sql`WHERE ${Prisma.join(conditions, " AND ")}`
      : Prisma.empty;

    // Count query
    const countResult: any = await prisma.$queryRaw`
      SELECT COUNT(DISTINCT m.id) as total
      FROM mentors m
      JOIN users u ON m.user_id = u.id
      LEFT JOIN profiles p ON u.id = p.user_id
      ${whereClause}
    `;
    
    const total = Number(countResult[0]?.total || 0);

    // Data query
    const users: any[] = await prisma.$queryRaw`
      SELECT 
        m.id, 
        u.username as name, 
        u.email, 
        p.whatsapp_number as no_wa, 
        p.gender as jenis_kelamin, 
        p.avatar_url as foto
      FROM mentors m
      JOIN users u ON m.user_id = u.id
      LEFT JOIN profiles p ON u.id = p.user_id
      ${whereClause}
      ORDER BY ${orderByClause}
      LIMIT ${pageSize} OFFSET ${offset}
    `;

    const data = users.map((user) => ({
      id: user.id,
      name: user.name || "Unknown",
      email: user.email ?? "",
      phone: user.no_wa ?? "",
      gender: user.jenis_kelamin ?? "",
      photo: user.foto ?? null,
      university: null // University data not available in new schema
    }));

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
