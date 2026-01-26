import 'dotenv/config';
import { prisma } from './src/lib/prisma';

async function main() {
  try {
    const totalMentorParticipants = await prisma.mentor_participants.count();
    console.log('Total Mentor-Participant Relationships:', totalMentorParticipants);

    const linkedToUniv = await prisma.mentor_participants.count({
        where: {
            mentors: {
                users: {
                    profiles: {
                        NOT: { university_id: null }
                    }
                }
            }
        }
    });
    console.log('Mentor-Participant Relationships linked to a University through Mentor:', linkedToUniv);

    const activeLinkedToActiveUniv = await prisma.mentor_participants.count({
        where: {
            participants: { status: 'active' },
            mentors: {
                users: {
                    profiles: {
                        universities: {
                            status: 'active'
                        }
                    }
                }
            }
        }
    });
    console.log('Active Participants linked to ACTIVE University via Mentor:', activeLinkedToActiveUniv);

  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
