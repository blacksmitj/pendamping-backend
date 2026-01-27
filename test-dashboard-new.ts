import 'dotenv/config';
import { prisma } from './src/lib/prisma';

async function main() {
    try {
        console.log('Testing GET /api/dashboard/summary logic...');
        
        // 1. Basic Counts
        console.log('Fetching participantsCount...');
        const participantsCount = await prisma.participants.count({
          where: {
            status: "active",
            universities: {
                status: "active"
            }
          },
        });
        console.log('participantsCount:', participantsCount);

        console.log('Fetching mentorsCount...');
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
        console.log('mentorsCount:', mentorsCount);

        console.log('\n--- Checking first 5 participants and their DIRECT university_id ---');
        const samples = await prisma.participants.findMany({
            take: 5,
            include: {
                universities: true
            }
        });
        samples.forEach(s => {
            console.log(`Participant ${s.id}: UnivID: ${s.university_id}, Univ Name: ${s.universities?.name}`);
        });

        console.log('Test logic successful!');
    } catch (error) {
        console.error('Test logic failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
