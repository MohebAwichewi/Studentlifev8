import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const { businessId } = await req.json()
    const business = await prisma.business.findUnique({ where: { id: businessId } })
    if (!business) return NextResponse.json({ error: "Business not found" }, { status: 404 })

    // Renew Local Trial (Reset Expiry) - Stripe Removed
    if (business.trialEndsAt) {
      const newExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      await prisma.business.update({
        where: { id: businessId },
        data: { trialEndsAt: newExpiry, isSubscribed: true }
      })
      return NextResponse.json({ success: true, message: "Trial reactivated.", currentPeriodEnd: newExpiry.toISOString() })
    }

    return NextResponse.json({ error: "No plan found to renew." }, { status: 400 })

  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Renewal failed" }, { status: 500 })
  }
}