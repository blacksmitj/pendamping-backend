
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const labels = await prisma.documents.findMany({
        select: { label: true, entity_type: true },
        distinct: ['label']
    })
    console.log(JSON.stringify(labels, null, 2))
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
