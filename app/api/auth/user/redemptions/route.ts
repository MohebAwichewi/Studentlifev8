import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Using shared client

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: "Missing userId" }, { status: 400 });
        }

        // Fetch redemptions for this student
        // Include deal details to show in History tab
        const tickets = await prisma.ticket.findMany({
            where: {
                userId: userId
            },
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                deal: {
                    select: {
                        id: true,
                        title: true,
                        image: true,
                        discount: true,
                        isMultiUse: true,
                        expiry: true, // Needed for filtering
                        business: {
                            select: {
                                businessName: true,
                                logo: true
                            }
                        }
                    }
                }
            }
        });

        return NextResponse.json({
            success: true,
            redemptions: tickets
        });

    } catch (error) {
        console.error("Redemption History Error:", error);
        return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
    }
}
