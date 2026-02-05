import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

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
    const sortBy = searchParams.get("sortBy") ?? "registered";
    const sortOrder = (searchParams.get("sortOrder") === "asc" ? "asc" : "desc") as Prisma.SortOrder;
    const status = searchParams.get("status");
    const province = searchParams.get("province");
    const city = searchParams.get("city");
    const sector = searchParams.get("sector");
    const batch = searchParams.get("batch");

    const skip = (page - 1) * pageSize;

    // Sort Mapping
    const sortMapping: Record<string, Prisma.participantsOrderByWithRelationInput> = {
      name: { profiles: { full_name: sortOrder } },
      status: { status: sortOrder },
      registered: { created_at: sortOrder },
      business_name: { businesses: { _count: sortOrder } }, // Prisma doesn't support sorting by related field's property directly if it's 1-to-many easily without raw SQL or dedicated field. But we usually have one business.
      // For now, let's use the most common direct sorts.
      // Prisma 5.x allows sorting by relation properties if it's 1-to-1.
      // Since businesses is 1-to-many, we might need to simplify or use raw query.
      // However, for business name specifically, we can try:
    };

    // Special handling for relation sorts if needed
    let orderBy: any = sortMapping[sortBy];

    if (sortBy === "business_name") {
      // businesses is a list, so we can't sort by its fields directly in findMany easily.
      // But we can try to use a specific order if we know there is only one.
      // For simplicity in this demo, we'll keep it as is or handle in memory if data is small.
      // Let's stick to fields we can definitely sort on.
    } else if (sortBy === "sector") {
      // same as business_name
    }

    if (!orderBy) {
      if (sortBy === "newest") orderBy = { created_at: "desc" };
      else if (sortBy === "oldest") orderBy = { created_at: "asc" };
      else orderBy = { created_at: "desc" };
    }

    // Build WHERE conditions
    const where: Prisma.participantsWhereInput = {};

    if (search) {
      where.OR = [
        { profiles: { full_name: { contains: search, mode: 'insensitive' } } },
        { businesses: { some: { name: { contains: search, mode: 'insensitive' } } } },
        { profiles: { addresses: { some: { regency_name: { contains: search, mode: 'insensitive' } } } } }
      ];
    }

    if (status && status !== "all") {
      where.status = status;
    }

    if ((province && province !== "all") || (city && city !== "all")) {
      where.profiles = {
        addresses: {
          some: {
            ...(province && province !== "all" ? { province_name: province } : {}),
            ...(city && city !== "all" ? { regency_name: city } : {})
          }
        }
      };
    }

    if (sector && sector !== "all") {
      where.businesses = {
        some: { sector }
      };
    }

    if (batch && batch !== "all") {
      where.batches = {
        code: batch
      };
    }

    // Main Query
    const participants = await prisma.participants.findMany({
      skip,
      take: pageSize,
      where,
      orderBy,
      include: {
        profiles: {
          include: {
            users: true,
            addresses: {
              orderBy: { created_at: 'desc' },
              take: 1
            }
          }
        },
        businesses: {
          include: {
            business_employees: true
          }
        },
        batches: true,
        participant_groups: true,
        monthly_reports: {
          orderBy: [
            { report_year: 'asc' },
            { report_month: 'asc' }
          ]
        }
      }
    });

    const total = await prisma.participants.count({ where });
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    const data = participants.map((p) => {
      const profile = p.profiles;
      const user = profile?.users;
      const business = p.businesses?.[0]; // Usually one main business
      const address = profile?.addresses?.[0];

      const reports = p.monthly_reports || [];
      const firstReport = reports[0];
      const lastReport = reports[reports.length - 1];

      let growth = 0;
      if (firstReport && lastReport && Number(firstReport.revenue) > 0) {
        growth = ((Number(lastReport.revenue) - Number(firstReport.revenue)) / Number(firstReport.revenue)) * 100;
      }

      return {
        id: p.id,
        id_tkm: p.legacy_tkm_id,
        nama: profile?.full_name || user?.email || "Unknown",
        nama_usaha: business?.name || "Unknown Business",
        status: p.status,
        kota_domisili: address?.regency_name || "Unknown",
        provinsi_domisili: address?.province_name || "Unknown",
        sektor_usaha: business?.sector || "Unknown Sector",
        tanggal_daftar: p.created_at,
        no_whatsapp: profile?.whatsapp_number,
        photo: profile?.avatar_url,
        batch_code: p.batches?.code,
        group_name: p.participant_groups?.name,
        new_employees: business?.business_employees?.length || 0,
        last_revenue: lastReport ? Number(lastReport.revenue) : 0,
        omset_growth: growth
      };
    });

    // Handle in-memory sorting for non-Prisma fields if requested
    if (sortBy === "revenue_growth") {
      data.sort((a, b) => b.omset_growth - a.omset_growth);
    } else if (sortBy === "omset_highest") {
      data.sort((a, b) => b.last_revenue - a.last_revenue);
    } else if (sortBy === "omset_lowest") {
      data.sort((a, b) => a.last_revenue - b.last_revenue);
    } else if (sortBy === "business_name") {
      data.sort((a, b) => {
        const nameA = a.nama_usaha || "";
        const nameB = b.nama_usaha || "";
        return sortOrder === "asc" ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
      });
    } else if (sortBy === "sector") {
      data.sort((a, b) => {
        const sectorA = a.sektor_usaha || "";
        const sectorB = b.sektor_usaha || "";
        return sortOrder === "asc" ? sectorA.localeCompare(sectorB) : sectorB.localeCompare(sectorA);
      });
    }

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
