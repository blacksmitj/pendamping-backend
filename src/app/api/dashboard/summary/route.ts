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

export async function GET() {
  try {
    // Shared filters
    const activeUnivFilter: Prisma.universitiesWhereInput = {
      status: { in: ['aktif', 'active'] }
    };
    const activeParticipantFilter: Prisma.participantsWhereInput = {
      status: { in: ['aktif', 'active'] },
      universities: activeUnivFilter
    };

    // 1. Basic Counts
    const participantsCount = await prisma.participants.count({
      where: activeParticipantFilter,
    });

    const mentorsCount = await prisma.mentors.count({
      where: {
        users: {
          profiles: {
            universities: activeUnivFilter
          }
        }
      },
    });

    const universitiesCount = await prisma.universities.count({
      where: activeUnivFilter
    });

    const newEmployeesCount = await prisma.business_employees.count({
      where: {
        businesses: {
          participants: {
            universities: activeUnivFilter
          }
        }
      }
    });

    // Fetch Base Data for aggregations
    // To avoid too many raw queries and simplify logic, we fetch active participants with necessary relations
    // For a dashboard, we might want to aggregate more efficiently, but for clarity and "No Raw SQL" req:
    const activeData = await prisma.participants.findMany({
      where: activeParticipantFilter,
      include: {
        profiles: {
          include: {
            users: true,
            addresses: true,
          }
        },
        businesses: {
          include: {
            business_employees: true
          }
        },
        monthly_reports: {
          orderBy: [
            { report_year: 'asc' },
            { report_month: 'asc' }
          ]
        },
        universities: true
      }
    });

    // 2. Map Data (Distribution by Regency)
    const distributionMap = new Map<string, { value: number; lat: number; lng: number; count: number }>();
    activeData.forEach(p => {
      const address = p.profiles?.addresses?.[0]; // Get primary/latest address
      if (address?.regency_name) {
        const name = address.regency_name;
        const current = distributionMap.get(name) || { value: 0, lat: 0, lng: 0, count: 0 };

        // Business existence counts towards value (as per legacy query)
        if (p.businesses.length > 0) current.value++;

        if (address.latitude && address.longitude) {
          current.lat += Number(address.latitude);
          current.lng += Number(address.longitude);
          current.count++;
        }
        distributionMap.set(name, current);
      }
    });

    const regencyDistribution = Array.from(distributionMap.entries()).map(([name, d]) => ({
      name,
      value: d.value,
      lat: d.count > 0 ? d.lat / d.count : 0,
      lng: d.count > 0 ? d.lng / d.count : 0
    })).sort((a, b) => b.value - a.value);

    // 3. Top 10 TKML Omzet Rate (Revenue Growth)
    const participantsWithGrowth = activeData.map(p => {
      const reports = p.monthly_reports || [];
      const first = reports[0];
      const last = reports[reports.length - 1];
      let growth = 0;
      if (first && last && Number(first.revenue) > 0) {
        growth = ((Number(last.revenue) - Number(first.revenue)) / Number(first.revenue)) * 100;
      }
      return {
        nama: p.profiles?.full_name || p.profiles?.users?.email || "Unknown",
        nama_usaha: p.businesses?.[0]?.name || "Unknown Business",
        photo: p.profiles?.avatar_url,
        growth,
        last_revenue: last ? Number(last.revenue) : 0
      };
    }).sort((a, b) => b.growth - a.growth).slice(0, 10);

    // 4. University Stats
    const univStatsMap = new Map<string, { total_mentors: Set<string>; total_participants: number; total_new_employees: number; growth_sum: number }>();

    // Fetch mentors with university info from profiles
    const mentors = await prisma.mentors.findMany({
      include: {
        users: {
          include: {
            profiles: {
              include: { universities: true }
            }
          }
        }
      }
    });

    // Map university ID to name for easier mentor lookups
    const univIdToName = new Map<string, string>();
    activeData.forEach(p => {
      if (p.universities) {
        univIdToName.set(p.universities.id, p.universities.name);
      }
    });

    activeData.forEach(p => {
      const univName = p.universities?.name;
      if (univName) {
        const stats = univStatsMap.get(univName) || { total_mentors: new Set(), total_participants: 0, total_new_employees: 0, growth_sum: 0 };
        stats.total_participants++;
        stats.total_new_employees += p.businesses.reduce((acc, b) => acc + b.business_employees.length, 0);

        const reports = p.monthly_reports || [];
        if (reports.length >= 2 && Number(reports[0].revenue) > 0) {
          stats.growth_sum += ((Number(reports[reports.length - 1].revenue) - Number(reports[0].revenue)) / Number(reports[0].revenue)) * 100;
        }
        univStatsMap.set(univName, stats);
      }
    });

    // Add mentors to univ stats based on their profile's university_id
    mentors.forEach(m => {
      const univId = m.users?.profiles?.university_id;
      if (univId) {
        const univName = univIdToName.get(univId);
        if (univName) {
          const stats = univStatsMap.get(univName);
          if (stats) {
            stats.total_mentors.add(m.id);
          }
        }
      }
    });

    const universityStats = Array.from(univStatsMap.entries()).map(([name, s]) => ({
      university_name: name,
      total_mentors: s.total_mentors.size,
      total_participants: s.total_participants,
      total_new_employees: s.total_new_employees,
      avg_growth: s.total_participants > 0 ? s.growth_sum / s.total_participants : 0
    })).sort((a, b) => b.total_participants - a.total_participants);

    // 5. Top Mentors by Visits
    // Fetch logbooks and mentors
    const logbooks = await prisma.logbooks.findMany({
      where: {
        meeting_type: 'perorangan',
        visit_type: { in: ['lokal', 'luar_kota', 'Luring'] },
        mentors: {
          users: {
            profiles: {
              universities: activeUnivFilter
            }
          }
        }
      },
      include: {
        mentors: {
          include: {
            users: { include: { profiles: true } }
          }
        }
      }
    });

    const mentorVisitMap = new Map<string, { name: string; foto: string | null; count: number }>();
    logbooks.forEach(l => {
      if (l.mentors) {
        const m = l.mentors;
        const current = mentorVisitMap.get(m.id) || { name: m.users?.email || "Unknown", foto: m.users?.profiles?.avatar_url || null, count: 0 };
        current.count++;
        mentorVisitMap.set(m.id, current);
      }
    });

    const topMentorsVisits = Array.from(mentorVisitMap.values())
      .map(m => ({ name: m.name, foto: m.foto, visit_count: m.count }))
      .sort((a, b) => b.visit_count - a.visit_count)
      .slice(0, 10);

    // 6. Summary Omzet Rate (Global Average)
    const allGrowth = activeData.map(p => {
      const reports = p.monthly_reports || [];
      const first = reports[0];
      const last = reports[reports.length - 1];
      if (first && last && Number(first.revenue) > 0) {
        return ((Number(last.revenue) - Number(first.revenue)) / Number(first.revenue)) * 100;
      }
      return null;
    }).filter((g): g is number => g !== null);

    const totalGrowth = allGrowth.reduce((acc, g) => acc + g, 0);
    const summaryOmzetGrowth = allGrowth.length > 0 ? totalGrowth / allGrowth.length : 0;

    return NextResponse.json(serializeBigInt({
      counts: {
        participants: participantsCount,
        mentors: mentorsCount,
        universities: universitiesCount,
        newEmployees: newEmployeesCount,
        avgOmzetGrowth: summaryOmzetGrowth
      },
      mapDistribution: regencyDistribution,
      topOmzetParticipants: participantsWithGrowth,
      universityStats: universityStats,
      topMentorsVisits: topMentorsVisits,
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
