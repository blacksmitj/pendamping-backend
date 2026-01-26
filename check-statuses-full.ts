import 'dotenv/config';
import { prisma } from './src/lib/prisma';

async function main() {
  try {
    const allUniqueStatuses = await prisma.participants.findMany({
      select: { status: true },
      distinct: ['status'],
    });
    console.log('ALL_STATUSES_START');
    console.log(JSON.stringify(allUniqueStatuses, null, 2));
    console.log('ALL_STATUSES_END');
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
