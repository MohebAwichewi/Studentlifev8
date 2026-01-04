import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import Stripe from 'stripe'

const prisma = new PrismaClient()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16',
})

// REPLACE THIS WITH YOUR REAL STRIPE YEARLY PRICE ID
const STRIPE_YEARLY_PRICE_ID = 'price_1234567890' 

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    // 1. Find Business
    const business = await prisma.business.findUnique({
      where: { email }
    })

    if (!business || !business.stripeSubscriptionId) {
      return NextResponse.json({ error: "No active subscription found" }, { status: 400 })
    }

    // 2. Get the current subscription from Stripe
    const subscription = await stripe.subscriptions.retrieve(business.stripeSubscriptionId)
    const itemId = subscription.items.data[0].id

    // 3. Update Subscription to Yearly
    // This creates a proration (charge for difference) immediately or next cycle
    const updatedSub = await stripe.subscriptions.update(business.stripeSubscriptionId, {
      items: [{
        id: itemId,
        price: STRIPE_YEARLY_PRICE_ID, // Switch to Yearly Price
      }],
      proration_behavior: 'always_invoice', // Charge them now for the upgrade
    })

    // 4. Update Database
    await prisma.business.update({
      where: { email },
      data: { 
        plan: 'YEARLY',
        isTrialActive: false // End trial immediately if they upgrade
      }
    })

    return NextResponse.json({ success: true, plan: 'YEARLY' })

  } catch (error: any) {
    console.error("Upgrade Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}