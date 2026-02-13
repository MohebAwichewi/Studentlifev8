const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // 1. Approve all businesses with valid coordinates
    const updateBusinesses = await prisma.business.updateMany({
        where: {
            latitude: { not: 0 },
            longitude: { not: 0 },
            status: { not: 'APPROVED' }
        },
        data: {
            status: 'APPROVED'
        }
    });

    console.log(`Approved ${updateBusinesses.count} businesses.`);

    // 2. Activate all PENDING deals for APPROVED businesses
    const updateDeals = await prisma.deal.updateMany({
        where: {
            status: { not: 'ACTIVE' },
            business: {
                status: 'APPROVED'
            }
        },
        data: {
            status: 'ACTIVE'
        }
    });

    console.log(`Activated ${updateDeals.count} deals.`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
