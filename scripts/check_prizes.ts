
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Checking Spin Prizes...");
    const prizes = await prisma.spinPrize.findMany({
        orderBy: { weight: 'desc' }
    });

    if (prizes.length === 0) {
        console.log("No prizes found.");
    } else {
        console.table(prizes.map(p => ({
            name: p.name,
            type: p.type,
            weight: p.weight,
            quantity: p.quantity,
            dealId: p.dealId,
            businessId: p.businessId
        })));
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
