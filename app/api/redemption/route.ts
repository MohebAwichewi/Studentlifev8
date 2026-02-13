import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const { studentId, dealId } = await req.json();

        if (!studentId || !dealId) {
            return NextResponse.json({ error: "Missing studentId or dealId" }, { status: 400 });
        }

        const dealIdInt = parseInt(dealId);

        // 1. Fetch Deal to check Type (Single vs Multi)
        const deal = await prisma.deal.findUnique({
            where: { id: dealIdInt },
            select: { id: true, isMultiUse: true, title: true }
        });

        if (!deal) {
            return NextResponse.json({ error: "Deal not found" }, { status: 404 });
        }

        // 2. Check Previous Redemptions
        const lastRedemption = await prisma.redemption.findFirst({
            where: {
                studentId: studentId,
                dealId: dealIdInt
            },
            orderBy: { createdAt: 'desc' }
        });

        // 3. Apply Logic based on Deal Type
        if (lastRedemption) {
            if (!deal.isMultiUse) {
                // Single Use: BLOCK if already redeemed
                return NextResponse.json({
                    error: "This deal is single-use and has already been redeemed."
                }, { status: 400 });
            } else {
                // Multi Use: CHECK COOLDOWN (e.g. 12 Hours)
                // For testing purposes, we might want a shorter cooldown, but spec says 12h
                // Using 1 hour for now to be safe, or 12h as requested? Spec: "Available again in 12 hours"
                const cooldownHours = 12;
                const cooldownMs = cooldownHours * 60 * 60 * 1000;
                const timeSinceLast = new Date().getTime() - new Date(lastRedemption.createdAt).getTime();

                if (timeSinceLast < cooldownMs) {
                    const hoursLeft = Math.ceil((cooldownMs - timeSinceLast) / (1000 * 60 * 60));
                    return NextResponse.json({
                        error: `Cooldown active. Available again in ${hoursLeft} hours.`
                    }, { status: 400 });
                }
            }
        }

        // 4. Transaction: Create Redemption Record & Update Deal Count
        const result = await prisma.$transaction([
            prisma.redemption.create({
                data: {
                    studentId: studentId,
                    dealId: dealIdInt,
                }
            }),
            prisma.deal.update({
                where: { id: dealIdInt },
                data: {
                    claimed: { increment: 1 }
                }
            })
        ]);

        return NextResponse.json({ success: true, redemptionId: result[0].id });

    } catch (error) {
        console.error("Redemption Error:", error);
        return NextResponse.json({ error: "Redemption failed" }, { status: 500 });
    }
}
