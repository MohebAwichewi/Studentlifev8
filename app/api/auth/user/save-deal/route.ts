import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, dealId } = body;

    // Support both userId and email for flexibility
    let uid = userId;

    if (!uid && body.email) {
      const user = await prisma.user.findUnique({ where: { email: body.email } });
      if (user) uid = user.id;
    }

    if (!uid || !dealId) {
      return NextResponse.json({ error: 'User ID and Deal ID are required' }, { status: 400 });
    }

    // Check if already saved
    const existing = await prisma.savedDeal.findUnique({
      where: {
        userId_dealId: {
          userId: uid,
          dealId: parseInt(dealId)
        }
      }
    });

    if (existing) {
      // Unsave
      await prisma.savedDeal.delete({
        where: {
          userId_dealId: {
            userId: uid,
            dealId: parseInt(dealId)
          }
        }
      });
      return NextResponse.json({ success: true, saved: false });
    } else {
      // Save
      await prisma.savedDeal.create({
        data: {
          userId: uid,
          dealId: parseInt(dealId)
        }
      });
      return NextResponse.json({ success: true, saved: true });
    }

  } catch (error) {
    console.error('Save Deal error:', error);
    return NextResponse.json({ error: 'Failed to toggle save' }, { status: 500 });
  }
}
