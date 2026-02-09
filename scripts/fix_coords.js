const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const cityCoords = {
    "Tunis": { lat: 36.8065, lng: 10.1815 },
    "Bath": { lat: 51.3758, lng: -2.3599 },
    "Geneva": { lat: 46.2044, lng: 6.1432 },
    "London": { lat: 51.5074, lng: -0.1278 },
    "Liverpool": { lat: 53.4084, lng: -2.9916 },
    "Manchester": { lat: 53.4808, lng: -2.2426 }
};
const defaultCity = { lat: 46.2044, lng: 6.1432 }; // Geneva fallback

async function main() {
    // Find businesses with 0 lat or lng
    const businesses = await prisma.business.findMany({
        where: {
            OR: [
                { latitude: 0 },
                { longitude: 0 }
            ]
        }
    });

    console.log(`Found ${businesses.length} businesses with missing coordinates.`);

    for (const b of businesses) {
        let coords = cityCoords[b.city] || defaultCity;
        // Add random jitter
        const lat = coords.lat + (Math.random() * 0.01 - 0.005);
        const lng = coords.lng + (Math.random() * 0.01 - 0.005);

        console.log(`Updating ${b.businessName} (${b.city}) to [${lat}, ${lng}]`);

        await prisma.business.update({
            where: { id: b.id },
            data: { latitude: lat, longitude: lng }
        });
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
