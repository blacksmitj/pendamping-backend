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
    const sortBy = searchParams.get("sortBy") ?? "month_report";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";
    const skip = (page - 1) * pageSize;

    const filterCondition = searchParams.get("condition") ?? "";
    const filterVerified = searchParams.get("verified") ?? "";
    const filterDate = searchParams.get("date") ?? "";

    // Mapping sort columns to new schema fields
    // month_report -> report_month (and report_year)
    // verified -> is_verified
    // pendamping -> mentor_id
    // id_tkm -> participant_id
    // condition -> business_condition
    
    const sortFieldMap: Record<string, string> = {
      verified: 'is_verified',
      pendamping: 'mentor_id',
      id_tkm: 'participant_id',
      condition: 'business_condition',
      month_report: 'report_month'
    };
    
    const mappedSortBy = sortFieldMap[sortBy] || 'updated_at';

    // Build Where Input
    const where: Prisma.monthly_reportsWhereInput = {};

    if (search) {
        where.OR = [
            { business_condition: { contains: search, mode: 'insensitive' } },
            { obstacles: { contains: search, mode: 'insensitive' } },
            // Search by participant name if possible via relation logic
             { participants: { 
                 profiles: {
                     users: {
                         username: { contains: search, mode: 'insensitive' }
                     }
                 }
             } }
        ];
    }
    
    if (filterCondition) {
        where.business_condition = { contains: filterCondition, mode: 'insensitive' };
    }
    if (filterVerified) {
        where.is_verified = filterVerified;
    }
    if (filterDate && !Number.isNaN(Date.parse(filterDate))) {
        const startDate = new Date(filterDate);
        const endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
        where.updated_at = {
            gte: startDate,
            lt: endDate
        };
    }

    const orderBy: Prisma.monthly_reportsOrderByWithRelationInput = {};
    if (mappedSortBy === 'report_month') {
        orderBy.report_year = sortOrder as Prisma.SortOrder;
        // Secondary sort?
    } else {
        (orderBy as any)[mappedSortBy] = sortOrder;
    }

    const outputs = await prisma.monthly_reports.findMany({
      take: pageSize,
      skip,
      orderBy,
      where,
      include: {
          participants: {
              include: {
                  profiles: {
                      include: {
                          users: true
                      }
                  },
                  batches: true 
              }
          },
          mentors: {
              include: {
                  users: {
                      include: {
                          profiles: true
                      }
                  }
              }
          }
      }
    });

    const total = await prisma.monthly_reports.count({ where });
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    // Transform data to match previous API response structure as much as possible
    const data = outputs.map(item => {
        const participantProfile = item.participants?.profiles;
        const participantUser = participantProfile?.users;
        const mentorUser = item.mentors?.users;
        const mentorProfile = (mentorUser as any)?.profiles;
        
        return {
            id: item.id,
            id_pendamping: item.mentor_id, 
            id_tkm: item.participants?.legacy_tkm_id, 
            participant_id: item.participant_id, 
            
            month_report: item.report_month,
            bookkeeping_cashflow: item.bookkeeping_cashflow ? "T" : "F",
            bookkeeping_income_statement: item.bookkeeping_income_statement ? "T" : "F",
            cashflow_proof_url: null, 
            income_proof_url: null,
            sales_volume: item.sales_volume ? Number(item.sales_volume) : 0,
            sales_volume_unit: item.sales_unit,
            production_capacity: item.production_capacity ? Number(item.production_capacity) : 0,
            production_capacity_unit: item.production_unit,
            marketing_area: item.marketing_area,
            revenue: Number(item.revenue || 0),
            obstacle: item.obstacles,
            business_condition: item.business_condition,
            created_at: item.created_at,
            updated_at: item.updated_at,
            isverified: item.is_verified,
            
            // Extra fields for UI table
            pendampingName: mentorProfile?.full_name || mentorUser?.username || "Unknown",
            pendampingPhoto: mentorProfile?.avatar_url || null,
            pendampingUniversity: "",
            tkmName: participantProfile?.full_name || participantUser?.username || "Unknown",
            tkmPhoto: participantProfile?.avatar_url || null,
        };
    });

    return NextResponse.json({
      data,
      total,
      page,
      pageSize,
      totalPages,
    });
  } catch (error) {
    console.error("[outputs] Failed to fetch", error);
    return NextResponse.json(
      { error: "Failed to fetch capaian output" },
      { status: 500 }
    );
  }
}
