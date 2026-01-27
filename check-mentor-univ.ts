import 'dotenv/config';
import { prisma } from './src/lib/prisma';

async function main() {
    try {
        console.log('--- Mentor & University Linkage Check ---');

        // 1. Get roles
        const allRoles = await prisma.roles.findMany();
        console.log('Available Roles:', allRoles.map(r => r.name).join(', '));

        const userRole = allRoles.find(r => r.name === 'user');
        const mentorRole = allRoles.find(r => r.name === 'mentor');

        if (!userRole) {
            console.log('Role "user" not found.');
        } else {
            const usersWithUserRoleCount = await prisma.users.count({
                where: { role_id: userRole.id }
            });
            console.log(`\nTotal Users with Role "user": ${usersWithUserRoleCount}`);

            const usersWithUserRoleAndUniv = await prisma.users.count({
                where: {
                    role_id: userRole.id,
                    profiles: {
                        university_id: { not: null }
                    }
                }
            });
            console.log(`Users with Role "user" AND University link: ${usersWithUserRoleAndUniv}`);
            
            if (usersWithUserRoleAndUniv > 0) {
                const sample = await prisma.users.findFirst({
                    where: {
                        role_id: userRole.id,
                        profiles: {
                            university_id: { not: null }
                        }
                    },
                    include: {
                        profiles: {
                            include: {
                                universities: true
                            }
                        }
                    }
                });
                console.log(`Sample: User ${sample?.username} is linked to Univ: ${sample?.profiles?.universities?.name}`);
            }
        }

        if (mentorRole) {
            const usersWithMentorRoleCount = await prisma.users.count({
                where: { role_id: mentorRole.id }
            });
            console.log(`\nTotal Users with Role "mentor": ${usersWithMentorRoleCount}`);

            const usersWithMentorRoleAndUniv = await prisma.users.count({
                where: {
                    role_id: mentorRole.id,
                    profiles: {
                        university_id: { not: null }
                    }
                }
            });
            console.log(`Users with Role "mentor" AND University link: ${usersWithMentorRoleAndUniv}`);
        }

    } catch (err) {
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}

main();
