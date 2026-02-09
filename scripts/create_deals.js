const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const businesses = await prisma.business.findMany({
        where: { status: 'APPROVED' },
        include: { deals: true }
    });

    for (const b of businesses) {
        if (b.deals.length === 0) {
            console.log(`Creating deal for ${b.businessName}...`);
            await prisma.deal.create({
                data: {
                    title: 'Welcome Offer',
                    description: 'Get 20% off your first visit!',
                    discountValue: '20%',
                    category: b.category || 'Food',
                    businessId: b.id,
                    status: 'ACTIVE',
                    expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
                }
            });
        }
    }

    console.log("Done checking deals.");
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
