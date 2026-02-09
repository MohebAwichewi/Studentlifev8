
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
            // A. Check if user already spun
            const student = await tx.student.findUnique({
                where: { id: studentId },
                select: { hasSpunWheel: true, fullName: true }
            });
            console.log("🚀 [API] Student found:", student?.fullName, "Has Spun:", student?.hasSpunWheel);

            if (!student) throw new Error('Student not found');
            if (student.hasSpunWheel) throw new Error('Already spun');

            // B. Get all prizes
            const prizes = await tx.spinPrize.findMany();
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

            // E. Mark User as Spun
            await tx.student.update({
                where: { id: studentId },
                data: { hasSpunWheel: true }
            });

            // F. Create Notification (Only if WIN)
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
                        expiresAt: expiresAt // ✅ Save Expiry
                    }
                });
            }

            return prize;
        });

        console.log("🚀 [API] Transaction Success:", result);
        return NextResponse.json({ success: true, prize: result });

    } catch (error: any) {
        console.error("❌ [API] Spin Error:", error);
        if (error.message === 'Already spun') {
            return NextResponse.json({ error: 'You have already used your spin.' }, { status: 400 });
        }
        if (error.message === 'No prizes available') {
            return NextResponse.json({ error: 'No prizes currently available. Please try again later.' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Server Error', details: error.message }, { status: 500 });
    }
}
