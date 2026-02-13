
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper to select weighted random item (Same as API)
function weightedRandom(items: any[]) {
    let totalWeight = 0;
    const availableItems = items.filter(i => i.quantity === -1 || i.quantity > 0);
    if (availableItems.length === 0) return null;
    availableItems.forEach(item => totalWeight += item.weight);
    let random = Math.random() * totalWeight;
    for (const item of availableItems) {
        if (random < item.weight) return item;
        random -= item.weight;
    }
    return availableItems[0];
}

async function verifySpinLogic() {
    console.log("🚀 Starting Spin Wheel Verification...");

    try {
        // 1. Setup Test Data
        console.log("Step 1: Creating Test User and Prize...");
        const email = `test-spinner-${Date.now()}@example.com`;
        const user = await prisma.student.create({
            data: {
                fullName: "Test Spinner",
                email: email,
                password: "hashed_password",
                dob: "2000-01-01",
                university: "Test Uni",
                hometown: "Test Town",
                hasSpunWheel: false // Ensure fresh state
            }
        });

        // Clear existing prizes to control the test
        // await prisma.spinPrize.deleteMany({ where: { name: "TEST_PRIZE_VERIFY" } });

        const prize = await prisma.spinPrize.create({
            data: {
                name: "TEST_PRIZE_VERIFY",
                type: "WIN",
                weight: 100,
                quantity: 1, // STRICT LIMIT: Only 1 available
                wins: 0
            }
        });
        console.log(`✅ User created: ${user.email}`);
        console.log(`✅ Prize created: ${prize.name} (Qty: ${prize.quantity})`);

        // 2. Execute Spin (Simulating API Logic)
        console.log("\nStep 2: Simulating Spin Transaction...");

        const result = await prisma.$transaction(async (tx) => {
            // A. Check User
            const student = await tx.student.findUnique({
                where: { id: user.id },
                select: { hasSpunWheel: true }
            });
            if (student?.hasSpunWheel) throw new Error("Already spun");

            // B. Get Prizes
            const prizes = await tx.spinPrize.findMany({ where: { id: prize.id } }); // Only fetch our test prize

            // C. Select Winner
            const selected = weightedRandom(prizes);
            if (!selected) throw new Error("No prizes");

            // D. Update Stock
            await tx.spinPrize.update({
                where: { id: selected.id },
                data: { quantity: { decrement: 1 }, wins: { increment: 1 } }
            });

            // E. Mark User
            await tx.student.update({
                where: { id: user.id },
                data: { hasSpunWheel: true }
            });

            // F. Create Notification
            await tx.notification.create({
                data: {
                    studentId: user.id,
                    title: 'Congratulations!',
                    message: `You won a ${selected.name}!`,
                    type: 'WIN'
                }
            });

            return selected;
        });

        console.log("✅ Spin Successful! User won:", result.name);

        // 3. Verify Persistence
        console.log("\nStep 3: Verifying Database State...");

        const updatedUser = await prisma.student.findUnique({ where: { id: user.id }, include: { notifications: true } });
        const updatedPrize = await prisma.spinPrize.findUnique({ where: { id: prize.id } });

        if (updatedUser?.hasSpunWheel) {
            console.log("✅ PASS: User 'hasSpunWheel' is TRUE.");
        } else {
            console.error("❌ FAIL: User was not marked as having spun.");
        }

        if (updatedUser?.notifications.some(n => n.type === 'WIN' && n.message.includes(prize.name))) {
            console.log("✅ PASS: Winning notification FOUND.");
        } else {
            console.error("❌ FAIL: Notification not found.");
        }

        if (updatedPrize?.quantity === 0) {
            console.log("✅ PASS: Prize quantity reduced to 0.");
        } else {
            console.error("❌ FAIL: Prize quantity not updated. Current:", updatedPrize?.quantity);
        }

        // 4. Verify Double Spin Prevention
        console.log("\nStep 4: Attempting Second Spin (Should Fail)...");
        try {
            await prisma.$transaction(async (tx) => {
                const student = await tx.student.findUnique({ where: { id: user.id } });
                if (student?.hasSpunWheel) throw new Error("Already spun");
            });
        } catch (e: any) {
            if (e.message === "Already spun") {
                console.log("✅ PASS: Second spin blocked correctly.");
            } else {
                console.error("❌ FAIL: Unexpected error:", e.message);
            }
        }

        // Cleanup
        console.log("\n🧹 Cleaning up test data...");
        await prisma.student.delete({ where: { id: user.id } });
        await prisma.spinPrize.delete({ where: { id: prize.id } });
        console.log("Done.");

    } catch (e) {
        console.error("🚨 Verification Failed:", e);
    } finally {
        await prisma.$disconnect();
    }
}

verifySpinLogic();
