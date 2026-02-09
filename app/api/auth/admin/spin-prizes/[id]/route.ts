
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT: Update a prize
export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
        const id = params.id;
        const body = await req.json();
        const { name, type, weight, quantity, dealId } = body;

        const prize = await prisma.spinPrize.update({
            where: { id },
            data: {
                name,
                type,
                weight: parseInt(weight),
                quantity: parseInt(quantity),
                dealId: dealId ? parseInt(dealId) : null
            }
        });

        return NextResponse.json(prize);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update prize' }, { status: 500 });
    }
}

// DELETE: Remove a prize
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
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
