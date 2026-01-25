import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import Stripe from 'stripe'

const prisma = new PrismaClient()

// Initialize Stripe with your Secret Key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-12-18.acacia' as any, 
  typescript: true,
})

export async function POST(req: Request) {
  try {
    const { businessId } = await req.json()

    // 1. Find the business
    const business = await prisma.business.findUnique({
      where: { id: businessId }
    })

    if (!business || !business.stripeSubscriptionId) {
        return NextResponse.json({ error: "No active subscription found to cancel." }, { status: 400 })
    }

    // 2. Tell Stripe to cancel at the end of the billing period (churn prevention)
    const updatedSub = await stripe.subscriptions.update(business.stripeSubscriptionId, {
        cancel_at_period_end: true
    });

    return NextResponse.json({ 
        success: true, 
        cancelAt: updatedSub.cancel_at,
        message: "Subscription will cancel at the end of the current period."
    })

  } catch (error: any) {
    console.error("Cancellation Error:", error)
    return NextResponse.json({ error: error.message || "Failed to cancel subscription" }, { status: 500 })
  }
}