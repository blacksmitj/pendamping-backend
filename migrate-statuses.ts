import 'dotenv/config';
import { prisma } from './src/lib/prisma';

async function main() {
  try {
    console.log('Starting participant status migration...');

    // Update 'Diterima' variants to 'active'
    const updateActive = await prisma.participants.updateMany({
      where: {
        status: {
          in: ['Diterima', 'diterima', 'Active', 'ACTIVE'],
          mode: 'insensitive'
        }
      },
      data: {
        status: 'active'
      }
    });
    console.log(`Updated ${updateActive.count} participants to 'active'`);

    // Update 'Cadangan' variants to 'deactive'
    const updateDeactive = await prisma.participants.updateMany({
      where: {
        status: {
          in: ['Cadangan', 'cadangan', 'Deactive', 'DEACTIVE'],
          mode: 'insensitive'
        }
      },
      data: {
        status: 'deactive'
      }
    });
    console.log(`Updated ${updateDeactive.count} participants to 'deactive'`);

    console.log('Migration completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
