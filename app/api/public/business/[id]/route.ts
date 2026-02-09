import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// ✅ FIX: Type 'params' as a Promise
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> } // <--- Change type here
) {
  try {
    const { id } = await params // <--- Await the parameters here
    const businessId = id

    // 1. Fetch Business Profile + Active Deals + Locations
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: {
        locations: true, // ✅ Gets Real Addresses & Lat/Lng for Map
        deals: {
          where: { status: 'ACTIVE' }, // ✅ Only lists ACTIVE offers
          orderBy: { priorityScore: 'desc' }
        }
      }
    })

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 })
    }

    // 2. Remove sensitive data before sending to frontend
    const { password, stripeCustomerId, stripeSubscriptionId, ...publicProfile } = business

    return NextResponse.json({ success: true, business: publicProfile })

    return NextResponse.json({ success: true, business: publicProfile })

  } catch (error) {
    console.error("Business Profile Error:", error)
    return NextResponse.json({ error: "Server Error" }, { status: 500 })
  }
}