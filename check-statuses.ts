import 'dotenv/config';
import { prisma } from './src/lib/prisma';

async function main() {
  try {
    const statuses = await prisma.participants.groupBy({
      by: ['status'],
      _count: { id: true }
    });
    console.log('STATUS_DATA_START');
    console.log(JSON.stringify(statuses, null, 2));
    console.log('STATUS_DATA_END');
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
