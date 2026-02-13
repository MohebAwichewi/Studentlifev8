import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { userId, fullName, phone, city, dob, university } = body;

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        // Check if phone is already taken by another user
        if (phone) {
            const existingUser = await prisma.user.findFirst({
                where: {
                    phone,
                    NOT: {
                        id: userId
                    }
                }
            });
            if (existingUser) {
                return NextResponse.json({ error: 'Phone number already in use' }, { status: 400 });
            }
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                fullName,
                phone,
                city,
                dob,
                university,
                updatedAt: new Date(),
            },
        });

        return NextResponse.json({ success: true, user: updatedUser });
    } catch (error) {
        console.error('Update profile error:', error);
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }
}
