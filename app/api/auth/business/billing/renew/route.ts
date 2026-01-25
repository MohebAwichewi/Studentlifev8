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

    const business = await prisma.business.findUnique({
      where: { id: businessId }
    })

    if (!business) return NextResponse.json({ error: "Business not found" }, { status: 404 })

    // Scenario A: Renew Stripe Subscription (Resume)
    if (business.stripeSubscriptionId) {
        // This tells Stripe: "Don't cancel at the end of the month anymore."
        const updatedSub = await stripe.subscriptions.update(business.stripeSubscriptionId, {
            cancel_at_period_end: false
        });
        
        return NextResponse.json({ 
            success: true, 
            message: "Subscription renewed successfully.",
            currentPeriodEnd: new Date(updatedSub.current_period_end * 1000).toISOString()
        })
    } 
    
    // Scenario B: Renew Local Trial (Reset Expiry)
    else if (business.trialEndsAt) {
        // If they cancelled a trial, we give them back 30 days or reset to original logic
        // For simplicity, we extend it by 30 days from today
        const newExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        
        await prisma.business.update({
            where: { id: businessId },
            data: { 
                trialEndsAt: newExpiry, 
                isSubscribed: true // Reactivate
            }
        })
        return NextResponse.json({ 
            success: true, 
            message: "Trial reactivated.",
            currentPeriodEnd: newExpiry.toISOString()
        })
    }

    return NextResponse.json({ error: "No plan found to renew." }, { status: 400 })

  } catch (error: any) {
    console.error("Renew Error:", error)
    return NextResponse.json({ error: error.message || "Renewal failed" }, { status: 500 })
  }
}