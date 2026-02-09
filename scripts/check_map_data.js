const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const businesses = await prisma.business.findMany({
        where: {
            status: 'APPROVED',
            latitude: { not: 0 },
            longitude: { not: 0 },
            deals: {
                some: {
                    status: { in: ['APPROVED', 'ACTIVE'] }
                }
            }
        },
        select: {
            businessName: true,
            logo: true,
            latitude: true,
            longitude: true
        }
    });

    console.log(`Found ${businesses.length} active businesses for map.`);
    businesses.forEach(b => {
        console.log(`- ${b.businessName}: Logo=${b.logo ? 'YES' : 'NO'}, Coords=[${b.latitude}, ${b.longitude}]`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
