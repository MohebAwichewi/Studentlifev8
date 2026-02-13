const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const businesses = await prisma.business.findMany({
        include: {
            deals: {
                select: { status: true }
            }
        }
    });

    console.log(`\n--- Diagnostic Report (${businesses.length} total businesses) ---`);

    businesses.forEach(b => {
        const activeDeals = b.deals.filter(d => ['APPROVED', 'ACTIVE'].includes(d.status)).length;
        const hasCoords = b.latitude !== 0 && b.longitude !== 0;
        const isApproved = b.status === 'APPROVED';

        console.log(`[${b.businessName}]`);
        console.log(`  - Status: ${b.status} (${isApproved ? 'OK' : 'FAIL'})`);
        console.log(`  - Coords: [${b.latitude}, ${b.longitude}] (${hasCoords ? 'OK' : 'FAIL'})`);
        console.log(`  - Active Deals: ${activeDeals} (${activeDeals > 0 ? 'OK' : 'FAIL'})`);

        if (isApproved && hasCoords && activeDeals > 0) {
            console.log(`  => RESULT: SHOULD APPEAR ON MAP ✅`);
        } else {
            console.log(`  => RESULT: HIDDEN ❌`);
        }
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
