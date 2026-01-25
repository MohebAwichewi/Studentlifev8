import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma' // ✅ FIX 1: Use your shared Prisma client

export async function GET(req: Request) {
  try {
    // ✅ FIX 2: Get the Business Email from the URL (e.g., ?email=owner@test.com)
    const { searchParams } = new URL(req.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // 1. Find the Business ID first
    const business = await prisma.business.findUnique({
      where: { email }
    })

    if (!business) {
        return NextResponse.json({ error: "Business not found" }, { status: 404 })
    }

    // 2. Fetch ONLY this business's deals
    const deals = await prisma.deal.findMany({
      where: { 
        businessId: business.id // ✅ FIX 3: Filter by Business ID
      },
      orderBy: { createdAt: 'desc' },
      include: {
        business: {
          select: {
            businessName: true,
            category: true,
          }
        }
      }
    })

    // 3. Format data for Frontend
    const formattedDeals = deals.map(deal => ({
      ...deal,
      // Map 'discountValue' to 'discount' if your frontend expects the old name
      discount: deal.discountValue, 
      businessName: deal.business.businessName,
      businessCategory: deal.business.category
    }))

    return NextResponse.json({ 
      success: true, 
      deals: formattedDeals 
    })

  } catch (error) {
    console.error('Deals List Error:', error)
    return NextResponse.json({ error: 'Failed to fetch deals' }, { status: 500 })
  }
}