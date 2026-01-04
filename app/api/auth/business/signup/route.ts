import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import Stripe from 'stripe'

const prisma = new PrismaClient()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16', // Use latest API version
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { 
      businessName, address, category, contactName, phone, 
      role, email, password 
    } = body

    // 1. Check if email exists
    const existing = await prisma.business.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 })
    }

    // 2. Create Stripe Customer
    const customer = await stripe.customers.create({
      email,
      name: businessName,
      metadata: { contactName, role }
    })

    // 3. Create Subscription with 3-Month Trial (90 Days)
    // We use 'payment_behavior: default_incomplete' to get a client_secret 
    // for the frontend to collect card details.
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{
        price_data: {
          currency: 'gbp',
          product_data: { name: 'Pro Plan (3 Month Trial)' },
          unit_amount: 2900, // £29.00/mo after trial (example)
          recurring: { interval: 'month' },
        },
      }],
      trial_period_days: 90,
      payment_settings: { save_default_payment_method: 'on_subscription' },
      payment_behavior: 'default_incomplete', 
    })

    // 4. Save Business to DB
    const newBusiness = await prisma.business.create({
      data: {
        email,
        password, // In prod, hash this!
        businessName,
        category,
        stripeCustomerId: customer.id,
        stripeSubscriptionId: subscription.id,
        isTrialActive: true,
        trialEnds: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
        locations: {
            create: {
                name: "Main Branch",
                address: address,
                lat: 0, lng: 0 // In real app, geocode this
            }
        }
      }
    })

    // 5. Return Client Secret for Frontend Payment Element
    // For trials, we usually use the pending_setup_intent to verify the card
    const clientSecret = subscription.pending_setup_intent 
      ? (subscription.pending_setup_intent as any).client_secret
      : (subscription.latest_invoice as any).payment_intent?.client_secret;

    return NextResponse.json({ 
      success: true, 
      businessId: newBusiness.id,
      clientSecret 
    })

  } catch (error: any) {
    console.error("Signup Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}