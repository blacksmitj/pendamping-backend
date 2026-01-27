import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Helper to handle BigInt serialization
function serializeBigInt(data: any): any {
  return JSON.parse(
    JSON.stringify(data, (key, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
}

export async function GET() {
  try {
    // 1. Basic Counts
    const participantsCount = await prisma.participants.count({
      where: {
        status: "active",
        universities: {
            status: "active"
        }
      },
    });

    const mentorsCount = await prisma.users.count({
      where: {
        roles: {
            name: { in: ['mentor', 'user'] }
        },
        profiles: {
            universities: {
                status: "active"
            }
        }
      },
    });

    const universitiesCount = (prisma as any).universities ? await (prisma as any).universities.count({
        where: { status: 'active' }
    }) : 0;

    const newEmployeesCount = await prisma.business_employees.count({
        where: {
            businesses: {
                participants: {
                    universities: {
                        status: 'active'
                    }
                }
            }
        }
    });

    // 2. Map Data (Distribution by Province)
    // Participants -> Profiles -> Addresses -> Provinces
    // We want active participants distribution
    const regencyDistributionRaw: any[] = await prisma.$queryRaw`
      SELECT 
        addr.regency_name as name, 
        COUNT(DISTINCT b.id) as value,
        AVG(CAST(addr.latitude AS DOUBLE PRECISION)) as lat,
        AVG(CAST(addr.longitude AS DOUBLE PRECISION)) as lng
      FROM addresses addr
      JOIN profiles prof ON addr.profile_id = prof.id
      JOIN participants p ON prof.id = p.profile_id
      JOIN universities u ON p.university_id = u.id
      LEFT JOIN businesses b ON p.id = b.participant_id
      WHERE p.status = 'active'
        AND addr.regency_name IS NOT NULL
        AND u.status = 'active'
      GROUP BY addr.regency_name
      ORDER BY value DESC
    `;

    // 3. Top 10 TKML Omzet Rate (Revenue Growth)
    // Logic: (Last Revenue - First Revenue) / First Revenue * 100
    // We need to fetch participants with their first and last monthly report revenue.
    // Complex to do efficiently in one query without Window Functions.
    // Use raw SQL with window functions.
    const topOmzetParticipants = await prisma.$queryRaw`
      WITH RankedReports AS (
        SELECT 
          mr.participant_id,
          mr.revenue,
          mr.report_year,
          mr.report_month,
          ROW_NUMBER() OVER (PARTITION BY mr.participant_id ORDER BY mr.report_year ASC, mr.report_month ASC) as rn_asc,
          ROW_NUMBER() OVER (PARTITION BY mr.participant_id ORDER BY mr.report_year DESC, mr.report_month DESC) as rn_desc
        FROM monthly_reports mr
        WHERE mr.revenue IS NOT NULL
      ),
      ParticipantGrowth AS (
        SELECT 
          r1.participant_id,
          r1.revenue as first_revenue,
          r2.revenue as last_revenue,
          CASE 
            WHEN r1.revenue = 0 THEN 0 
            ELSE ((r2.revenue - r1.revenue) / r1.revenue) * 100 
          END as growth
        FROM RankedReports r1
        JOIN RankedReports r2 ON r1.participant_id = r2.participant_id
        WHERE r1.rn_asc = 1 AND r2.rn_desc = 1
      )
      SELECT 
        COALESCE(prof.full_name, u.username, 'Unknown') as nama, 
        COALESCE(b.name, 'Unknown Business') as nama_usaha, 
        prof.avatar_url as photo,
        pg.growth,
        pg.last_revenue
      FROM ParticipantGrowth pg
      JOIN participants p ON pg.participant_id = p.id
      LEFT JOIN businesses b ON p.id = b.participant_id
      LEFT JOIN profiles prof ON p.profile_id = prof.id
      JOIN universities univ ON p.university_id = univ.id
      LEFT JOIN users u ON prof.user_id = u.id
      WHERE p.status = 'active' AND univ.status = 'active'
      ORDER BY pg.growth DESC
      LIMIT 10
    `;

    // 4. University Stats
    let universityStats: any[] = [];
    if ((prisma as any).universities) {
        const universityStatsRaw: any[] = await prisma.$queryRaw`
          WITH RankedReports AS (
            SELECT 
              mr.participant_id,
              mr.revenue,
              ROW_NUMBER() OVER (PARTITION BY mr.participant_id ORDER BY mr.report_year ASC, mr.report_month ASC) as rn_asc,
              ROW_NUMBER() OVER (PARTITION BY mr.participant_id ORDER BY mr.report_year DESC, mr.report_month DESC) as rn_desc
            FROM monthly_reports mr
            WHERE mr.revenue IS NOT NULL
          ),
          ParticipantGrowth AS (
            SELECT 
              r1.participant_id,
              CASE 
                WHEN r1.revenue = 0 THEN 0 
                ELSE ((r2.revenue - r1.revenue) / r1.revenue) * 100 
              END as growth
            FROM RankedReports r1
            JOIN RankedReports r2 ON r1.participant_id = r2.participant_id
            WHERE r1.rn_asc = 1 AND r2.rn_desc = 1
          ),
          ParticipantStats AS (
            SELECT 
              p.id as participant_id,
              COALESCE(pg.growth, 0) as growth,
              (SELECT COUNT(*) FROM business_employees be JOIN businesses b ON be.business_id = b.id WHERE b.participant_id = p.id) as emp_count
            FROM participants p
            LEFT JOIN ParticipantGrowth pg ON p.id = pg.participant_id
            WHERE p.status = 'active'
          ),
          UnivStats AS (
            SELECT 
              u.name as university_name,
              m.id as mentor_id,
              mp.participant_id,
              u.status as univ_status
            FROM universities u
            JOIN profiles prof ON u.id = prof.university_id
            JOIN users us ON prof.user_id = us.id
            JOIN mentors m ON us.id = m.user_id
            LEFT JOIN mentor_participants mp ON m.id = mp.mentor_id
            WHERE u.status = 'active'
          )
          SELECT 
            us.university_name,
            CAST(COUNT(DISTINCT us.mentor_id) AS INTEGER) as total_mentors,
            CAST(COUNT(DISTINCT ps.participant_id) AS INTEGER) as total_participants,
            COALESCE(CAST(SUM(ps.emp_count) AS INTEGER), 0) as total_new_employees,
            COALESCE(AVG(ps.growth), 0) as avg_growth
          FROM UnivStats us
          LEFT JOIN ParticipantStats ps ON us.participant_id = ps.participant_id
          GROUP BY us.university_name
          ORDER BY total_participants DESC
        `;

        universityStats = universityStatsRaw.map(u => ({
          university_name: u.university_name,
          total_mentors: Number(u.total_mentors),
          total_participants: Number(u.total_participants),
          total_new_employees: Number(u.total_new_employees),
          avg_growth: Number(u.avg_growth)
        }));
    } else {
        console.warn("[dashboard-summary] Skipping universityStats because model is not available in Prisma client");
    }

    // 5. Top Mentors by Visits
    const topMentorsVisits = await prisma.$queryRaw`
      SELECT 
        COALESCE(u.username, 'Unknown') as name,
        prof.avatar_url as foto,
        COUNT(l.id) as visit_count
      FROM logbooks l
      JOIN mentors m ON l.mentor_id = m.id
      JOIN users u ON m.user_id = u.id
      LEFT JOIN profiles prof ON u.id = prof.user_id
      JOIN universities univ ON prof.university_id = univ.id
      WHERE 
        l.meeting_type = 'perorangan' 
        AND l.visit_type IN ('lokal', 'luar_kota', 'Luring')
        AND univ.status = 'active'
      GROUP BY m.id, u.username, prof.avatar_url
      ORDER BY visit_count DESC
      LIMIT 10
    `;

    // 6. Summary Omzet Rate (Global Average)
    // Reuse the CTE logic from #3 but avg
    const summaryOmzetRaw: any[] = await prisma.$queryRaw`
      WITH RankedReports AS (
        SELECT 
          mr.participant_id,
          mr.revenue,
          ROW_NUMBER() OVER (PARTITION BY mr.participant_id ORDER BY mr.report_year ASC, mr.report_month ASC) as rn_asc,
          ROW_NUMBER() OVER (PARTITION BY mr.participant_id ORDER BY mr.report_year DESC, mr.report_month DESC) as rn_desc
        FROM monthly_reports mr
        WHERE mr.revenue IS NOT NULL
      ),
      ParticipantGrowth AS (
        SELECT 
          CASE 
            WHEN r1.revenue = 0 THEN 0 
            ELSE ((r2.revenue - r1.revenue) / r1.revenue) * 100 
          END as growth
        FROM RankedReports r1
        JOIN RankedReports r2 ON r1.participant_id = r2.participant_id
        JOIN participants p ON r1.participant_id = p.id
        JOIN universities u ON p.university_id = u.id
        WHERE r1.rn_asc = 1 AND r2.rn_desc = 1 AND u.status = 'active'
      )
      SELECT AVG(growth) as avg_growth FROM ParticipantGrowth
    `;
    const summaryOmzetGrowth = Number(summaryOmzetRaw[0]?.avg_growth || 0);

    // Serialization & Safety
    const safeMapDistribution = regencyDistributionRaw.map((m: any) => ({
        name: m.name,
        value: Number(m.value),
        lat: m.lat ? Number(m.lat) : null,
        lng: m.lng ? Number(m.lng) : null
    }));

    const safeTopOmzetParticipants: any[] = (topOmzetParticipants as any[]).map((p: any) => ({
      ...p,
      growth: Number(p.growth),
      last_revenue: Number(p.last_revenue)
    }));

    const safeTopMentorsVisits: any[] = (topMentorsVisits as any[]).map((m: any) => ({
      ...m,
      visit_count: Number(m.visit_count)
    }));

    return NextResponse.json(serializeBigInt({
      counts: {
        participants: participantsCount,
        mentors: mentorsCount,
        universities: universitiesCount,
        newEmployees: newEmployeesCount,
        avgOmzetGrowth: summaryOmzetGrowth
      },
      mapDistribution: safeMapDistribution,
      topOmzetParticipants: safeTopOmzetParticipants,
      universityStats: universityStats,
      topMentorsVisits: safeTopMentorsVisits,
      updatedAt: new Date().toISOString(),
    }));
  } catch (error) {
    console.error("[dashboard-summary] Failed to fetch", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard summary" },
      { status: 500 }
    );
  }
}
