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

        // 2. Fetch User Status for Cooldown
        const decoded: any = jwt.verify(token, JWT_SECRET);
        const student = await prisma.student.findUnique({
            where: { id: decoded.id },
            select: { lastSpinAt: true }
        });

        let nextSpinTime = null;
        if (student?.lastSpinAt) {
            nextSpinTime = new Date(new Date(student.lastSpinAt).getTime() + (12 * 60 * 60 * 1000));
        }

        // 3. Fetch Prizes
        // We only return ACTIVE prizes (active = stock > 0, or -1 for infinite).
        const prizes = await prisma.spinPrize.findMany({
            where: {
                quantity: { not: 0 }
            },
            orderBy: { weight: 'desc' },
            include: {
                business: {
                    select: {
                        businessName: true,
                        logo: true,
                        city: true
                    }
                }
            }
        });

        return NextResponse.json({ success: true, prizes, nextSpinTime });

    } catch (error) {
        console.error("Get Prizes Error:", error);
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}
