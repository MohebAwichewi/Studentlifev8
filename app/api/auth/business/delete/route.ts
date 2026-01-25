import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import Stripe from 'stripe'

const prisma = new PrismaClient()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  // ✅ FIX: Update version to match installed library
  apiVersion: '2025-12-15.clover' as any,
})

export async function POST(req: Request) {
  try {
    const { businessId } = await req.json()

    if (!businessId) {
      return NextResponse.json({ error: "Missing Business ID" }, { status: 400 })
    }

    // 1. Find the business to get Stripe info
    const business = await prisma.business.findUnique({
      where: { id: businessId }
    })

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 })
    }

    // 2. Cancel Stripe Subscription (if exists)
    if (business.stripeSubscriptionId) {
      try {
        await stripe.subscriptions.cancel(business.stripeSubscriptionId)
      } catch (e) {
        console.error("Stripe Cancel Error (Non-fatal):", e)
      }
    }

    // 3. Delete Business from Database
    // Note: Due to foreign key constraints (Deals, Locations, etc.), 
    // you might want to use a transaction or cascade delete in schema.
    // For now, we'll try a direct delete.
    
    // First delete related records manually if Cascade isn't set up:
    await prisma.deal.deleteMany({ where: { businessId } })
    await prisma.location.deleteMany({ where: { businessId } })
    await prisma.pushRequest.deleteMany({ where: { businessId } })
    await prisma.ticket.deleteMany({ where: { businessId } })

    // Finally delete the business
    await prisma.business.delete({
      where: { id: businessId }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error("Delete Account Error:", error)
    return NextResponse.json({ error: "Server Error" }, { status: 500 })
  }
}