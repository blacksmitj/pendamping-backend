import 'dotenv/config';
import { prisma } from './src/lib/prisma';

async function main() {
  try {
    console.log('Testing Query 1: Participants Count');
    const participantsCount = await prisma.participants.count({
      where: {
        status: "active",
        profiles: {
            universities: {
                status: "active"
            }
        }
      },
    });
    console.log('Query 1 Result:', participantsCount);

    console.log('\nTesting Query 2: Mentors Count');
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
    console.log('Query 2 Result:', mentorsCount);

    console.log('\nTesting Query 3: Universities Count');
    const universitiesCount = await (prisma as any).universities.count({
        where: { status: 'active' }
    });
    console.log('Query 3 Result:', universitiesCount);

    console.log('\nTesting Query 4: New Employees Count');
    const newEmployeesCount = await prisma.business_employees.count({
        where: {
            businesses: {
                participants: {
                    profiles: {
                        universities: {
                            status: 'active'
                        }
                    }
                }
            }
        }
    });
    console.log('Query 4 Result:', newEmployeesCount);

    console.log('\nTesting Query 5: Raw SQL Distribution');
    const regencyDistributionRaw: any[] = await prisma.$queryRaw`
      SELECT 
        addr.regency_name as name, 
        COUNT(DISTINCT b.id) as value,
        AVG(CAST(addr.latitude AS DOUBLE PRECISION)) as lat,
        AVG(CAST(addr.longitude AS DOUBLE PRECISION)) as lng
      FROM addresses addr
      JOIN profiles prof ON addr.profile_id = prof.id
      JOIN universities u ON prof.university_id = u.id
      JOIN participants p ON prof.id = p.profile_id
      LEFT JOIN businesses b ON p.id = b.participant_id
      WHERE p.status = 'active'
        AND addr.regency_name IS NOT NULL
        AND u.status = 'active'
      GROUP BY addr.regency_name
      ORDER BY value DESC
    `;
    console.log('Query 5 Result Count:', regencyDistributionRaw.length);

    console.log('\nTesting Query 6: Raw SQL Top Omzet');
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
      JOIN universities univ ON prof.university_id = univ.id
      LEFT JOIN users u ON prof.user_id = u.id
      WHERE p.status = 'active' AND univ.status = 'active'
      ORDER BY pg.growth DESC
      LIMIT 10
    `;
    console.log('Query 6 Result Count:', (topOmzetParticipants as any[]).length);

  } catch (error) {
    console.error('ERROR during testing:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
