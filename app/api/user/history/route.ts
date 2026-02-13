import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) return NextResponse.json({ error: "User ID required" }, { status: 400 });

    try {
        // Fetch Tickets (Redeemed Deals)
        const tickets = await prisma.ticket.findMany({
            where: { userId },
            include: {
                deal: {
                    select: {
                        id: true,
                        title: true,
                        image: true,
                        discount: true,
                        business: {
                            select: { businessName: true, logo: true }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ success: true, history: tickets });
    } catch (error) {
        console.error("History API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
