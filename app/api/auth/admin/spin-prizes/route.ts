
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: List all prizes
export async function GET() {
    try {
        const prizes = await prisma.spinPrize.findMany({
            orderBy: { weight: 'desc' },
            include: { deal: { select: { title: true, business: { select: { businessName: true } } } } }
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
        const { name, type, weight, quantity, dealId } = body;

        const prize = await prisma.spinPrize.create({
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
        console.error(error);
        return NextResponse.json({ error: 'Failed to create prize' }, { status: 500 });
    }
}
