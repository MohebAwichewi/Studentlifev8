import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const { businessId } = await req.json()
    if (!businessId) return NextResponse.json({ error: "No ID" }, { status: 400 })

    const business = await prisma.business.findUnique({ where: { id: businessId } })
    if (!business) return NextResponse.json({ error: "Not found" }, { status: 404 })

    let subscription = {
      isSubscribed: business.isSubscribed,
      plan: business.plan || 'Free',
      status: 'inactive',
      currentPeriodEnd: null as string | null,
      cancelAtPeriodEnd: false
    }

    // Check Local Trial (Stripe removed)
    if (business.trialEndsAt && new Date(business.trialEndsAt) > new Date()) {
      subscription.status = 'trialing';
      subscription.currentPeriodEnd = business.trialEndsAt.toISOString();
    }

    return NextResponse.json({ success: true, subscription })

  } catch (e) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 })
  }
}