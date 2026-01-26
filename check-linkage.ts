import 'dotenv/config';
import { prisma } from './src/lib/prisma';

async function main() {
  try {
    const profilesWithUniv = await prisma.profiles.count({
      where: { NOT: { university_id: null } }
    });
    console.log('Total Profiles with University ID:', profilesWithUniv);

    const mentorProfilesWithUniv = await prisma.profiles.count({
      where: { 
        NOT: { university_id: null },
        users: {
            mentors: { isNot: null }
        }
      }
    });
    console.log('Mentor Profiles with University ID:', mentorProfilesWithUniv);

    const participantProfilesWithUniv = await prisma.profiles.count({
      where: { 
        NOT: { university_id: null },
        participants: { some: {} }
      }
    });
    console.log('Participant Profiles with University ID:', participantProfilesWithUniv);

    const participantsWithNoUniv = await prisma.participants.count({
        where: {
            profiles: {
                university_id: null
            }
        }
    });
    console.log('Participants with NO University ID in profile:', participantsWithNoUniv);

    // Check if there is any other way they are linked
    console.log('\nChecking first 5 participants and their profiles:');
    const samples = await prisma.participants.findMany({
        take: 5,
        include: {
            profiles: true
        }
    });
    samples.forEach(s => {
        console.log(`Participant ${s.id}: ProfileID: ${s.profile_id}, UnivID: ${s.profiles?.university_id}`);
    });

  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
