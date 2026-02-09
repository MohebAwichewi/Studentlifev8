import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    // 1. Get Real Data from Request
    const { title, description, discount, businessId, category, expiry, image } = await req.json()

    // 2. Fetch Business & Deal Count
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: {
        _count: {
          select: { deals: true } // Efficiently count existing deals
        }
      }
    })

    if (!business) {
      return NextResponse.json({ error: "Business account not found." }, { status: 404 })
    }

    // --- 🛑 REAL TRIAL & LIMIT LOGIC 🛑 ---

    const now = new Date()
    const trialDate = new Date(business.trialEndsAt)
    const isTrialActive = trialDate > now
    const isSubscribed = business.isSubscribed
    const activeDealsCount = business._count.deals

    // Logic: 
    // If Trial is EXPIRED AND User is NOT Subscribed...
    if (!isTrialActive && !isSubscribed) {
      // ... Check if they already have 1 or more deals.
      if (activeDealsCount >= 1) {
        return NextResponse.json({
          error: "Free trial expired. You are limited to 1 active deal. Please upgrade to post more."
        }, { status: 403 }) // 403 Forbidden
      }
    }

    // 3. Create the Deal (If passed checks)
    const newDeal = await prisma.deal.create({
      data: {
        title,
        description,
        discountValue: discount,
        businessId: business.id,
        image: image || null, // Use real image URL from frontend or null
        category: category || "General",
        expiry: expiry || new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(), // Default 1 year if empty
        status: 'ACTIVE', // ✅ Immediate Visibility
        isMultiUse: true
      }
    })

    return NextResponse.json({ success: true, deal: newDeal })

  } catch (error) {
    console.error("Create Deal Error:", error)
    return NextResponse.json({ error: "Failed to create deal." }, { status: 500 })
  }
}