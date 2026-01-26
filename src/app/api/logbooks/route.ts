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
    const sortBy = searchParams.get("sortBy") ?? "logbookDate";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";
    const skip = (page - 1) * pageSize;


    const filterVerified = searchParams.get("verified") ?? "";
    const filterDate = searchParams.get("date") ?? "";

    // Sort Mapping
    // verified -> is_verified
    // pendamping -> mentor_id
    // id_tkm -> participant_id
    // logbookDate -> activity_date
    const sortFieldMap: Record<string, string> = {
      verified: 'is_verified',
      pendamping: 'mentor_id',
      id_tkm: 'participant_id',
      logbookDate: 'activity_date',
      updated_at: 'updated_at'
    };
    const mappedSortBy = sortFieldMap[sortBy] || 'activity_date';

    const orderBy: Prisma.logbooksOrderByWithRelationInput = {};
    (orderBy as any)[mappedSortBy] = sortOrder;

    let pendampingIdsFromSearch: string[] = [];
    let participantIdsFromSearch: string[] = [];

    // Search Logic with UUIDs
    // Since we can't easily search UUIDs by string like integers, we rely on searching names via relations
    
    // Build Where Input
    const where: Prisma.logbooksWhereInput = {};

    if (search) {
        where.OR = [
            // Search text fields
            { activity_summary: { contains: search, mode: 'insensitive' } },
            { mentoring_material: { contains: search, mode: 'insensitive' } },
            { obstacles: { contains: search, mode: 'insensitive' } },
            { solutions: { contains: search, mode: 'insensitive' } },
            // Search relations
            { participants: { 
                profiles: {
                    users: {
                        username: { contains: search, mode: 'insensitive' }
                    }
                }
            } },
            { mentors: {
                users: {
                    username: { contains: search, mode: 'insensitive' }
                }
            } }
        ];
    }

    if (filterVerified) {
        where.is_verified = filterVerified;
    }
    if (filterDate && !Number.isNaN(Date.parse(filterDate))) {
        const startDate = new Date(filterDate);
        const endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
        where.activity_date = {
            gte: startDate,
            lt: endDate
        };
    }

    const logbooks = await prisma.logbooks.findMany({
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
                  }
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
    
    const total = await prisma.logbooks.count({ where });
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    const data = logbooks.map((item) => {
      const participantUser = item.participants?.profiles?.users;
      const mentorUser = item.mentors?.users;
      const mentorProfile = (mentorUser as any)?.profiles;
      
      // Attempt to map back to legacy-ish structure if frontend relies on it
      return {
        id: item.id,
        id_pendamping: item.mentor_id, 
        id_tkm: item.participants?.legacy_tkm_id, 
        participant_id: item.participant_id, 
        
        activitySummary: item.activity_summary || "",
        deliveryMethod: item.delivery_method || "",
        visitType: item.visit_type || "",
        logbookDate: item.activity_date,
        meetingType: item.meeting_type || "",
        mentoringMaterial: item.mentoring_material || "",
        obstacle: item.obstacles || "",
        solutions: item.solutions || "",
        startTime: item.start_time,
        endTime: item.end_time,
        totalExpense: Number(item.expense_amount || 0),
        verified: item.is_verified,
        no_expense_reason: item.no_expense_reason || "",
        
        created_at: item.created_at,
        updated_at: item.updated_at,
        
        // Extra info
        pendampingName: mentorProfile?.full_name || mentorUser?.username || "Unknown",
        pendampingPhoto: mentorProfile?.avatar_url || null,
        tkmName: item.participants?.profiles?.full_name || participantUser?.username || "Unknown",
        tkmPhoto: item.participants?.profiles?.avatar_url || null,
        pendampingUniversity: "",
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
    console.error("[logbooks] Failed to fetch", error);
    return NextResponse.json(
      { error: "Failed to fetch logbooks" },
      { status: 500 }
    );
  }
}
