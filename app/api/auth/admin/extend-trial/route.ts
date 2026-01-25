import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import Stripe from 'stripe'

const prisma = new PrismaClient()

// ✅ STRIPE INITIALIZED WITH YOUR KEY
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  // ✅ FIX: Add "as any" to bypass the strict version check
  apiVersion: '2024-12-18.acacia' as any,
  typescript: true,
})

export async function POST(req: Request) {
  try {
    const { businessId } = await req.json()

    // 1. Find the Business
    const business = await prisma.business.findUnique({ where: { id: businessId } })

    if (!business) return NextResponse.json({ error: "Business not found" }, { status: 404 })

    // 2. Calculate New Date (Current End + 14 Days)
    // If the trial is already expired, we start the 14 days from 'Now'.
    // If it is still active, we add 14 days to the current end date.
    const currentEnd = business.trialEnds ? new Date(business.trialEnds) : new Date()
    const baseDate = currentEnd < new Date() ? new Date() : currentEnd

    const newEnd = new Date(baseDate)
    newEnd.setDate(newEnd.getDate() + 14)

    // 3. Update Database
    await prisma.business.update({
      where: { id: businessId },
      data: {
        trialEnds: newEnd,
        isTrialActive: true // Reactivate trial if it was expired
      }
    })

    return NextResponse.json({ success: true, newDate: newEnd })

  } catch (error) {
    console.error("Extend Trial Error:", error)
    return NextResponse.json({ error: "Server Error" }, { status: 500 })
  }
}