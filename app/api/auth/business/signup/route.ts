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
    const { businessName, email, password, address, phone, category } = body

    // 1. Check if user exists in DB
    const existing = await prisma.business.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 })
    }

    // 2. Create Stripe Customer
    const customer = await stripe.customers.create({
      email,
      name: businessName,
      phone,
      metadata: {
        s7_platform: 'true'
      }
    })

    // 3. Create Stripe Subscription (Trial)
    // NOTE: You must create a Price in Stripe Dashboard (e.g. £29/mo) and paste ID below
    const STRIPE_PRICE_ID = process.env.STRIPE_MONTHLY_PRICE_ID || 'price_12345...' 

    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: STRIPE_PRICE_ID }],
      trial_period_days: 90, // 3 Months Free
      payment_behavior: 'default_incomplete', // Important for SetupIntent/PaymentElement
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'], // Gets us the client secret
    })

    // 4. Save Business to Database
    const business = await prisma.business.create({
      data: {
        businessName,
        email,
        password, // In real app, hash this!
        address,
        phone,
        category,
        stripeCustomerId: customer.id,
        stripeSubscriptionId: subscription.id,
        isTrialActive: true,
        trialEnds: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
        plan: 'MONTHLY',
        status: 'PENDING' // Waits for admin approval
      }
    })

    // 5. Return Client Secret for Frontend Payment Element
    // This allows the frontend to show Apple Pay / Google Pay / Card fields securely
    const invoice = subscription.latest_invoice as Stripe.Invoice
    const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent

    return NextResponse.json({ 
      success: true, 
      clientSecret: paymentIntent?.client_secret,
      businessId: business.id
    })

  } catch (error: any) {
    console.error("Signup Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}