
// Replaced by API route strategy


async function main() {
    console.log('--- Debugging University Stats Chain ---');

    // 1. Get a university that we think has mentors
    const univ = await prisma.university.findFirst({
        where: {
            profiles: {
                some: {}
            }
        },
        include: {
            profiles: {
                take: 5,
                include: {
                    user: true
                }
            }
        }
    });

    if (!univ) {
        console.log('No university found with profiles.');
        return;
    }

    console.log(`University: ${univ.name} (ID: ${univ.id})`);

    // 2. Check Mentors for this University
    const mentorIds = univ.profiles.map(p => p.user_id);
    console.log(`Found ${mentorIds.length} potential mentors (Profile User IDs):`, mentorIds.map(id => id.toString()));

    // 3. Check UserPeserta for these Mentors
    console.log('\n--- Checking UserPeserta for these mentors ---');
    for (const mentorId of mentorIds) {
        const userPesertaCount = await prisma.userPeserta.count({
            where: {
                admin_id: mentorId
            }
        });

        const userPesertaFirst = await prisma.userPeserta.findFirst({
            where: { admin_id: mentorId }
        });

        console.log(`Mentor ID ${mentorId}: Found ${userPesertaCount} records in UserPeserta.`);
        if (userPesertaFirst) {
            console.log(`  - Sample: id_tkm=${userPesertaFirst.id_tkm}, admin_id=${userPesertaFirst.admin_id}`);
        }
    }

    // 4. Check global UserPeserta stats
    const totalUserPeserta = await prisma.userPeserta.count();
    console.log(`\nTotal records in UserPeserta: ${totalUserPeserta}`);

    // 5. Check if we have any participants linked to ANY mentor
    if (totalUserPeserta > 0) {
        const sample = await prisma.userPeserta.findFirst();
        console.log('Sample UserPeserta:', sample);
        // Check if this admin_id exists in Profiles linked to a University
        if (sample) {
            const profile = await prisma.profile.findFirst({
                where: { user_id: sample.admin_id },
                include: { university: true }
            });
            console.log(`Mentor (Admin ID ${sample.admin_id}) Profile:`, profile ? `University: ${profile.university?.name}` : 'No Profile found');
        }
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
