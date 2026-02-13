const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const businesses = await prisma.business.findMany({
        select: {
            businessName: true,
            latitude: true,
            longitude: true,
            city: true
        }
    });

    console.log("--- Business Coordinates ---");
    businesses.forEach(b => {
        console.log(`${b.businessName}: Lat=${b.latitude}, Lng=${b.longitude} (${b.city})`);
        if (!b.latitude || !b.longitude) {
            console.log(`WARNING: ${b.businessName} has missing coordinates!`);
        }
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
