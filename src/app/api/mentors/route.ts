import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "../../../../generated/prisma/client";

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
      name: "u.name",
      email: "u.email",
    };

    // Default to u.id if invalid sort column
    const orderByClause = validSortColumns[sortBy as keyof typeof validSortColumns]
      ? `${validSortColumns[sortBy as keyof typeof validSortColumns]} ${sortOrder.toUpperCase()}`
      : `u.id ${sortOrder.toUpperCase()}`;

    // Base query parts
    let whereClause = `
      WHERE r.name = 'user'
    `;

    const queryParams: any[] = [];

    if (search) {
      whereClause += `
        AND (
          u.name LIKE ? OR 
          u.email LIKE ? OR 
          p.no_wa LIKE ? OR 
          univ.name LIKE ?
        )
      `;
      const searchLike = `%${search}%`;
      queryParams.push(searchLike, searchLike, searchLike, searchLike);
    }

    // Count query
    const countQuery = `
      SELECT COUNT(DISTINCT u.id) as total
      FROM users u
      JOIN model_has_roles mhr ON u.id = mhr.model_id
      JOIN roles r ON mhr.role_id = r.id
      LEFT JOIN profiles p ON u.id = p.user_id
      LEFT JOIN universities univ ON p.univ_id = univ.id
      ${whereClause}
    `;

    // Data query
    const dataQuery = `
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        p.no_wa, 
        p.jenis_kelamin, 
        p.foto, 
        univ.id as univ_id,
        univ.name as univ_name,
        c.city_name,
        prov.prov_name
      FROM users u
      JOIN model_has_roles mhr ON u.id = mhr.model_id
      JOIN roles r ON mhr.role_id = r.id
      LEFT JOIN profiles p ON u.id = p.user_id
      LEFT JOIN universities univ ON p.univ_id = univ.id
      LEFT JOIN cities c ON univ.city = c.id
      LEFT JOIN provinces prov ON univ.province = prov.id
      ${whereClause}
      ORDER BY ${orderByClause}
      LIMIT ? OFFSET ?
    `;

    // Execute queries
    const [totalResult, users] = await Promise.all([
      prisma.$queryRawUnsafe<{ total: bigint }[]>(countQuery, ...queryParams),
      prisma.$queryRawUnsafe<any[]>(dataQuery, ...queryParams, pageSize, offset)
    ]);

    const total = Number(totalResult[0]?.total || 0);

    const data = users.map((user) => ({
      id: user.id.toString(),
      name: user.name,
      email: user.email ?? "",
      phone: user.no_wa ?? "",
      gender: user.jenis_kelamin ?? "",
      photo: user.foto ?? null,
      university: user.univ_id
        ? {
          id: Number(user.univ_id),
          name: user.univ_name,
          city: user.city_name ?? "",
          province: user.prov_name ?? "",
        }
        : null,
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
