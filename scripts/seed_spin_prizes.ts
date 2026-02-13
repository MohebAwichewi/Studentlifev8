
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Seeding Spin Prizes...");

    const prizes = await prisma.spinPrize.findMany();
    if (prizes.length > 0) {
        console.log("Prizes already exist. Skipping seed.");
        return;
    }

    // Create "Better Luck Next Time" (LOSE) - Weight 80
    await prisma.spinPrize.create({
        data: {
            name: "Better Luck Next Time",
            type: "LOSE",
            weight: 80,
            quantity: -1 // Unlimited
        }
    });
    console.log("✅ Created 'Better Luck Next Time' (Weight 80)");

    // Create "Try Again" (TRY_AGAIN) - Weight 15
    await prisma.spinPrize.create({
        data: {
            name: "So Close! Try Again",
            type: "TRY_AGAIN",
            weight: 15,
            quantity: -1
        }
    });
    console.log("✅ Created 'So Close! Try Again' (Weight 15)");

    // Create "Jackpot" (WIN) - Weight 1 (Placeholder for manual update)
    // We won't link a deal yet, leaving it as a placeholder.
    await prisma.spinPrize.create({
        data: {
            name: "Mystery Prize",
            type: "WIN",
            weight: 1,
            quantity: 5 // Limited Stock
        }
    });
    console.log("✅ Created 'Mystery Prize' (Weight 1)");

    console.log("Seed Complete.");
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
