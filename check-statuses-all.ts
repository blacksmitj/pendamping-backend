import 'dotenv/config';
import { prisma } from './src/lib/prisma';

async function main() {
  try {
    const participantStatuses = await prisma.participants.findMany({
      select: { status: true },
      distinct: ['status'],
    });
    console.log('PARTICIPANT_STATUSES:', participantStatuses);

    const universityStatuses = await prisma.universities.findMany({
      select: { status: true },
      distinct: ['status'],
    });
    console.log('UNIVERSITY_STATUSES:', universityStatuses);

  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
