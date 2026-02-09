import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Using shared client

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const studentId = searchParams.get('studentId');

        if (!studentId) {
            return NextResponse.json({ error: "Missing studentId" }, { status: 400 });
        }

        // Fetch redemptions for this student
        // Include deal details to show in History tab
        const redemptions = await prisma.redemption.findMany({
            where: {
                studentId: studentId
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
                        discountValue: true,
                        isMultiUse: true,
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
            redemptions
        });

    } catch (error) {
        console.error("Redemption History Error:", error);
        return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
    }
}
