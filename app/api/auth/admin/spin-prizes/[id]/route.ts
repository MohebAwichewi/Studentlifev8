
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT: Update a prize
export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const id = params.id;
        const body = await req.json();
        const { name, type, weight, quantity, dealId, businessId } = body;

        // Auto-Deal Logic for Updates
        let finalDealId = dealId ? parseInt(dealId) : null;

        if (!finalDealId && businessId) {
            // Check if already linked to a deal? If not, create one.
            // But wait, if we are updating, maybe we should reuse the old one? 
            // Simplification: Only create if we are switching to a business logic without a deal info.
            // Better: If user clears Deal ID but keeps Business ID, we create a new one to be safe.

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
                        status: 'SPIN_PRIZE',
                        redemptionType: 'SWIPE',
                        businessId: businessId,
                        stock: -1,
                        isMultiUse: false,
                        isUrgent: false
                    }
                });
                finalDealId = newDeal.id;
            }
        }

        const prize = await prisma.spinPrize.update({
            where: { id },
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
        return NextResponse.json({ error: 'Failed to update prize' }, { status: 500 });
    }
}

// DELETE: Remove a prize
export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const id = params.id;
        await prisma.spinPrize.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete prize' }, { status: 500 });
    }
}
