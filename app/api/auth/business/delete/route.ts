import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import Stripe from 'stripe'

const prisma = new PrismaClient()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16',
})

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // 1. Find Business
    const business = await prisma.business.findUnique({
      where: { email },
      include: { deals: true, locations: true } // Check relations if needed
    })

    if (!business) return NextResponse.json({ error: "Business not found" }, { status: 404 })

    // 2. Cancel Stripe Subscription (Real)
    if (business.stripeSubscriptionId) {
      try {
        await stripe.subscriptions.cancel(business.stripeSubscriptionId)
        console.log("Stripe subscription cancelled for", email)
      } catch (stripeError) {
        console.error("Stripe Cancel Error (Non-fatal):", stripeError)
        // We continue deleting the account even if Stripe fails (e.g. already cancelled)
      }
    }

    // 3. Delete from Database (Real)
    // We use a transaction to ensure related data is handled if not set to Cascade in DB
    await prisma.$transaction([
      // Delete active deals first to prevent foreign key errors
      prisma.deal.deleteMany({ where: { businessId: business.id } }),
      prisma.pushRequest.deleteMany({ where: { businessId: business.id } }),
      prisma.location.deleteMany({ where: { businessId: business.id } }),
      prisma.ticket.deleteMany({ where: { businessId: business.id } }),
      // Finally, delete the business
      prisma.business.delete({ where: { email } })
    ])

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error("Account Deletion Error:", error)
    return NextResponse.json({ error: "Server Error: Could not delete account." }, { status: 500 })
  }
}