import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import Stripe from 'stripe'

const prisma = new PrismaClient()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-12-18.acacia' as any,
  typescript: true,
})

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

    // Check Real Stripe Sub
    if (business.stripeSubscriptionId) {
      try {
        const sub = await stripe.subscriptions.retrieve(business.stripeSubscriptionId);
        subscription.status = sub.status;
        subscription.currentPeriodEnd = new Date((sub as any).current_period_end * 1000).toISOString();
        subscription.cancelAtPeriodEnd = sub.cancel_at_period_end;
      } catch (e) { console.log("Stripe check failed") }
    }
    // Check Local Trial
    else if (business.trialEndsAt && new Date(business.trialEndsAt) > new Date()) {
      subscription.status = 'trialing';
      subscription.currentPeriodEnd = business.trialEndsAt.toISOString();
    }

    return NextResponse.json({ success: true, subscription })

  } catch (e) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 })
  }
}