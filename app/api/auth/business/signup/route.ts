import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import Stripe from 'stripe'
import bcrypt from 'bcryptjs' 

const prisma = new PrismaClient()
// Initialize Stripe - Ensure your API key is in .env
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-12-18.acacia' as any, 
  typescript: true,
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    // Destructure all possible fields to prevent "undefined" errors
    const { businessName, email, password, address, phone, category, city } = body

    if (!email || !password || !businessName) {
        return NextResponse.json({ error: "Missing required fields." }, { status: 400 })
    }

    // 1. Check if user already exists
    const existing = await prisma.business.findUnique({ 
        where: { email: email } 
    })
    
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 })
    }

    // 2. Hash Password
    const hashedPassword = await bcrypt.hash(password, 10)

    // 3. Create Stripe Customer
    const customer = await stripe.customers.create({
      email,
      name: businessName,
      phone: phone || undefined,
      metadata: { s7_platform: 'true' }
    })

    // 4. Create Stripe Subscription (Trial)
    // Use a fallback dummy ID if env is missing to prevent crash during dev
    const STRIPE_PRICE_ID = process.env.STRIPE_MONTHLY_PRICE_ID

    let subscriptionId = null;
    if (STRIPE_PRICE_ID) {
        try {
            const subscription = await stripe.subscriptions.create({
                customer: customer.id,
                items: [{ price: STRIPE_PRICE_ID }],
                trial_period_days: 90,
                payment_behavior: 'default_incomplete',
                payment_settings: { save_default_payment_method: 'on_subscription' },
                expand: ['latest_invoice.payment_intent'], 
            })
            subscriptionId = subscription.id;
        } catch (e) {
            console.warn("Stripe Sub creation failed (Price ID might be wrong), continuing signup...", e)
        }
    }

    // 5. Save to Database
    const business = await prisma.business.create({
      data: {
        businessName,
        email,
        password: hashedPassword,
        address: address || "Tunis",
        phone: phone || "",
        city: city || "Tunis",
        category: category || "General",
        stripeCustomerId: customer.id,
        stripeSubscriptionId: subscriptionId,
        isTrialActive: true,
        // ✅ CRITICAL: Ensure this matches your Prisma Schema exactly
        trialEndsAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), 
        plan: 'MONTHLY',
        isSubscribed: false,
      }
    })

    return NextResponse.json({ 
      success: true, 
      businessId: business.id,
      businessName: business.businessName,
      email: business.email
    })

  } catch (error: any) {
    console.error("Signup Critical Error:", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}