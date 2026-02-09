import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'student-life-secret';

export async function GET(req: Request) {
    try {
        // 1. Verify Auth (Optional: Could be public if we want to show prizes before login, but safer to protect)
        const headersList = await headers();
        const token = headersList.get('authorization')?.split(' ')[1];

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        try {
            jwt.verify(token, JWT_SECRET);
        } catch (e) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        // 2. Fetch Prizes
        // We only return ACTIVE prizes (active = stock > 0, or -1 for infinite).
        // This ensures the frontend wheel only displays items that can actually be won.
        const prizes = await prisma.spinPrize.findMany({
            where: {
                quantity: { not: 0 }
            },
            orderBy: { weight: 'desc' }
        });

        // Map to a cleaner format if needed, but raw is fine.
        return NextResponse.json({ success: true, prizes });

    } catch (error) {
        console.error("Get Prizes Error:", error);
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}
