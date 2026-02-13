import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Toggle Follow
export async function POST(req: Request) {
    try {
        const { userId, businessId } = await req.json();

        if (!userId || !businessId) {
            return NextResponse.json({ error: "Missing userId or businessId" }, { status: 400 });
        }

        const existingFollow = await prisma.follow.findUnique({
            where: {
                userId_businessId: {
                    userId,
                    businessId
                }
            }
        });

        if (existingFollow) {
            // Unfollow
            await prisma.follow.delete({
                where: {
                    userId_businessId: {
                        userId,
                        businessId
                    }
                }
            });
            return NextResponse.json({ success: true, isFollowing: false });
        } else {
            // Follow
            await prisma.follow.create({
                data: {
                    userId,
                    businessId
                }
            });
            return NextResponse.json({ success: true, isFollowing: true });
        }

    } catch (error) {
        console.error("Follow API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// Get User Follows (Optional GET)
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) return NextResponse.json({ error: "User ID required" }, { status: 400 });

    try {
        const follows = await prisma.follow.findMany({
            where: { userId },
            include: {
                business: {
                    select: {
                        id: true,
                        businessName: true,
                        logo: true,
                        city: true
                    }
                }
            }
        });
        return NextResponse.json({ success: true, follows });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
