
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        // Simple protection (should be admin guarded in real prod)
        const body = await req.json();
        if (body.secret !== "admin_seed_123") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Clear existing to avoid dupes during dev
        await prisma.spinPrize.deleteMany();

        // Seed Prizes
        await prisma.spinPrize.createMany({
            data: [
                { name: "Free Burger", type: "WIN", weight: 10, quantity: 5, dealId: body.burgerDealId },
                { name: "50% Off Gym", type: "WIN", weight: 20, quantity: 10, dealId: body.gymDealId },
                { name: "Better Luck Next Time", type: "LOSE", weight: 70, quantity: -1 }, // Infinite
            ]
        });

        return NextResponse.json({ success: true, message: "Prizes seeded" });

    } catch (error) {
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}
