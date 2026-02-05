
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const statuses = await prisma.participants.groupBy({
        by: ['status'],
        _count: { _all: true }
    });
    console.log('Participant Statuses:', JSON.stringify(statuses, null, 2));

    const verificationStatuses = await prisma.monthly_reports.groupBy({
        by: ['is_verified'],
        _count: { _all: true }
    });
    console.log('Monthly Report Verification Statuses:', JSON.stringify(verificationStatuses, null, 2));

    const logbookVerification = await prisma.logbooks.groupBy({
        by: ['is_verified'],
        _count: { _all: true }
    });
    console.log('Logbook Verification Statuses:', JSON.stringify(logbookVerification, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
