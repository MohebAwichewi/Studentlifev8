import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import Stripe from 'stripe'

// Initialize Stripe with Secret Key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-12-18.acacia' as any, // TypeScript might complain about newer versions
})

const prisma = new PrismaClient()

// HELPER: Ensure Price Exists
async function getOrCreatePrice(interval: 'month' | 'year') {
    const amount = interval === 'month' ? 1000 : 10000 // £10.00 or £100.00 (in pence)
    const productName = `Student.LIFE (${interval === 'month' ? 'Monthly' : 'Yearly'})`

    // 1. Search for existing product/price in Stripe
    const search = await stripe.prices.search({
        query: `active:'true' AND metadata['app']:'student_life' AND metadata['interval']:'${interval}'`,
        limit: 1
    })

    if (search.data.length > 0) {
        return search.data[0].id
    }

    // 2. Create if not found
    const product = await stripe.products.create({
        name: productName,
        metadata: { app: 'student_life', interval }
    })

    const price = await stripe.prices.create({
        unit_amount: amount,
        currency: 'gbp',
        recurring: { interval },
        product: product.id,
        metadata: { app: 'student_life', interval }
    })

    return price.id
}

export async function POST(req: Request) {
    try {
        const { email, businessName, businessId, billingInterval } = await req.json()

        if (!email || !businessId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        // Default interval if not specified
        const currentInterval = billingInterval === 'year' ? 'year' : 'month'

        // 1. Get or Create Price ID
        const priceId = await getOrCreatePrice(currentInterval)

        // 2. Create Customer
        const customer = await stripe.customers.create({
            email,
            name: businessName,
            metadata: { businessId }
        })

        // 3. Create Subscription (With 90 Day Trial)
        const subscription = await stripe.subscriptions.create({
            customer: customer.id,
            items: [{ price: priceId }],
            trial_period_days: 90,
            payment_behavior: 'default_incomplete', // Don't fail if payment not present yet
            payment_settings: { save_default_payment_method: 'on_subscription' },
            expand: ['latest_invoice.payment_intent']
        })

        // 4. Update Database
        await prisma.business.update({
            where: { id: businessId },
            data: {
                stripeCustomerId: customer.id,
                stripeSubscriptionId: subscription.id,
                subscriptionStatus: 'TRIALING'
            }
        })

        // 5. Return Client Secret for Frontend Payment Element
        const invoice = subscription.latest_invoice as Stripe.Invoice
        const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent

        return NextResponse.json({
            clientSecret: paymentIntent.client_secret,
            subscriptionId: subscription.id
        })

    } catch (error: any) {
        console.error("Stripe Error:", error)
        return NextResponse.json({ error: error.message || "Failed to create subscription" }, { status: 500 })
    }
}
