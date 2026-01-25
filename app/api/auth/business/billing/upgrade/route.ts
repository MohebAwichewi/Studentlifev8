import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import Stripe from 'stripe'

const prisma = new PrismaClient()

// ✅ Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-12-18.acacia' as any, 
  typescript: true,
})

export async function POST(req: Request) {
  try {
    const { businessId, planType } = await req.json()

    // 1. Validate Environment Variables
    if (!process.env.STRIPE_SECRET_KEY || !process.env.NEXT_PUBLIC_BASE_URL) {
        console.error("❌ MISSING CONFIG: Check STRIPE_SECRET_KEY and NEXT_PUBLIC_BASE_URL in .env")
        return NextResponse.json({ error: "Server Configuration Error" }, { status: 500 })
    }

    // 2. Fetch Business
    const business = await prisma.business.findUnique({
      where: { id: businessId }
    })

    if (!business) return NextResponse.json({ error: "Business not found" }, { status: 404 })

    // 3. Get/Create Stripe Customer
    let customerId = business.stripeCustomerId

    if (!customerId) {
      console.log("Creating new Stripe Customer...")
      const customer = await stripe.customers.create({
        email: business.email,
        name: business.businessName,
        metadata: {
            businessId: business.id
        }
      })
      customerId = customer.id

      await prisma.business.update({
        where: { id: business.id },
        data: { stripeCustomerId: customerId }
      })
    }

    // 4. Determine Pricing Strategy
    let lineItemPriceData: any = {};

    // ✅ STRATEGY A: Check if Admin set a Custom Price (Overrides everything)
    if (business.customPlanPrice !== null && business.customPlanPrice !== undefined) {
        
        const unitAmount = Math.round(business.customPlanPrice * 100) // Convert to pence
        const interval = planType === 'YEARLY' ? 'year' : 'month'
        
        lineItemPriceData = {
            price_data: {
                currency: 'gbp',
                product_data: {
                    name: `Special Partner Plan (£${business.customPlanPrice}/mo)`,
                    description: "Unlimited access to Student.LIFE Partner Studio (Special Rate)"
                },
                unit_amount: unitAmount,
                recurring: { interval }
            },
            quantity: 1,
        }
    } else {
        // ✅ STRATEGY B: Standard Plan (£10 / £100) using your specific Price IDs
        const monthlyPriceId = "price_1SlTiUIXjVTkZU2iiaxurHOR" // £10
        const yearlyPriceId = "price_1SlTksIXjVTkZU2iNrxevyFn"  // £100
        
        const selectedPriceId = planType === 'YEARLY' ? yearlyPriceId : monthlyPriceId

        // Safety check
        if (!selectedPriceId) {
             return NextResponse.json({ error: "Price ID not configured" }, { status: 500 })
        }

        lineItemPriceData = {
            price: selectedPriceId,
            quantity: 1,
        }
    }

    // 5. Create Checkout Session
    console.log(`Creating Session for ${planType}...`)
    
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        lineItemPriceData // ✅ Pass the dynamically determined object
      ],
      metadata: {
        businessId: business.id
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/business/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/business/dashboard?canceled=true`,
    })

    return NextResponse.json({ url: session.url })

  } catch (error: any) {
    console.error("❌ STRIPE ERROR:", error.message)
    return NextResponse.json({ error: error.message || "Checkout Failed" }, { status: 500 })
  }
}