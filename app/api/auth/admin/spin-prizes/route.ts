
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: List all prizes
export async function GET() {
    try {
        const prizes = await prisma.spinPrize.findMany({
            orderBy: { weight: 'desc' },
            include: {
                deal: { select: { title: true, business: { select: { businessName: true } } } },
                business: { select: { id: true, businessName: true, logo: true, city: true } }
            }
        });
        return NextResponse.json(prizes);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch prizes' }, { status: 500 });
    }
}

// POST: Create a new prize
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, type, weight, quantity, dealId, businessId } = body;

        // If businessId is provided but NO dealId, auto-create a hidden "System Deal" for this prize
        let finalDealId = dealId ? parseInt(dealId) : null;

        if (!finalDealId && businessId) {
            console.log("Creating Auto-Deal for Prize:", name);
            const business = await prisma.business.findUnique({
                where: { id: businessId },
                select: { category: true }
            });

            if (business) {
                const newDeal = await prisma.deal.create({
                    data: {
                        title: name,
                        description: `Congratulations! You won a ${name} from Spin & Win.`,
                        category: business.category || 'Prizes',
                        discountValue: '100% OFF',
                        status: 'SPIN_PRIZE', // Hidden status
                        redemptionType: 'SWIPE',
                        businessId: businessId,
                        stock: -1, // Unlimited (managed by Prize quantity)
                        isMultiUse: false,
                        isUrgent: false
                    }
                });
                finalDealId = newDeal.id;
            }
        }

        const prize = await prisma.spinPrize.create({
            data: {
                name,
                type,
                weight: parseInt(weight),
                quantity: parseInt(quantity),
                dealId: finalDealId,
                businessId: businessId || null
            }
        });

        return NextResponse.json(prize);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to create prize' }, { status: 500 });
    }
}
