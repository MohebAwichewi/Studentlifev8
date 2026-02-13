
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'student-life-secret';

// Helper to select weighted random item
function weightedRandom(items: any[]) {
    let totalWeight = 0;
    const availableItems = items.filter(i => i.quantity === -1 || i.quantity > 0); // -1 for infinite

    if (availableItems.length === 0) return null;

    availableItems.forEach(item => {
        totalWeight += item.weight;
    });

    let random = Math.random() * totalWeight;

    for (const item of availableItems) {
        if (random < item.weight) {
            return item;
        }
        random -= item.weight;
    }
    return availableItems[0];
}

export async function POST(req: Request) {
    console.log("🚀 [API] Spin Request Started");
    try {
        // 1. Verify Auth
        const headersList = await headers();
        const token = headersList.get('authorization')?.split(' ')[1];
        console.log("🚀 [API] Token present:", !!token);

        if (!token) {
            console.error("❌ [API] No token provided");
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        let decoded: any;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
            console.log("🚀 [API] Token decoded for User ID:", decoded.id);
        } catch (e) {
            console.error("❌ [API] Token verification failed:", e);
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const studentId = decoded.id;

        // 2. Transaction for Concurrency Logic
        console.log("🚀 [API] Starting Transaction...");
        const result = await prisma.$transaction(async (tx) => {
            // A. Check if user already spun within 12 hours
            const student = await tx.student.findUnique({
                where: { id: studentId },
                select: { lastSpinAt: true, fullName: true }
            });
            console.log("🚀 [API] Student found:", student?.fullName, "Last Spin:", student?.lastSpinAt);

            if (!student) throw new Error('Student not found');

            // Check Cooldown (12 Hours)
            if (student.lastSpinAt) {
                const now = new Date();
                const diff = now.getTime() - new Date(student.lastSpinAt).getTime();
                const cooldown = 12 * 60 * 60 * 1000; // 12 hours in ms

                if (diff < cooldown) {
                    const remainingMs = cooldown - diff;
                    throw new Error(`COOLDOWN:${remainingMs}`);
                }
            }

            // B. Get all prizes
            const prizes = await tx.spinPrize.findMany({
                include: {
                    business: {
                        select: {
                            businessName: true,
                            logo: true,
                            city: true
                        }
                    }
                }
            });
            console.log("🚀 [API] Prizes loaded:", prizes.length);

            // C. Select Winner
            const prize = weightedRandom(prizes);
            console.log("🚀 [API] Winner selected:", prize?.name);

            if (!prize) {
                throw new Error('No prizes available');
            }

            // D. Update Prize Stock
            if (prize.quantity > 0) {
                await tx.spinPrize.update({
                    where: { id: prize.id },
                    data: { quantity: { decrement: 1 }, wins: { increment: 1 } }
                });
            } else {
                await tx.spinPrize.update({
                    where: { id: prize.id },
                    data: { wins: { increment: 1 } }
                });
            }

            // E. Mark User as Spun (Update Timestamp)
            const now = new Date();
            await tx.student.update({
                where: { id: studentId },
                data: { lastSpinAt: now } // ✅ Update Timestamp
            });

            // F. Create Notification (Only if WIN)
            if (prize.type === 'WIN') {
                await tx.notification.create({
                    data: {
                        studentId: studentId,
                        title: 'Congratulations! You won!',
                        message: `You won a ${prize.name}! Tap here to claim it.`,
                        type: 'WIN',
                        dealId: prize.dealId
                    }
                });

                // G. Create Voucher for the Prize (14 Day Expiry)
                if (prize.dealId) {
                    const uniqueCode = `WIN-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substr(2, 4)}`.toUpperCase();
                    // 14 Days from now
                    const expiresAt = new Date();
                    expiresAt.setDate(expiresAt.getDate() + 14);

                    await tx.voucher.create({
                        data: {
                            code: uniqueCode,
                            studentId: studentId,
                            dealId: prize.dealId,
                            isUsed: false,
                            expiresAt: expiresAt
                        }
                    });
                }
            }

            // Return Prize + Next Spin Time
            const nextSpin = new Date(now.getTime() + (12 * 60 * 60 * 1000));
            return { ...prize, nextSpin };
        });

        console.log("🚀 [API] Transaction Success:", result);
        return NextResponse.json({ success: true, prize: result, nextSpin: result.nextSpin });

    } catch (error: any) {
        console.error("❌ [API] Spin Error:", error.message);

        if (error.message.startsWith('COOLDOWN:')) {
            const remainingMs = parseInt(error.message.split(':')[1]);
            return NextResponse.json({
                error: 'Cooldown active',
                remainingMs
            }, { status: 400 });
        }

        if (error.message === 'No prizes available') {
            return NextResponse.json({ error: 'No prizes currently available. Please try again later.' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Server Error', details: error.message }, { status: 500 });
    }
}
