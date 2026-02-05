
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const participantStatuses = await prisma.participants.findMany({
        select: { status: true },
        distinct: ['status']
    })
    const participantStates = await prisma.participants.findMany({
        select: { state: true },
        distinct: ['state']
    })
    const reportStatuses = await prisma.monthly_reports.findMany({
        select: { is_verified: true },
        distinct: ['is_verified']
    })

    console.log('--- Participant Statuses ---')
    console.log(participantStatuses.map(s => s.status))
    console.log('--- Participant States ---')
    console.log(participantStates.map(s => s.state))
    console.log('--- Report Statuses (is_verified) ---')
    console.log(reportStatuses.map(s => s.is_verified))
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
