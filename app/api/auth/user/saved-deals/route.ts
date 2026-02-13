import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        const savedDeals = await prisma.savedDeal.findMany({
            where: {
                userId: userId
            },
            include: {
                deal: {
                    include: {
                        business: {
                            select: {
                                businessName: true,
                                logo: true,
                                latitude: true,
                                longitude: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                savedAt: 'desc'
            }
        });

        // Flatten structure for frontend
        const formattedDeals = savedDeals.map((sd: any) => ({
            ...sd.deal,
            savedAt: sd.savedAt
        }));

        return NextResponse.json({ success: true, deals: formattedDeals });
    } catch (error) {
        console.error('Fetch Saved Deals error:', error);
        return NextResponse.json({ error: 'Failed to fetch saved deals' }, { status: 500 });
    }
}
