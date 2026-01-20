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
    const participantsCount = await prisma.peserta.count({
      where: {
        NOT: { status: "Cadangan" },
      },
    });

    const mentorsCount = await prisma.user.count({
      where: {
        model_has_roles: {
          some: {
            role: {
              name: "user",
            },
          },
        },
      },
    });

    const universitiesCount = await prisma.university.count();

    const newEmployeesCountRaw: any[] = await prisma.$queryRaw`
      SELECT COUNT(DISTINCT id) as count FROM tkm_new_employee
    `;
    const newEmployeesCount = Number(newEmployeesCountRaw[0]?.count || 0);

    // 2. Map Data (Distribution by Province)
    const mapDistribution = await prisma.$queryRaw`
      SELECT provinsi_domisili as name, COUNT(*) as value
      FROM peserta
      WHERE provinsi_domisili IS NOT NULL AND status != 'Cadangan'
      GROUP BY provinsi_domisili
      ORDER BY value DESC
    `;

    // 3. Top 10 TKML Omzet Rate (Revenue Growth Month 0-3 equivalent)
    // Calculating growth as (Last Revenue - First Revenue) / First Revenue * 100
    const topOmzetParticipants = await prisma.$queryRaw`
      SELECT 
        p.nama, 
        p.nama_usaha,
        p.link_pas_foto as photo,
        CAST((
          COALESCE(
            (
              (SELECT revenue FROM capaian_output WHERE id_tkm = p.id_tkm ORDER BY month_report DESC LIMIT 1) - 
              (SELECT revenue FROM capaian_output WHERE id_tkm = p.id_tkm ORDER BY month_report ASC LIMIT 1)
            ) / NULLIF((SELECT revenue FROM capaian_output WHERE id_tkm = p.id_tkm ORDER BY month_report ASC LIMIT 1), 0) * 100
          , 0)
        ) AS DECIMAL(10, 2)) as growth,
         CAST((SELECT revenue FROM capaian_output WHERE id_tkm = p.id_tkm ORDER BY month_report DESC LIMIT 1) AS SIGNED) as last_revenue
      FROM peserta p
      WHERE p.status != 'Cadangan'
      ORDER BY growth DESC
      LIMIT 10
    `;

    // 4. University Stats (Aggregated)
    // Linking: University -> Profile -> User (Mentor) -> UserPeserta -> Peserta -> CapaianOutput
    // Note: Complex join needed.
    // We want: Univ Name, Total Mentors, Total Participants, Total New Employees, Avg Growth
    // 4. University Stats (Aggregated)
    // Simplified logic: Univ -> Profile -> UserPeserta -> Peserta
    // Removing strict role check as some active mentors might not have 'user' role explicitly but are in user_peserta.
    const universityStats = await prisma.$queryRaw`
       SELECT 
        u.name as university_name,
        COUNT(DISTINCT prof.user_id) as total_mentors,
        COUNT(DISTINCT CASE WHEN p.status != 'Cadangan' THEN up.id_tkm END) as total_participants,
        COALESCE(SUM(
          CASE WHEN p.status != 'Cadangan' THEN 
            (SELECT COUNT(DISTINCT ne.id) FROM tkm_new_employee ne JOIN capaian_output co2 ON ne.capaian_output_id = co2.id WHERE co2.id_tkm = p.id_tkm)
          ELSE 0 END
        ), 0) as total_new_employees,
        CAST(AVG(
           CASE WHEN p.status != 'Cadangan' THEN
             COALESCE(
              (
                (SELECT revenue FROM capaian_output WHERE id_tkm = p.id_tkm ORDER BY month_report DESC LIMIT 1) - 
                (SELECT revenue FROM capaian_output WHERE id_tkm = p.id_tkm ORDER BY month_report ASC LIMIT 1)
              ) / NULLIF((SELECT revenue FROM capaian_output WHERE id_tkm = p.id_tkm ORDER BY month_report ASC LIMIT 1), 0) * 100
            , 0)
           ELSE NULL END
        ) AS DECIMAL(10, 2)) as avg_growth
      FROM universities u
      JOIN profiles prof ON prof.univ_id = u.id
      LEFT JOIN user_peserta up ON up.admin_id = prof.user_id
      LEFT JOIN peserta p ON up.id_tkm = p.id_tkm
      GROUP BY u.id, u.name
      HAVING total_mentors > 0
      ORDER BY avg_growth DESC
    `;

    // 5. Top Mentors by Visits (Perorangan + Luring)
    // admin_id in logbook_harian is assumed to be the mentor's user_id. 
    // Schema check: logbook_harian has id_pendamping (BigInt), which usually maps to User.id
    // 5. Top Mentors by Visits (Perorangan + Luring)
    // Data check shows visitType is 'lokal' or 'luar_kota', and meetingType is 'perorangan'.
    // Adjusting filter to match these values.
    const topMentorsVisits = await prisma.$queryRaw`
      SELECT 
        u.name,
        p.foto,
        COUNT(lh.id) as visit_count
      FROM logbook_harian lh
      JOIN users u ON u.id = lh.id_pendamping
      LEFT JOIN profiles p ON p.user_id = u.id
      WHERE 
        lh.meetingType = 'perorangan' 
        AND lh.visitType IN ('lokal', 'luar_kota', 'Luring')
      GROUP BY lh.id_pendamping, u.name, p.foto
      ORDER BY visit_count DESC
      LIMIT 10
    `;

    // 6. Summary Omzet Rate (Global Average)
    const summaryOmzetRaw: any[] = await prisma.$queryRaw`
      SELECT 
        CAST(AVG(
           COALESCE(
            (
              (SELECT revenue FROM capaian_output WHERE id_tkm = p.id_tkm ORDER BY month_report DESC LIMIT 1) - 
              (SELECT revenue FROM capaian_output WHERE id_tkm = p.id_tkm ORDER BY month_report ASC LIMIT 1)
            ) / NULLIF((SELECT revenue FROM capaian_output WHERE id_tkm = p.id_tkm ORDER BY month_report ASC LIMIT 1), 0) * 100
          , 0)
        ) AS DECIMAL(10, 2)) as avg_growth
      FROM peserta p
      WHERE p.status != 'Cadangan'
    `;
    const summaryOmzetGrowth = Number(summaryOmzetRaw[0]?.avg_growth || 0);


    // Explicitly convert types for serialization compatibility
    const safeMapDistribution: any[] = (mapDistribution as any[]).map((m: any) => ({
      ...m,
      value: Number(m.value)
    }));

    const safeTopOmzetParticipants: any[] = (topOmzetParticipants as any[]).map((p: any) => ({
      ...p,
      growth: Number(p.growth),
      last_revenue: Number(p.last_revenue)
    }));

    const safeUniversityStats: any[] = (universityStats as any[]).map((u: any) => ({
      ...u,
      total_mentors: Number(u.total_mentors),
      total_participants: Number(u.total_participants),
      total_new_employees: Number(u.total_new_employees),
      avg_growth: Number(u.avg_growth)
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
      universityStats: safeUniversityStats,
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
