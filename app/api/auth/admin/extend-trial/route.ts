import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import Stripe from 'stripe'

const prisma = new PrismaClient()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16',
})

export async function POST(req: Request) {
  try {
    const { businessId, days } = await req.json()

    // 1. Get the business
    // We need the string ID now since we changed the schema to CUID
    const business = await prisma.business.findUnique({
      where: { id: businessId }
    })

    if (!business) return NextResponse.json({ error: "Business not found" }, { status: 404 })

    // 2. Calculate New Date
    // If trial is already over, start from today. If active, add to existing date.
    const currentEnd = business.trialEnds && new Date(business.trialEnds) > new Date() 
      ? new Date(business.trialEnds) 
      : new Date()
    
    const newTrialDate = new Date(currentEnd.getTime() + (days * 24 * 60 * 60 * 1000))

    // 3. Update Stripe (Critical: prevents charging)
    if (business.stripeSubscriptionId) {
      try {
        await stripe.subscriptions.update(business.stripeSubscriptionId, {
          trial_end: Math.floor(newTrialDate.getTime() / 1000), // Convert to Unix Timestamp
          proration_behavior: 'none', // Don't charge for changes
        })
      } catch (stripeError: any) {
        console.error("Stripe Update Warning:", stripeError.message)
        // We continue even if Stripe fails (e.g., if they already cancelled), 
        // but for a robust app, you might want to stop here.
        // For MVP, we proceed to update DB so access is granted.
      }
    }

    // 4. Update Database (Controls App Access)
    await prisma.business.update({
      where: { id: businessId },
      data: {
        trialEnds: newTrialDate,
        isTrialActive: true, // Re-activate if it was expired
        plan: 'MONTHLY' // Ensure they aren't stuck on FREE
      }
    })

    return NextResponse.json({ success: true, newDate: newTrialDate })

  } catch (error) {
    console.error("Extend Trial Error:", error)
    return NextResponse.json({ error: "Server Error" }, { status: 500 })
  }
}