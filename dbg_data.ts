
import { prisma } from "./src/lib/prisma";

async function main() {
    console.log("--- Participant Statuses ---");
    const statuses = await prisma.participants.groupBy({
        by: ['status'],
        _count: { _all: true }
    });
    console.log(JSON.stringify(statuses, null, 2));

    console.log("\n--- Monthly Report Verification ---");
    const verificationStatuses = await prisma.monthly_reports.groupBy({
        by: ['is_verified'],
        _count: { _all: true }
    });
    console.log(JSON.stringify(verificationStatuses, null, 2));

    console.log("\n--- Logbook Verification ---");
    const logbookVerification = await prisma.logbooks.groupBy({
        by: ['is_verified'],
        _count: { _all: true }
    });
    console.log(JSON.stringify(logbookVerification, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
