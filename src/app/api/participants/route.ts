import { NextResponse } from "next/server";
import { prisma, Prisma } from "@/lib/prisma";

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

    // Note: We access joined tables (u for users, b for businesses, r for regencies/city, etc.)
    if (search) {
      const searchPattern = `%${search}%`;
      // Search by profile full_name, business name, or city name
      conditions.push(Prisma.sql`(prof.full_name ILIKE ${searchPattern} OR b.name ILIKE ${searchPattern} OR r.name ILIKE ${searchPattern})`);
    }
    if (status && status !== "all") {
      conditions.push(Prisma.sql`p.status = ${status}`);
    }
    
    // For province and city, we rely on the addresses join
    if (province && province !== "all") {
      conditions.push(Prisma.sql`prov.name = ${province}`);
    }
    if (city && city !== "all") {
      conditions.push(Prisma.sql`r.name = ${city}`);
    }

    const whereClause = conditions.length > 0
      ? Prisma.sql`WHERE ${Prisma.join(conditions, " AND ")}`
      : Prisma.empty;

    // Define Sort Logic
    let orderByClause = Prisma.sql`p.created_at DESC`; // Default fallback

    if (sortBy === "revenue_growth") {
      orderByClause = Prisma.sql`omset_growth DESC`;
    } else if (sortBy === "omset_highest") {
      orderByClause = Prisma.sql`last_revenue DESC`;
    } else if (sortBy === "omset_lowest") {
      orderByClause = Prisma.sql`last_revenue ASC`;
    } else if (sortBy === "status") {
      orderByClause = sortOrder === 'asc' ? Prisma.sql`p.status ASC` : Prisma.sql`p.status DESC`;
    } else if (sortBy === "name") {
      orderByClause = sortOrder === 'asc' ? Prisma.sql`prof.full_name ASC` : Prisma.sql`prof.full_name DESC`;
    } else if (sortBy === "registered") {
      orderByClause = sortOrder === 'asc' ? Prisma.sql`p.created_at ASC` : Prisma.sql`p.created_at DESC`;
    } else {
      // default
      orderByClause = sortOrder === 'asc' ? Prisma.sql`p.created_at ASC` : Prisma.sql`p.created_at DESC`;
    }

    // Main Query
    // Joins:
    // participants (p) -> profiles (prof) -> users (u)
    // participants (p) -> businesses (b)
    // profiles (prof) -> addresses (addr) -> regencies (r)
    // profiles (prof) -> addresses (addr) -> provinces (prov)
    
    const participantsRaw = await prisma.$queryRaw`
      SELECT 
        p.id,
        p.legacy_tkm_id as id_tkm, 
        prof.full_name as nama,
        u.username,
        b.name as nama_usaha, 
        p.status, 
        r.name as kota_domisili, 
        prov.name as provinsi_domisili, 
        b.sector as sektor_usaha, 
        p.created_at as tanggal_daftar, 
        prof.whatsapp_number as no_whatsapp, 
        prof.avatar_url as photo,
        batch.code as batch_code,
        grp.name as group_name,
        
        -- Calculated Fields
        CAST((
          SELECT COUNT(*) 
          FROM business_employees be 
          WHERE be.business_id = b.id
        ) AS INTEGER) as new_employees,

        -- Helper for Last Revenue (from monthly_reports)
        CAST((
          SELECT revenue 
          FROM monthly_reports mr 
          WHERE mr.participant_id = p.id 
          ORDER BY mr.report_year DESC, mr.report_month DESC 
          LIMIT 1
        ) AS DECIMAL(15, 2)) as last_revenue,
        
        -- Growth Calculation
        CAST((
            COALESCE(
                 (
                    (SELECT revenue FROM monthly_reports mr WHERE mr.participant_id = p.id ORDER BY mr.report_year DESC, mr.report_month DESC LIMIT 1) -
                    (SELECT revenue FROM monthly_reports mr WHERE mr.participant_id = p.id ORDER BY mr.report_year ASC, mr.report_month ASC LIMIT 1)
                 ) / NULLIF((SELECT revenue FROM monthly_reports mr WHERE mr.participant_id = p.id ORDER BY mr.report_year ASC, mr.report_month ASC LIMIT 1), 0) * 100
            , 0)
        ) AS DECIMAL(10, 2)) as omset_growth

      FROM participants p
      LEFT JOIN profiles prof ON p.profile_id = prof.id
      LEFT JOIN users u ON prof.user_id = u.id
      LEFT JOIN businesses b ON b.participant_id = p.id
      LEFT JOIN batches batch ON p.batch_id = batch.id
      LEFT JOIN participant_groups grp ON p.group_id = grp.id
      LEFT JOIN (
        -- Select distinct addresses per profile to avoid row multiplication
        SELECT DISTINCT ON (profile_id) *
        FROM addresses
        ORDER BY profile_id, created_at DESC
      ) addr ON prof.id = addr.profile_id
      LEFT JOIN regencies r ON addr.regency_id = r.id
      LEFT JOIN provinces prov ON addr.province_id = prov.id

      ${whereClause}
      ORDER BY ${orderByClause}
      LIMIT ${pageSize} OFFSET ${skip}
    `;

    // Count Query for Pagination
    const totalRaw: any = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM participants p 
      LEFT JOIN profiles prof ON p.profile_id = prof.id
      LEFT JOIN users u ON prof.user_id = u.id
      LEFT JOIN businesses b ON b.participant_id = p.id
      LEFT JOIN (
        SELECT DISTINCT ON (profile_id) *
        FROM addresses
        ORDER BY profile_id, created_at DESC
      ) addr ON prof.id = addr.profile_id
      LEFT JOIN regencies r ON addr.regency_id = r.id
      LEFT JOIN provinces prov ON addr.province_id = prov.id
      ${whereClause}
    `;
    const total = Number(totalRaw[0]?.count || 0);

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    const data = serializeBigInt(participantsRaw).map((p: any) => ({
      ...p,
      nama: p.nama || p.username || "Unknown",
      nama_usaha: p.nama_usaha || "Unknown Business",
      new_employees: Number(p.new_employees),
      omset_growth: Number(p.omset_growth),
      last_revenue: Number(p.last_revenue)
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
