import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "../../../../generated/prisma/client";

export const dynamic = "force-dynamic";

// Helper to serialize BigInt
function serializeBigInt(obj: any): any {
  return JSON.parse(
    JSON.stringify(obj, (key, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
}

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
    const status = searchParams.get("status");
    const province = searchParams.get("province");
    const city = searchParams.get("city");

    const skip = (page - 1) * pageSize;

    // Build WHERE conditions
    const conditions: Prisma.Sql[] = [Prisma.sql`1=1`];

    if (search) {
      const searchPattern = `%${search}%`;
      conditions.push(Prisma.sql`(p.nama LIKE ${searchPattern} OR p.nama_usaha LIKE ${searchPattern} OR p.kota_domisili LIKE ${searchPattern})`);
    }
    if (status && status !== "all") {
      conditions.push(Prisma.sql`p.status = ${status}`);
    }
    if (province && province !== "all") {
      conditions.push(Prisma.sql`p.provinsi_domisili = ${province}`);
    }
    if (city && city !== "all") {
      conditions.push(Prisma.sql`p.kota_domisili = ${city}`);
    }

    const whereClause = conditions.length > 0
      ? Prisma.sql`WHERE ${Prisma.join(conditions, " AND ")}`
      : Prisma.empty;

    // Define Sort Logic
    let orderByClause = Prisma.sql`p.no DESC`;

    if (sortBy === "revenue_growth") {
      orderByClause = Prisma.sql`omset_growth DESC`;
    } else if (sortBy === "omset_highest") {
      orderByClause = Prisma.sql`last_revenue DESC`;
    } else if (sortBy === "omset_lowest") {
      orderByClause = Prisma.sql`last_revenue ASC`;
    } else if (sortBy === "status") {
      orderByClause = sortOrder === 'asc' ? Prisma.sql`p.status ASC` : Prisma.sql`p.status DESC`;
    } else if (sortBy === "name") {
      orderByClause = sortOrder === 'asc' ? Prisma.sql`p.nama ASC` : Prisma.sql`p.nama DESC`;
    } else if (sortBy === "registered") {
      orderByClause = sortOrder === 'asc' ? Prisma.sql`p.tanggal_daftar ASC` : Prisma.sql`p.tanggal_daftar DESC`;
    } else {
      // default
      orderByClause = sortOrder === 'asc' ? Prisma.sql`p.no ASC` : Prisma.sql`p.no DESC`;
    }

    // Main Query
    const participantsRaw = await prisma.$queryRaw`
      SELECT 
        p.no, 
        p.id_tkm, 
        p.nama, 
        p.nama_usaha, 
        p.status, 
        p.kota_domisili, 
        p.provinsi_domisili, 
        p.sektor_usaha, 
        p.tanggal_daftar, 
        p.no_whatsapp, 
        p.link_pas_foto as photo,
        
        -- Calculated Fields
        CAST((
          SELECT COUNT(DISTINCT emp.id) 
          FROM capaian_output co 
          JOIN tkm_new_employee emp ON emp.capaian_output_id = co.id 
          WHERE co.id_tkm = p.id_tkm
        ) AS SIGNED) as new_employees,

        -- Helper for Last Revenue (used for sorting 'Omset')
        CAST((
          SELECT revenue 
          FROM capaian_output 
          WHERE id_tkm = p.id_tkm 
          ORDER BY month_report DESC 
          LIMIT 1
        ) AS SIGNED) as last_revenue,
        
        -- Growth Calculation
        CAST((
            COALESCE(
                 (
                    (SELECT revenue FROM capaian_output WHERE id_tkm = p.id_tkm ORDER BY month_report DESC LIMIT 1) -
                    (SELECT revenue FROM capaian_output WHERE id_tkm = p.id_tkm ORDER BY month_report ASC LIMIT 1)
                 ) / NULLIF((SELECT revenue FROM capaian_output WHERE id_tkm = p.id_tkm ORDER BY month_report ASC LIMIT 1), 0) * 100
            , 0)
        ) AS DECIMAL(10, 2)) as omset_growth

      FROM peserta p
      ${whereClause}
      ORDER BY ${orderByClause}
      LIMIT ${pageSize} OFFSET ${skip}
    `;

    // Count Query for Pagination
    const totalRaw: any = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM peserta p ${whereClause}
    `;
    const total = Number(totalRaw[0]?.count || 0);

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    const data = serializeBigInt(participantsRaw).map((p: any) => ({
      ...p,
      new_employees: Number(p.new_employees),
      omset_growth: Number(p.omset_growth),
    }));

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
