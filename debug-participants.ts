import 'dotenv/config';
import { prisma } from './src/lib/prisma';

async function main() {
  try {
    const totalActiveParticipants = await prisma.participants.count({
      where: { status: 'active' }
    });
    console.log('Total Active Participants (DB):', totalActiveParticipants);

    const activeParticipantsWithUniv = await prisma.participants.count({
      where: {
        status: 'active',
        profiles: {
          NOT: { university_id: null }
        }
      }
    });
    console.log('Active Participants with University ID:', activeParticipantsWithUniv);

    const activeParticipantsWithActiveUniv = await prisma.participants.count({
      where: {
        status: 'active',
        profiles: {
          universities: {
            status: 'active'
          }
        }
      }
    });
    console.log('Active Participants with ACTIVE University:', activeParticipantsWithActiveUniv);

    const univCount = await prisma.universities.count();
    console.log('Total Universities in DB:', univCount);

    const activeUnivCount = await prisma.universities.count({
      where: { status: 'active' }
    });
    console.log('Active Universities in DB:', activeUnivCount);

    // Let's check a few samples of participants to see their university links
    const samples = await prisma.participants.findMany({
        where: { status: 'active' },
        take: 5,
        include: {
            profiles: {
                include: {
                    universities: true
                }
            }
        }
    });
    console.log('Sample Participants Links:');
    samples.forEach(s => {
        console.log(`- Participant ID: ${s.id}, Univ ID: ${s.profiles?.university_id}, Univ Name: ${s.profiles?.universities?.name}, Univ Status: ${s.profiles?.universities?.status}`);
    });

  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
